from app.pipeline.event_bus import QueueEventBus

# In-memory storage for active SSE queues
# session_id (str) -> QueueEventBus
active_sessions: dict[str, QueueEventBus] = {}
