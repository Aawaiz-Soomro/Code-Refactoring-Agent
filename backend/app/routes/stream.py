import json
import asyncio
from fastapi import APIRouter, Request, HTTPException
from sse_starlette.sse import EventSourceResponse
from app.pipeline.sessions import active_sessions

router = APIRouter()

@router.get("/stream/{session_id}")
async def stream_session(request: Request, session_id: str):
    """
    Streams the adversarial loop's logs and results for the given session_id
    using Server-Sent Events (SSE).
    """
    if session_id not in active_sessions:
        raise HTTPException(status_code=404, detail="Session not found or already closed.")

    async def event_generator():
        event_bus = active_sessions.get(session_id)
        if not event_bus:
            yield {"event": "error", "data": json.dumps({"message": "Session context lost."})}
            return

        try:
            while True:
                # Detect client tab closed or navigate away
                if await request.is_disconnected():
                    print(f"[SSE] Client disconnected from session: {session_id}")
                    break

                # Non-blocking fetch of next event from the queue
                try:
                    # Timeout after a while if no events, to prevent infinite hanging
                    event_data = await asyncio.wait_for(event_bus.get(), timeout=60.0)
                except asyncio.TimeoutError:
                    # Send a heartbeat keepalive ping
                    yield {"event": "ping", "data": "keepalive"}
                    continue
                
                # Emit formatted event
                yield {
                    "event": event_data["event"],
                    "data": json.dumps(event_data["data"]),
                    "id": str(event_data["timestamp"])
                }

                # Terminate stream on completion or final error
                if event_data["event"] in ("pipeline_complete", "error"):
                    print(f"[SSE] Pipeline terminated stream for session: {session_id}")
                    break

        except Exception as e:
            print(f"[SSE] Exception in generator: {e}")
            yield {"event": "error", "data": json.dumps({"message": f"Stream error: {str(e)}"})}
        finally:
            # Clean up memory storage
            if session_id in active_sessions:
                del active_sessions[session_id]
                print(f"[SSE] Cleaned up session storage for: {session_id}")

    return EventSourceResponse(event_generator())
