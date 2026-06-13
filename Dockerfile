# ── Stage 1: Build React Frontend ──
FROM node:20-alpine AS frontend-builder
WORKDIR /build
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# ── Stage 2: Python Runtime ──
FROM python:3.13-slim
WORKDIR /app

# Install uv for fast dependency resolution
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency definitions and install
COPY backend/pyproject.toml backend/uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

# Copy backend source code
COPY backend/app ./app
COPY backend/sql ./sql
COPY backend/knowledge_base ./knowledge_base

# Copy compiled frontend assets into a location the backend can find
COPY --from=frontend-builder /build/dist ./frontend/dist

# Expose the port used by Uvicorn
EXPOSE 8000

# Run the FastAPI app
# Use the venv created by uv sync
CMD [".venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
