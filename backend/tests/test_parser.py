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

def test_extract_text_image():
    from unittest.mock import MagicMock, patch
    
    mock_client_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is a parsed human body scan text report."
    mock_client_instance.models.generate_content.return_value = mock_response
    
    with patch("google.genai.Client", return_value=mock_client_instance) as mock_client_cls:
        extracted = extract_text(b"fake_image_bytes", "scan_report.png")
        assert extracted == "This is a parsed human body scan text report."
        mock_client_cls.assert_called_once()

def test_extract_text_pdf_fallback():
    from unittest.mock import MagicMock, patch
    
    mock_client_instance = MagicMock()
    mock_response = MagicMock()
    mock_response.text = "This is a scanned PDF report parsed via Gemini OCR."
    mock_client_instance.models.generate_content.return_value = mock_response
    
    with patch("google.genai.Client", return_value=mock_client_instance) as mock_client_cls:
        # Pass fake bytes which will fail both pdfplumber and PyPDF2, triggering OCR
        extracted = extract_text(b"fake_pdf_bytes", "scanned_report.pdf")
        assert extracted == "This is a scanned PDF report parsed via Gemini OCR."
        mock_client_cls.assert_called_once()

