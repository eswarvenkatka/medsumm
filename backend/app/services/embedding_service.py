from langchain_google_genai import GoogleGenerativeAIEmbeddings
from app.config import settings

# Initialize Embeddings Client using Google's gemini-embedding-001
embeddings_client = GoogleGenerativeAIEmbeddings(
    model="models/gemini-embedding-001",
    google_api_key=settings.GEMINI_API_KEY
)

def get_embeddings(texts: list[str]) -> list[list[float]]:
    """
    Generates text embeddings using models/gemini-embedding-001.
    """
    try:
        return embeddings_client.embed_documents(texts)
    except Exception as e:
        print(f"Error generating embeddings: {e}")
        raise RuntimeError(f"Failed to generate embeddings: {e}")

def get_embedding(text: str) -> list[float]:
    """
    Generates single text embedding.
    """
    try:
        return embeddings_client.embed_query(text)
    except Exception as e:
        print(f"Error generating query embedding: {e}")
        raise RuntimeError(f"Failed to generate query embedding: {e}")
