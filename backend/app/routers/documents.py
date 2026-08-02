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
from app.services.gemini_service import generate_medical_summary, answer_rag_query, generate_patient_plan
from app.services.qdrant_service import insert_document_chunks, search_relevant_chunks

router = APIRouter(prefix="/api/documents", tags=["documents"])

class AppointmentBooking(BaseModel):
    doctor_id: str
    doctor_name: str
    specialization: str
    booking_date: str
    booking_time: str

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
    if ext not in ["pdf", "docx", "doc", "txt", "png", "jpg", "jpeg", "webp"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported file format. Please upload a PDF, DOCX, TXT, or Image (PNG, JPG, JPEG, WEBP) file."
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

@router.get("/all-doctors")
def list_doctors_all(current_user: dict = Depends(get_current_user)):
    """
    Returns a list of all registered doctors.
    """
    if db is None:
        return []
    try:
        docs = db.collection("doctors").get()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch doctors: {str(e)}")


@router.post("/appointments/book")
def book_appointment(payload: AppointmentBooking, current_user: dict = Depends(get_current_user)):
    """
    Saves an appointment booking in the database.
    """
    user_id = current_user.get("uid")
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        booking_id = str(uuid.uuid4())
        data = payload.dict()
        data["id"] = booking_id
        data["user_id"] = user_id
        data["patient_email"] = current_user.get("email", "")
        data["patient_name"] = current_user.get("name", "Patient")
        data["status"] = "Confirmed"
        data["created_at"] = datetime.utcnow().isoformat()
        db.collection("appointments").document(booking_id).set(data)
        return {"status": "success", "booking": data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save booking: {str(e)}")


@router.get("/appointments/my-bookings")
def my_bookings(current_user: dict = Depends(get_current_user)):
    """
    Lists all appointment bookings made by the logged-in user.
    """
    user_id = current_user.get("uid")
    if db is None:
        return []
    try:
        bookings = db.collection("appointments").where("user_id", "==", user_id).get()
        result = [b.to_dict() for b in bookings]
        result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return result
    except Exception as e:
        return []


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
    is_admin = current_user.get("email") == "esw28351@gmail.com"
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
    is_admin = current_user.get("email") == "esw28351@gmail.com"
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
    is_admin = current_user.get("email") == "esw28351@gmail.com"
    if doc_data.get("user_id") != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized access.")
        
    try:
        chats = db.collection("documents").document(id).collection("chats").get()
        result = [chat.to_dict() for chat in chats]
        result.sort(key=lambda x: x.get("timestamp", ""))
        return result
    except Exception as e:
        return []


@router.get("/{id}/patient-plan")
def get_patient_plan(id: str, current_user: dict = Depends(get_current_user)):
    """
    Generates a personalized patient plan from the document summary using Gemini.
    """
    user_id = current_user.get("uid")
    if db is None:
        raise HTTPException(status_code=503, detail="Database connection offline.")
        
    doc_ref = db.collection("documents").document(id).get()
    if not doc_ref.exists:
        raise HTTPException(status_code=404, detail="Document not found.")
        
    doc_data = doc_ref.to_dict()
    is_admin = current_user.get("email") == "esw28351@gmail.com"
    if doc_data.get("user_id") != user_id and not is_admin:
        raise HTTPException(status_code=403, detail="Unauthorized access.")
        
    # Check if patient plan was already generated and saved on the document
    if "patient_plan" in doc_data:
        return doc_data["patient_plan"]
        
    try:
        # Generate the patient plan using Gemini
        summary_data = doc_data.get("summary")
        if not isinstance(summary_data, dict):
            summary_data = {}
        plan = generate_patient_plan(summary_data)
        
        # Save it to the document metadata so we don't have to re-generate it next time
        db.collection("documents").document(id).update({"patient_plan": plan})
        
        return plan
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate patient plan: {str(e)}"
        )
