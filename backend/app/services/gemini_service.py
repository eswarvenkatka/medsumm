import json
import time
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage
from app.config import settings

def invoke_llm_with_fallback(messages, temperature=0.1) -> str:
    """
    Invokes the LLM using a fallback list of models to handle temporary 503 or 429 rate limit errors.
    """
    models = ["gemini-2.5-flash", "gemini-2.5-flash-lite", "gemini-2.0-flash"]
    last_err = None
    
    for model_name in models:
        try:
            llm_client = ChatGoogleGenerativeAI(
                model=model_name,
                google_api_key=settings.GEMINI_API_KEY,
                temperature=temperature,
                max_retries=2,
                convert_system_message_to_human=True
            )
            response = llm_client.invoke(messages)
            return response.content.strip()
        except Exception as e:
            print(f"Warning: Model {model_name} failed: {e}. Trying fallback...")
            last_err = e
            time.sleep(1)
            
    raise last_err or RuntimeError("All models failed to generate content.")

def generate_medical_summary(document_text: str) -> dict:
    """
    Generates a structured medical summary using Gemini.
    """
    system_prompt = (
        "You are an expert clinical medical assistant. Your task is to analyze the provided medical report "
        "and generate a highly accurate, structured clinical summary. Do not make up information; base everything "
        "strictly on the report text. You must output the response in JSON format matching this schema:\n"
        "{\n"
        '  "patient_info": "Brief summary of patient info (name, age, gender, date, etc. if available) or \\"Not specified\\"",\n'
        '  "chief_complaint": "Primary reason for clinical visit / consultation",\n'
        '  "diagnostic_findings": "Summary of tests, labs, imaging, or physical findings",\n'
        '  "assessment": "Clinical diagnosis, impression, or health status assessment",\n'
        '  "risk_level": "LOW, MEDIUM, or HIGH based on severity of clinical findings",\n'
        '  "recommendations": ["List of next steps, medications, treatments, or follow-ups"],\n'
        '  "glossary": [{"term": "medical term", "explanation": "plain english definition for patient understanding"}]\n'
        "}\n"
        "Return ONLY the raw JSON string. Do not include markdown code block formatting (like ```json)."
    )

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Analyze the following medical report:\n\n{document_text}")
        ]
        content = invoke_llm_with_fallback(messages, temperature=0.1)
        
        # Clean up any potential markdown formatting if returned
        if content.startswith("```json"):
            content = content.replace("```json", "", 1)
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error generating medical summary: {e}")
        return {
            "patient_info": "Error parsing document details.",
            "chief_complaint": "N/A",
            "diagnostic_findings": "Error occurred during summarization.",
            "assessment": str(e),
            "risk_level": "MEDIUM",
            "recommendations": ["Please contact the clinic directly."],
            "glossary": []
        }

def answer_rag_query(query: str, context_chunks: list[str]) -> str:
    """
    Answers a user query based on the retrieved context chunks using RAG.
    """
    context_text = "\n\n---\n\n".join(context_chunks)
    system_prompt = (
        "You are a helpful medical information assistant. Use the provided medical context chunks to answer "
        "the patient's question accurately. Be compassionate, clear, and note any limitations. "
        "If the answer cannot be found in the context, state that clearly and suggest consulting their provider. "
        "Always remind the user that this tool does not replace professional medical advice."
    )
    user_prompt = f"Context from Patient's Medical File:\n{context_text}\n\nPatient's Question: {query}"
    
    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=user_prompt)
        ]
        return invoke_llm_with_fallback(messages, temperature=0.2)
    except Exception as e:
        return f"Error generating answer: {str(e)}"


def generate_patient_plan(summary: dict) -> dict:
    """
    Generates a patient-friendly action plan, roadmap, and recommendations
    based on the document summary using Gemini.
    """
    system_prompt = (
        "You are a compassionate clinical coordinator. Your job is to translate complex clinical findings "
        "into a structured patient recovery/management plan. Based on the provided clinical summary, "
        "identify the main health issue (main problem), explain why it happens, provide clear steps on how to manage/overcome it, "
        "and draft a day-by-day (or phase-by-day, e.g. Day 1, Day 2, etc.) roadmap for the first week of management. "
        "Also, recommend a medical specialty (e.g. Endocrinologist, Cardiologist, Neurologist, General Physician, Pediatrician, etc.) that would "
        "be best suited to treat this problem.\n\n"
        "Output the result in JSON format matching this schema:\n"
        "{\n"
        '  "main_problem": "A simple, clear patient-friendly description of the main medical issue",\n'
        '  "why_it_occurs": "A clear, empathetic explanation of why this condition occurs",\n'
        '  "how_to_overcome": "Key actions, lifestyle adjustments, and care management practices the patient should follow to improve",\n'
        '  "roadmap": [\n'
        '     {"day": "Day 1-2 (example)", "instructions": "What the patient should do"},\n'
        '     {"day": "Day 3-4 (example)", "instructions": "What the patient should do"},\n'
        '     {"day": "Day 5-7 (example)", "instructions": "What the patient should do"}\n'
        '  ],\n'
        '  "recommended_specialty": "The single most appropriate specialist name (e.g., Endocrinologist, Cardiologist, General Physician)"\n'
        "}\n"
        "Return ONLY the raw JSON string. Do not include markdown code block formatting (like ```json)."
    )

    try:
        messages = [
            SystemMessage(content=system_prompt),
            HumanMessage(content=f"Clinical Summary Data:\n\n{json.dumps(summary, indent=2)}")
        ]
        content = invoke_llm_with_fallback(messages, temperature=0.2)
        
        # Clean up any potential markdown formatting if returned
        if content.startswith("```json"):
            content = content.replace("```json", "", 1)
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        
        return json.loads(content)
    except Exception as e:
        print(f"Error generating patient plan: {e}")
        return {
            "main_problem": "Unable to load patient plan details.",
            "why_it_occurs": "Data extraction error.",
            "how_to_overcome": "Please consult your primary care doctor.",
            "roadmap": [],
            "recommended_specialty": "General Physician"
        }
