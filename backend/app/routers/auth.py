from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_current_user
from app.services.firebase_service import db
from datetime import datetime

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/sync")
def sync_user(current_user: dict = Depends(get_current_user)):
    """
    Syncs the authenticated Firebase user to the Firestore users collection.
    """
    uid = current_user.get("uid")
    email = current_user.get("email")
    name = current_user.get("name", email.split("@")[0] if email else "User")
    
    if db is None:
        return {"status": "success", "message": "Token verified, Firestore offline."}
        
    try:
        user_ref = db.collection("users").document(uid)
        user_doc = user_ref.get()
        
        if not user_doc.exists:
            user_data = {
                "uid": uid,
                "email": email,
                "name": name,
                "role": "user",
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            user_ref.set(user_data)
            return {"status": "created", "user": user_data}
        else:
            user_data = user_doc.to_dict()
            return {"status": "synced", "user": user_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync user: {str(e)}"
        )
