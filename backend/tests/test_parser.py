import pytest
import io
import docx
from app.services.document_parser import parse_docx, extract_text

def test_extract_text_docx():
    # Create a simple DOCX file in memory
    doc = docx.Document()
    doc.add_paragraph("Hello from MedSumm DOCX parser unit test!")
    
    docx_io = io.BytesIO()
    doc.save(docx_io)
    docx_bytes = docx_io.getvalue()
    
    extracted = parse_docx(docx_bytes)
    assert "MedSumm DOCX parser" in extracted
    
    # Test router wrapper
    wrapped_extracted = extract_text(docx_bytes, "test_report.docx")
    assert "Hello from MedSumm DOCX parser" in wrapped_extracted
