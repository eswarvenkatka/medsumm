from fastapi import APIRouter, Depends, HTTPException, status
from app.utils.auth import get_admin_user
from app.services.firebase_service import db

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
            
            summary = data.get("summary", {})
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
