from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import uuid
from datetime import datetime
from app.utils.auth import get_admin_user
from app.services.firebase_service import db

router = APIRouter(prefix="/api/admin", tags=["admin_crud"])

# Define generic models for validation/documentation
class DoctorModel(BaseModel):
    name: str
    photo: Optional[str] = ""
    qualification: str
    specialization: str
    experience: str
    hospital: str
    city: str
    contact_number: str
    email: str
    consultation_fee: float
    about_doctor: str

class HospitalModel(BaseModel):
    hospital_name: str
    logo: Optional[str] = ""
    address: str
    departments: str
    emergency_contact: str
    working_hours: str
    google_maps_link: Optional[str] = ""

class ArticleModel(BaseModel):
    title: str
    category: str
    thumbnail: Optional[str] = ""
    description: str
    full_content: str
    author: str
    publish_date: Optional[str] = ""

class GenericCmsModel(BaseModel):
    name: str  # maps to Term, Question, Name, Test Name, etc.
    content: str  # maps to Explanation, Answer, Definition, Description, etc.
    extra_data: Optional[Dict[str, Any]] = None

# --- WEBSITE SETTINGS ---
@router.get("/settings")
def get_website_settings(admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        doc = db.collection("settings").document("website").get()
        if doc.exists:
            return doc.to_dict()
        # Default settings if none exist
        return {
            "website_name": "MedSumm AI",
            "logo": "",
            "contact_information": "+1 (555) 019-2834",
            "email": "support@medsumm.ai",
            "social_media_links": {
                "twitter": "https://twitter.com/medsummai",
                "linkedin": "https://linkedin.com/company/medsummai"
            },
            "footer": "© 2026 MedSumm AI. All rights reserved.",
            "about_page_content": "Premium clinical document summarization and patient-first medical intelligence."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/settings")
def update_website_settings(payload: Dict[str, Any], admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        db.collection("settings").document("website").set(payload)
        return {"status": "success", "settings": payload}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- DOCTORS CRUD ---
@router.get("/doctors")
def list_doctors(admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        docs = db.collection("doctors").get()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/doctors")
def create_doctor(payload: DoctorModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        doc_id = str(uuid.uuid4())
        data = payload.dict()
        data["id"] = doc_id
        data["created_at"] = datetime.utcnow().isoformat()
        db.collection("doctors").document(doc_id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/doctors/{id}")
def update_doctor(id: str, payload: DoctorModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        data = payload.dict()
        data["id"] = id
        data["updated_at"] = datetime.utcnow().isoformat()
        db.collection("doctors").document(id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/doctors/{id}")
def delete_doctor(id: str, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        db.collection("doctors").document(id).delete()
        return {"status": "success", "message": f"Doctor {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- HOSPITALS CRUD ---
@router.get("/hospitals")
def list_hospitals(admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        docs = db.collection("hospitals").get()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/hospitals")
def create_hospital(payload: HospitalModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        hospital_id = str(uuid.uuid4())
        data = payload.dict()
        data["id"] = hospital_id
        data["created_at"] = datetime.utcnow().isoformat()
        db.collection("hospitals").document(hospital_id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/hospitals/{id}")
def update_hospital(id: str, payload: HospitalModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        data = payload.dict()
        data["id"] = id
        data["updated_at"] = datetime.utcnow().isoformat()
        db.collection("hospitals").document(id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/hospitals/{id}")
def delete_hospital(id: str, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        db.collection("hospitals").document(id).delete()
        return {"status": "success", "message": f"Hospital {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- MEDICAL ARTICLES CRUD ---
@router.get("/articles")
def list_articles(admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        docs = db.collection("articles").get()
        return [doc.to_dict() for doc in docs]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/articles")
def create_article(payload: ArticleModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        article_id = str(uuid.uuid4())
        data = payload.dict()
        data["id"] = article_id
        if not data.get("publish_date"):
            data["publish_date"] = datetime.utcnow().strftime("%Y-%m-%d")
        data["created_at"] = datetime.utcnow().isoformat()
        db.collection("articles").document(article_id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/articles/{id}")
def update_article(id: str, payload: ArticleModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        data = payload.dict()
        data["id"] = id
        if not data.get("publish_date"):
            data["publish_date"] = datetime.utcnow().strftime("%Y-%m-%d")
        data["updated_at"] = datetime.utcnow().isoformat()
        db.collection("articles").document(id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/articles/{id}")
def delete_article(id: str, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        db.collection("articles").document(id).delete()
        return {"status": "success", "message": f"Article {id} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# --- MEDICAL INFORMATION CMS CRUD (Unified Endpoint by Type) ---
# Supported types: diseases, symptoms, medicines, terminology, lab_tests, preventive_care, emergency_info, faqs
@router.get("/medical-info/{info_type}")
def list_medical_info(info_type: str, search: Optional[str] = None, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        collection_name = f"cms_{info_type}"
        docs = db.collection(collection_name).get()
        items = [doc.to_dict() for doc in docs]
        
        # Apply simple in-memory search filter if search parameter is present
        if search:
            search_lower = search.lower()
            items = [
                item for item in items 
                if search_lower in item.get("name", "").lower() or search_lower in item.get("content", "").lower()
            ]
        return items
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/medical-info/{info_type}")
def create_medical_info(info_type: str, payload: GenericCmsModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        collection_name = f"cms_{info_type}"
        item_id = str(uuid.uuid4())
        data = payload.dict()
        data["id"] = item_id
        data["created_at"] = datetime.utcnow().isoformat()
        db.collection(collection_name).document(item_id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/medical-info/{info_type}/{id}")
def update_medical_info(info_type: str, id: str, payload: GenericCmsModel, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        collection_name = f"cms_{info_type}"
        data = payload.dict()
        data["id"] = id
        data["updated_at"] = datetime.utcnow().isoformat()
        db.collection(collection_name).document(id).set(data)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/medical-info/{info_type}/{id}")
def delete_medical_info(info_type: str, id: str, admin_user: dict = Depends(get_admin_user)):
    if db is None:
        raise HTTPException(status_code=503, detail="Database offline.")
    try:
        collection_name = f"cms_{info_type}"
        db.collection(collection_name).document(id).delete()
        return {"status": "success", "message": f"CMS entry {id} of type {info_type} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
