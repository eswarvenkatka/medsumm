from datetime import datetime
from app.services.firebase_service import db

def save_document_summary(user_id: str, doc_id: str, filename: str, file_url: str, text_length: int, chunk_count: int, summary: dict):
    """
    Saves the document metadata and its generated summary to Firestore.
    """
    if db is None:
        return None
    
    doc_data = {
        "id": doc_id,
        "user_id": user_id,
        "filename": filename,
        "cloudinary_url": file_url,
        "uploaded_at": datetime.utcnow().isoformat(),
        "summary": summary,
        "text_length": text_length,
        "chunk_count": chunk_count
    }
    
    db.collection("documents").document(doc_id).set(doc_data)
    
    # Save a separate log in activity_logs
    log_activity(user_id, f"Uploaded and summarized document: {filename}")
    
    return doc_data

def log_activity(user_id: str, action: str):
    """
    Logs an activity to the activity_logs collection.
    """
    if db is None:
        return
    
    log_ref = db.collection("activity_logs").document()
    log_ref.set({
        "logId": log_ref.id,
        "userId": user_id,
        "action": action,
        "timestamp": datetime.utcnow().isoformat()
    })
