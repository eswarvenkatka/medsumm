from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_admin_user
from app.services.firebase_service import db
from typing import Dict, Any, List
from datetime import datetime
from firebase_admin import auth
from app.services.qdrant_service import delete_document_chunks

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/stats")
def get_admin_stats(admin_user: dict = Depends(get_admin_user)):
    """
    Computes global metrics for the admin dashboard.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
        
    try:
        users = db.collection("users").get()
        user_count = len(users)
        
        docs = db.collection("documents").get()
        doc_count = len(docs)
        
        high_risk = 0
        medium_risk = 0
        low_risk = 0
        total_chunks = 0
        
        recent_uploads = []
        for d in docs:
            data = d.to_dict()
            total_chunks += data.get("chunk_count", 0)
            
            summary = data.get("summary")
            if not isinstance(summary, dict):
                summary = {}
            risk = str(summary.get("risk_level", "LOW")).upper()
            if "HIGH" in risk:
                high_risk += 1
            elif "MEDIUM" in risk:
                medium_risk += 1
            else:
                low_risk += 1
                
            recent_uploads.append({
                "id": data.get("id"),
                "filename": data.get("filename"),
                "uploaded_at": data.get("uploaded_at"),
                "user_id": data.get("user_id"),
                "risk_level": risk
            })
            
        recent_uploads.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        
        return {
            "total_users": user_count,
            "total_documents": doc_count,
            "total_chunks_indexed": total_chunks,
            "risk_distribution": {
                "high": high_risk,
                "medium": medium_risk,
                "low": low_risk
            },
            "recent_uploads": recent_uploads[:10]
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to aggregate statistics: {str(e)}"
        )

@router.get("/summaries")
def get_all_summaries(admin_user: dict = Depends(get_admin_user)):
    """
    Returns all summaries generated on the platform for admin auditing.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
        
    try:
        docs = db.collection("documents").get()
        result = []
        for d in docs:
            data = d.to_dict()
            result.append({
                "id": data.get("id"),
                "filename": data.get("filename"),
                "uploaded_at": data.get("uploaded_at"),
                "summary": data.get("summary"),
                "user_id": data.get("user_id")
            })
        result.sort(key=lambda x: x.get("uploaded_at", ""), reverse=True)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load document audit list: {str(e)}"
        )

@router.get("/users")
def list_users(admin_user: dict = Depends(get_admin_user)):
    """
    Returns lists of all registered users.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        users_ref = db.collection("users").get()
        return [doc.to_dict() for doc in users_ref]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch users list: {str(e)}"
        )

@router.put("/users/{uid}")
def update_user(uid: str, payload: Dict[str, Any], admin_user: dict = Depends(get_admin_user)):
    """
    Updates a user's details and custom role claims.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        user_ref = db.collection("users").document(uid)
        if not user_ref.get().exists:
            raise HTTPException(status_code=404, detail="User not found")
        
        update_data = {}
        if "role" in payload:
            update_data["role"] = payload["role"]
        if "name" in payload:
            update_data["name"] = payload["name"]
            
        if update_data:
            update_data["updated_at"] = datetime.utcnow().isoformat()
            user_ref.update(update_data)
            
        if "role" in payload:
            try:
                auth.set_custom_user_claims(uid, {"admin": payload["role"] == "admin"})
            except Exception as claim_err:
                print(f"Failed to set custom claims for user {uid}: {claim_err}")
                
        return {"status": "success", "user": update_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user profile: {str(e)}"
        )

