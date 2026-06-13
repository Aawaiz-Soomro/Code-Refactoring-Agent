import asyncio
from uuid import uuid4
from fastapi import APIRouter, HTTPException
from app.models import RefactorRequest, RefactorResponse
from app.pipeline.event_bus import QueueEventBus
from app.pipeline.sessions import active_sessions
from app.pipeline.orchestrator import PipelineOrchestrator

router = APIRouter()

@router.post("/refactor", response_model=RefactorResponse)
async def trigger_refactor(request: RefactorRequest):
    """
    Submits a refactoring request. Spawns the pipeline orchestrator in the
    background and returns a unique session_id immediately.
    """
    session_id = str(uuid4())
    
    # 1. Create a QueueEventBus for this session
    event_bus = QueueEventBus()
    active_sessions[session_id] = event_bus
    
    # 2. Spawn the orchestrator run task in the background
    orchestrator = PipelineOrchestrator()
    
    async def run_pipeline():
        try:
            await orchestrator.run(
                session_id=session_id,
                raw_code=request.code,
                language=request.language,
                max_loops=request.max_loops,
                event_bus=event_bus
            )
        except Exception as e:
            print(f"[Refactor Route] Pipeline error: {e}")
            # Ensure an error event is pushed to the queue so the client knows it failed
            try:
                await event_bus.emit("error", {"message": f"Execution error: {str(e)}"})
            except Exception:
                pass
                
    asyncio.create_task(run_pipeline())
    
    return RefactorResponse(session_id=session_id)
