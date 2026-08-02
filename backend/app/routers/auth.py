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
        
        is_admin_email = email == "esw28351@gmail.com"
        role = "admin" if is_admin_email else "user"
        
        if not user_doc.exists:
            user_data = {
                "uid": uid,
                "email": email,
                "name": name,
                "role": role,
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat()
            }
            user_ref.set(user_data)
            try:
                from firebase_admin import auth as firebase_auth
                firebase_auth.set_custom_user_claims(uid, {"admin": is_admin_email})
            except Exception as claim_err:
                print(f"Failed to set custom claims on creation: {claim_err}")
            return {"status": "created", "user": user_data}
        else:
            user_data = user_doc.to_dict()
            # Auto-promote if they have admin email but don't have the admin role in DB yet
            if is_admin_email and user_data.get("role") != "admin":
                user_data["role"] = "admin"
                user_data["updated_at"] = datetime.utcnow().isoformat()
                user_ref.update({"role": "admin", "updated_at": user_data["updated_at"]})
                try:
                    from firebase_admin import auth as firebase_auth
                    firebase_auth.set_custom_user_claims(uid, {"admin": True})
                except Exception as claim_err:
                    print(f"Failed to set custom claims on update: {claim_err}")
            return {"status": "synced", "user": user_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to sync user: {str(e)}"
        )
