import io
import pdfplumber
from PyPDF2 import PdfReader
import docx

def parse_pdf(file_bytes: bytes) -> str:
    """
    Parses PDF bytes and extracts text.
    Uses pdfplumber as primary, falls back to PyPDF2.
    """
    text = ""
    try:
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"pdfplumber failed, falling back to PyPDF2: {e}")
        try:
            reader = PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
        except Exception as fallback_err:
            raise RuntimeError(f"Failed to parse PDF file: {fallback_err}")
            
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
    else:
        raise ValueError("Unsupported file format. Only PDF, DOCX, and TXT are supported.")
