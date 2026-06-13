import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from starlette.exceptions import HTTPException as StarletteHTTPException
from app.config import settings
from app.routes import health, guidelines, refactor, stream
from app.mcp_server.tools import mcp

# --- SPA Static Files Handler ---
class SPAStaticFiles(StaticFiles):
    """Serves React static files with SPA fallback to index.html for client-side routing."""
    async def get_response(self, path: str, scope):
        try:
            return await super().get_response(path, scope)
        except (StarletteHTTPException,) as ex:
            if ex.status_code == 404:
                return await super().get_response("index.html", scope)
            raise ex

# --- Application Setup ---
app = FastAPI(
    title="Context-Aware Code Refactorer API",
    description="Backend API for managing code audits, real-time streams, and RAG guidelines."
)

# Parse CORS Origins
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount MCP Server (Streamable HTTP transport)
app.mount("/mcp", mcp.streamable_http_app())

# Include API Routers (MUST come before the static file mount)
app.include_router(health.router)
app.include_router(guidelines.router, prefix="/api")
app.include_router(refactor.router, prefix="/api")
app.include_router(stream.router, prefix="/api")

# Mount React static files in production
# In development, the Vite dev server handles this via proxy
_frontend_dist = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend", "dist")
if os.path.isdir(_frontend_dist):
    print(f"[Startup] Serving frontend from: {_frontend_dist}")
    app.mount("/", SPAStaticFiles(directory=_frontend_dist, html=True), name="spa")
else:
    print("[Startup] No frontend/dist found — running in API-only mode (use Vite dev server for UI)")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
