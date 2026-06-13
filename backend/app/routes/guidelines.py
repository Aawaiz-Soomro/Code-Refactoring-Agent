from fastapi import APIRouter, BackgroundTasks, HTTPException
from app.db.supabase_client import get_supabase_client
from app.rag.ingestion import ingest_directory

router = APIRouter()

@router.get("/guidelines")
async def list_guidelines():
    """Retrieves all guidelines currently stored in Supabase (excluding embeddings)."""
    supabase = get_supabase_client()
    try:
        # Select all fields except the embedding vector (for speed and size)
        res = supabase.table("knowledge_documents") \
                      .select("id, title, source_file, content, chunk_index, created_at") \
                      .order("source_file", desc=False) \
                      .order("chunk_index", desc=False) \
                      .execute()
        return res.data if res.data else []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch guidelines: {str(e)}")

@router.post("/guidelines/ingest")
async def trigger_ingestion(background_tasks: BackgroundTasks):
    """Triggers background ingestion of documents from the knowledge_base folder."""
    try:
        background_tasks.add_task(ingest_directory)
        return {"message": "Ingestion triggered successfully in the background."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to trigger ingestion: {str(e)}")
