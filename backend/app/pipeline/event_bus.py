import asyncio
import time
from typing import Any

class EventBus:
    """Base EventBus interface."""
    async def emit(self, event_type: str, data: Any = None):
        raise NotImplementedError

class CollectorEventBus(EventBus):
    """EventBus that accumulates events in-memory. Perfect for MCP tools."""
    def __init__(self):
        self.events: list[dict] = []

    async def emit(self, event_type: str, data: Any = None):
        event_payload = {
            "event": event_type,
            "data": data,
            "timestamp": time.time()
        }
        self.events.append(event_payload)
        # Printable debug log
        print(f"[EventBus] Emitted: {event_type} - {str(data)[:120]}")

class QueueEventBus(EventBus):
    """EventBus that routes events to an asyncio.Queue. Perfect for FastAPI SSE."""
    def __init__(self):
        self.queue: asyncio.Queue = asyncio.Queue()

    async def emit(self, event_type: str, data: Any = None):
        event_payload = {
            "event": event_type,
            "data": data,
            "timestamp": time.time()
        }
        await self.queue.put(event_payload)
        # Printable debug log
        print(f"[EventBus] Emitted (Queue): {event_type} - {str(data)[:120]}")

    async def get(self) -> dict:
        """Retrieves the next event from the queue."""
        return await self.queue.get()
