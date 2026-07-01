import json
from datetime import datetime
from app.services.embedding_service import get_embedding, get_embeddings
from app.services.qdrant_service import insert_document_chunks, search_relevant_chunks
from app.services.gemini_service import answer_rag_query
from app.utils.text_splitter import split_text

def process_and_index_document(user_id: str, doc_id: str, text: str):
    """
    Splits the document text, generates embeddings, and inserts them into Qdrant.
    """
    chunks = split_text(text)
    if not chunks:
        raise ValueError("Document text is empty after splitting.")
    
    embeddings = get_embeddings(chunks)
    insert_document_chunks(user_id, doc_id, chunks, embeddings)
    return len(chunks)

def query_rag(user_id: str, doc_id: str, queryText: str, default_context: str = "") -> str:
    """
    Performs RAG by retrieving relevant chunks and passing them to Gemini to answer the query.
    """
    query_vector = get_embedding(queryText)
    context_chunks = search_relevant_chunks(user_id, doc_id, query_vector, limit=4)
    
    if not context_chunks:
        context_chunks = [default_context] if default_context else ["No relevant context found in document."]
        
    return answer_rag_query(queryText, context_chunks)
