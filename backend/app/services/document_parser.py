import io
import pdfplumber
from PyPDF2 import PdfReader
import docx
from google import genai
from google.genai import types
from app.config import settings

def extract_text_with_gemini(file_bytes: bytes, mime_type: str) -> str:
    """
    Extracts text from files (scanned PDFs or image files) using Gemini 2.5 Flash.
    """
    try:
        client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        prompt = (
            "You are an expert medical document parser. Extract all text and clinical information "
            "from this document. Maintain the structural context, tables, key-value pairs, "
            "and numbers accurately. Output ONLY the extracted text content. Do not add any "
            "summaries, comments, markdown tags, or explanations."
        )
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                types.Part.from_bytes(
                    data=file_bytes,
                    mime_type=mime_type,
                ),
                prompt
            ]
        )
        
        return response.text.strip() if response.text else ""
    except Exception as e:
        print(f"Gemini text extraction failed: {e}")
        return ""

def parse_pdf(file_bytes: bytes) -> str:
    """
    Parses PDF bytes and extracts text.
    Uses pdfplumber as primary, falls back to PyPDF2.
    If no text is extracted, uses Gemini OCR.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber failed, trying PyPDF2: {e}")
        
    if not text.strip():
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as fallback_err:
            print(f"PyPDF2 failed: {fallback_err}")
            
    # Fallback to Gemini OCR if no text was extracted
    if not text.strip():
        print("Standard PDF parsing returned empty. Running Gemini OCR...")
        text = extract_text_with_gemini(file_bytes, "application/pdf")
        
    if not text.strip():
        raise RuntimeError("Failed to parse PDF file or extract text via OCR.")
            
    return text.strip()

def parse_docx(file_bytes: bytes) -> str:
    """
    Parses DOCX bytes and extracts text.
    """
    try:
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            full_text.append(para.text)
        return "\n".join(full_text).strip()
    except Exception as e:
        raise RuntimeError(f"Failed to parse DOCX file: {str(e)}")

def extract_text(file_bytes: bytes, filename: str) -> str:
    """
    Extracts text from files based on the file extension.
    """
    ext = filename.split(".")[-1].lower()
    if ext == "pdf":
        return parse_pdf(file_bytes)
    elif ext in ["docx", "doc"]:
        return parse_docx(file_bytes)
    elif ext == "txt":
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception as e:
            raise RuntimeError(f"Failed to parse TXT file: {str(e)}")
    elif ext in ["png", "jpg", "jpeg", "webp"]:
        mime_type = f"image/{ext}" if ext != "jpg" else "image/jpeg"
        text = extract_text_with_gemini(file_bytes, mime_type)
        return text
    else:
        raise ValueError("Unsupported file format. Only PDF, DOCX, TXT, and Images (PNG, JPG, JPEG, WEBP) are supported.")