@router.delete("/users/{uid}")
def delete_user(uid: str, admin_user: dict = Depends(get_admin_user)):
    """
    Completely purges a user: deletes from Firebase Auth, Firestore users,
    and removes all associated documents from Firestore & Qdrant.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        # 1. Delete from Firebase Auth
        try:
            auth.delete_user(uid)
        except Exception as auth_err:
            print(f"Warning: Failed to delete user {uid} from Firebase Auth: {auth_err}")
            
        # 2. Find and delete all user documents
        docs = db.collection("documents").where("user_id", "==", uid).get()
        for doc in docs:
            doc_id = doc.id
            # Delete Qdrant vectors
            try:
                delete_document_chunks(doc_id)
            except Exception as q_err:
                print(f"Failed to delete Qdrant vectors for doc {doc_id}: {q_err}")
            
            # Delete chats subcollection
            chats_ref = db.collection("documents").document(doc_id).collection("chats")
            chats = chats_ref.get()
            for chat in chats:
                chats_ref.document(chat.id).delete()
                
            # Delete document metadata
            db.collection("documents").document(doc_id).delete()
            
        # 3. Delete from Firestore users collection
        db.collection("users").document(uid).delete()
        
        return {"status": "success", "message": f"User {uid} and all associated data deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user and records: {str(e)}"
        )

@router.delete("/documents/{doc_id}")
def delete_document_admin(doc_id: str, admin_user: dict = Depends(get_admin_user)):
    """
    Deletes a specific document summary and its vector chunks.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        doc_ref = db.collection("documents").document(doc_id)
        if not doc_ref.get().exists:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # Delete Qdrant vectors
        try:
            delete_document_chunks(doc_id)
        except Exception as q_err:
            print(f"Failed to delete Qdrant vectors for doc {doc_id}: {q_err}")
            
        # Delete chats subcollection
        chats_ref = doc_ref.collection("chats")
        chats = chats_ref.get()
        for chat in chats:
            chats_ref.document(chat.id).delete()
            
        # Delete document metadata
        doc_ref.delete()
        
        return {"status": "success", "message": f"Document {doc_id} deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )

# --- APPOINTMENTS APIS ---
import uuid

@router.post("/appointment/book")
def book_appointment_public(payload: Dict[str, Any]):
    """
    Public endpoint enabling patients to book an appointment.
    Saves to the configured Firestore/local database.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        app_id = str(uuid.uuid4())
        appointment_data = {
            "id": app_id,
            "name": payload.get("name"),
            "email": payload.get("email"),
            "phone": payload.get("phone"),
            "department": payload.get("department"),
            "doctor": payload.get("doctor"),
            "date": payload.get("date"),
            "time": payload.get("time"),
            "notes": payload.get("notes", ""),
            "status": "pending",
            "created_at": datetime.utcnow().isoformat()
        }
        db.collection("appointments").document(app_id).set(appointment_data)
        return {"status": "success", "appointment": appointment_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to book appointment: {str(e)}"
        )

@router.get("/appointments")
def list_appointments(admin_user: dict = Depends(get_admin_user)):
    """
    Admin-only endpoint to list all scheduled appointments.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        appointments = db.collection("appointments").get()
        result = [doc.to_dict() for doc in appointments]
        # Sort by created_at descending
        result.sort(key=lambda x: x.get("created_at", ""), reverse=True)
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch appointments: {str(e)}"
        )

@router.put("/appointments/{appointment_id}")
def update_appointment(appointment_id: str, payload: Dict[str, Any], admin_user: dict = Depends(get_admin_user)):
    """
    Admin-only endpoint to update appointment status (e.g. confirm, complete, cancel).
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        app_ref = db.collection("appointments").document(appointment_id)
        if not app_ref.get().exists:
            raise HTTPException(status_code=404, detail="Appointment not found")
        
        update_data = {}
        if "status" in payload:
            update_data["status"] = payload["status"]
        if "notes" in payload:
            update_data["notes"] = payload["notes"]
            
        if update_data:
            app_ref.update(update_data)
            
        return {"status": "success", "appointment": app_ref.get().to_dict()}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update appointment: {str(e)}"
        )

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: str, admin_user: dict = Depends(get_admin_user)):
    """
    Admin-only endpoint to delete a archived/cancelled appointment.
    """
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        app_ref = db.collection("appointments").document(appointment_id)
        if not app_ref.get().exists:
            raise HTTPException(status_code=404, detail="Appointment not found")
        app_ref.delete()
        return {"status": "success", "message": "Appointment deleted successfully."}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete appointment: {str(e)}"
        )

