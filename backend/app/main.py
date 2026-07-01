from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import auth, documents, admin, admin_crud

app = FastAPI(
    title="MedSumm AI API",
    description="Backend API for clinical document parsing, RAG indexing, clinical summarization, and query execution.",
    version="1.0.0"
)

# CORS Middlewares to allow Next.js client access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(admin.router)
app.include_router(admin_crud.router)

@app.get("/")
def read_root():
    return {
        "name": "MedSumm AI API",
        "status": "active",
        "version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
