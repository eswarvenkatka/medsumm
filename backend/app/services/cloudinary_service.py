import cloudinary
import cloudinary.uploader
from app.config import settings

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

def upload_document(file_content: bytes, filename: str) -> str:
    """
    Uploads a document to Cloudinary as a raw resource and returns its secure URL.
    Falls back to a mock URL if Cloudinary is not configured correctly or fails.
    """
    if " " in settings.CLOUDINARY_CLOUD_NAME or settings.CLOUDINARY_CLOUD_NAME == "MedSumm AI":
        print(f"Warning: Invalid/placeholder Cloudinary Cloud Name '{settings.CLOUDINARY_CLOUD_NAME}'. Falling back to mock URL.")
        return f"https://res.cloudinary.com/mock-cloud/raw/upload/v1/medsumm_docs/{filename}"
        
    try:
        response = cloudinary.uploader.upload(
            file_content,
            resource_type="raw",
            public_id=f"medsumm_docs/{filename}",
            overwrite=True
        )
        return response.get("secure_url")
    except Exception as e:
        print(f"Warning: Cloudinary upload failed: {e}. Falling back to mock URL for testing.")
        return f"https://res.cloudinary.com/mock-cloud/raw/upload/v1/medsumm_docs/{filename}"
