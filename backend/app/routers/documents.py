import uuid
import json
from datetime import datetime
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, status
from pydantic import BaseModel
from app.utils.auth import get_current_user
from app.services.firebase_service import db
from app.services.cloudinary_service import upload_document
from app.services.document_parser import extract_text
from app.utils.text_splitter import split_text
from app.services.embedding_service import get_embeddings, get_embedding
from app.services.gemini_service import generate_medical_summary, answer_rag_query
from app.services.qdrant_service import insert_document_chunks, search_relevant_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])

class QueryRequest(BaseModel):
    query: str

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("uid")
    filename = file.filename
    
    # Basic extension validation
    ext = filename.split(".")[-1].lower()
    if ext not in ["pdf", "docx", "doc", "txt"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF, DOCX or TXT file."
        )
        
    try:
        # Read file
        file_bytes = await file.read()
        
        # 1. Parse text from document
        extracted_text = extract_text(file_bytes, filename)
        if not extracted_text.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Extracted text is empty. The document may be empty or contain non-extractable text."
            )
            
        # 2. Upload file to Cloudinary
        cloudinary_url = upload_document(file_bytes, filename)
        
        # 3. Create unique document ID
        doc_id = str(uuid.uuid4())
        
        # 4. Chunk document text
        chunks = split_text(extracted_text)
        
        # 5. Embed text chunks using text-embedding-004
        chunk_embeddings = get_embeddings(chunks)
        
        # 6. Store vectors in Qdrant Cloud
        insert_document_chunks(user_id, doc_id, chunks, chunk_embeddings)
        
        # 7. Generate clinical summary using Gemini 2.5 Flash
        summary = generate_medical_summary(extracted_text)
        
        # 8. Store metadata in Firestore
        doc_metadata = {
            "id": doc_id,
            "user_id": user_id,
            "filename": filename,
            "cloudinary_url": cloudinary_url,
            "uploaded_at": datetime.utcnow().isoformat(),
            "summary": summary,
            "text_length": len(extracted_text),
            "chunk_count": len(chunks)
        }
        
        if db is not None:
            db.collection("documents").document(doc_id).set(doc_metadata)
            
        return doc_metadata
        
    except Exception as e:
        print(f"Error in document upload workflow: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process and index document: {str(e)}"
        )

@router.get("")
def get_user_documents(current_user: dict = Depends(get_current_user)):
    """
    Returns lists of all documents uploaded by the authenticated user.
    """
    user_id = current_user.get("uid")
    if db is None:
        return []
        
    try:
        # Fallback python sorting if index isn't built yet
        docs = db.collection("documents").where("user_id", "==", user_id).get()
        result = [doc.to_dict() for doc in docs]
        result.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database query failed: {str(e)}"
        )

@router.get("/{id}")
def get_document(id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns the metadata and medical summary for a specific document.
    """
    user_id = current_user.get("uid")
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection offline.")
        
    doc_ref = db.collection("documents").document(id).get()
    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc_data = doc_ref.to_dict()
    is_admin = (
        current_user.get("admin") is True or 
        current_user.get("email") == "eswar@medsumm.ai"
    )
    if doc_data.get("user_id") != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized access to document.")
        
    return doc_data

@router.post("/{id}/query")
def query_document(id: str, payload: QueryRequest, current_user: dict = Depends(get_current_user)):
    """
    Performs RAG on a document: embeds the user query, retrieves relevant chunks from Qdrant,
    generates an answer with Gemini, and records the conversation history.
    """
    user_id = current_user.get("uid")
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection offline.")
        
    doc_ref = db.collection("documents").document(id).get()
    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc_data = doc_ref.to_dict()
    is_admin = (
        current_user.get("admin") is True or 
        current_user.get("email") == "eswar@medsumm.ai"
    )
    if doc_data.get("user_id") != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized access to document.")
        
    query = payload.query
    try:
        # 1. Embed query
        query_vector = get_embedding(query)
        
        # 2. Search relevant chunks in Qdrant
        context_chunks = search_relevant_chunks(user_id, id, query_vector, limit=4)
        if not context_chunks:
            # Fallback context is the summary fields if vector database fails or is empty
            context_chunks = [json.dumps(doc_data.get("summary", {}))]
            
        # 3. Answer question via RAG
        answer = answer_rag_query(query, context_chunks)
        
        # 4. Save QA pair in Firestore subcollection
        chat_ref = db.collection("documents").document(id).collection("chats").document()
        chat_data = {
            "id": chat_ref.id,
            "query": query,
            "answer": answer,
            "timestamp": datetime.utcnow().isoformat()
        }
        chat_ref.set(chat_data)
        
        return chat_data
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to query document: {str(e)}"
        )

@router.get("/{id}/chats")
def get_chat_history(id: str, current_user: dict = Depends(get_current_user)):
    """
    Returns the chat conversation history associated with a document.
    """
    user_id = current_user.get("uid")
    if db is None:
        return []
        
    doc_ref = db.collection("documents").document(id).get()
    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc_data = doc_ref.to_dict()
    is_admin = (
        current_user.get("admin") is True or 
        current_user.get("email") == "eswar@medsumm.ai"
    )
    if doc_data.get("user_id") != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized access.")
        
    try:
        chats = db.collection("documents").document(id).collection("chats").get()
        result = [chat.to_dict() for chat in chats]
        result.sort(key=lambda x: x.get("timestamp", ""))
        return result
    except Exception as e:
        return []
