from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from app.config import settings
import uuid
import os

COLLECTION_NAME = "medsumm_documents"

def _clear_local_lock():
    """Remove stale lock file left by a previous crashed process."""
    lock_path = os.path.join("local_qdrant_db", ".lock")
    if os.path.exists(lock_path):
        try:
            os.remove(lock_path)
            print("Cleared stale Qdrant local DB lock file.")
        except Exception as lock_err:
            print(f"Could not remove lock file: {lock_err}")

def _get_local_client():
    """Try to open local Qdrant DB, clearing stale lock if needed."""
    _clear_local_lock()
    return QdrantClient(path="local_qdrant_db")

# Initialize client — prefer Cloud, fallback to local, then None
_qclient: QdrantClient | None = None
_initialized: bool = False

def get_qdrant_client() -> QdrantClient | None:
    """Lazily initialize and return the Qdrant client."""
    global _qclient, _initialized
    if _initialized:
        return _qclient
        
    try:
        if settings.QDRANT_URL and settings.QDRANT_API_KEY:
            try:
                client = QdrantClient(
                    url=settings.QDRANT_URL,
                    api_key=settings.QDRANT_API_KEY,
                    check_compatibility=False,  # Skip version check — avoids warnings with newer client
                )
                # Test connection & permission
                client.get_collections()
                _qclient = client
                print("Connected to Qdrant Cloud successfully.")
            except Exception as e:
                print(f"Warning: Qdrant Cloud connection failed ({e}). Falling back to local persistent database.")
                _qclient = _get_local_client()
                print("Using local Qdrant database.")
        else:
            print("Qdrant Cloud URL/Key not configured. Using local persistent database.")
            _qclient = _get_local_client()
    except Exception as local_err:
        print(f"ERROR: Local Qdrant DB also failed ({local_err}). Vector search will be unavailable.")
        _qclient = None

    _initialized = True
    return _qclient

def ensure_collection():
    """
    Ensures that the Qdrant collection exists and has correct dimensions for Gemini embeddings.
    """
    client = get_qdrant_client()
    if client is None:
        print("Qdrant client unavailable — skipping collection check.")
        return
    try:
        collections = client.get_collections().collections
        exists = any(c.name == COLLECTION_NAME for c in collections)
        if not exists:
            client.create_collection(
                collection_name=COLLECTION_NAME,
                vectors_config=qmodels.VectorParams(
                    size=768,  # Gemini text-embedding-004 dimension
                    distance=qmodels.Distance.COSINE
                )
            )
            print(f"Created Qdrant collection: {COLLECTION_NAME}")
    except Exception as e:
        print(f"Error ensuring Qdrant collection: {e}")

def insert_document_chunks(user_id: str, doc_id: str, chunks: list[str], embeddings: list[list[float]]):
    """
    Inserts chunks into Qdrant vector database.
    Raises RuntimeError if Qdrant is unavailable so the caller can handle it.
    """
    client = get_qdrant_client()
    if client is None:
        raise RuntimeError("Qdrant client is unavailable. Check your QDRANT_URL and QDRANT_API_KEY in .env.")

    ensure_collection()
    points = []
    for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
        point_id = str(uuid.uuid4())
        points.append(
            qmodels.PointStruct(
                id=point_id,
                vector=embedding,
                payload={
                    "user_id": user_id,
                    "doc_id": doc_id,
                    "chunk_text": chunk,
                    "chunk_index": idx
                }
            )
        )

    try:
        client.upsert(
            collection_name=COLLECTION_NAME,
            points=points
        )
    except Exception as e:
        raise RuntimeError(f"Failed to upsert vectors to Qdrant: {e}")

def search_relevant_chunks(user_id: str, doc_id: str, query_vector: list[float], limit: int = 5) -> list[str]:
    """
    Searches Qdrant for chunks relevant to the query vector, filtered by user_id and doc_id.
    Returns empty list if Qdrant is unavailable.
    """
    client = get_qdrant_client()
    if client is None:
        print("Qdrant client unavailable — returning empty search results.")
        return []

    ensure_collection()
    try:
        search_result = client.query_points(
            collection_name=COLLECTION_NAME,
            query=query_vector,
            query_filter=qmodels.Filter(
                must=[
                    qmodels.FieldCondition(
                        key="user_id",
                        match=qmodels.MatchValue(value=user_id)
                    ),
                    qmodels.FieldCondition(
                        key="doc_id",
                        match=qmodels.MatchValue(value=doc_id)
                    )
                ]
            ),
            limit=limit
        )
        return [hit.payload["chunk_text"] for hit in search_result.points if "chunk_text" in hit.payload]
    except Exception as e:
        print(f"Error searching Qdrant: {e}")
        return []
