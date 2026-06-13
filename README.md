# Context-Aware Code Refactorer

A premium, full-stack, dual-access (Web + MCP) automated code auditing pipeline. It leverages an adversarial multi-agent loop powered by **Google Gemini 2.5 Flash** and a vector database (RAG) powered by **Supabase pgvector** to enforce custom company-specific coding standards.

```
┌─────────────────────────────────────────────────────────────┐
│                       Raw Code Input                        │
└──────────────────────────────┬──────────────────────────────┘
                               │
            ┌──────────────────▼──────────────────┐
            │       Architect Agent (Gemini)      │◄────────────────┐
            └──────────────────┬──────────────────┘                 │
                               │                                    │
                               ▼                                    │
                    [ Refactored Code Draft ]                       │
                               │                                    │ (Critique Log
                               │ (Embeds summary → RAG query)       │  if REJECTED)
                               ▼                                    │
            ┌─────────────────────────────────────┐                 │
            │        Supabase pgvector (RAG)      │                 │
            └──────────────────┬──────────────────┘                 │
                               │                                    │
                               ▼                                    │
                      [ Top-5 Guidelines ]                          │
                               │                                    │
                               ▼                                    │
            ┌─────────────────────────────────────┐                 │
            │         Auditor Agent (Gemini)      ├─────────────────┘
            └──────────────────┬──────────────────┘
                               │
                    (APPROVED / Verdict reached)
                               │
                               ▼
            ┌─────────────────────────────────────┐
            │       Synthesizer Agent (Gemini)    │
            └──────────────────┬──────────────────┘
                               │
                               ▼
                [ Approved Code + Markdown Audit ]
```

---

## ⚡ Key Features

1. **Adversarial loop**: An iterative critique-revision dialogue between the **Architect** (writing code) and the **Auditor** (testing against guidelines).
2. **RAG-Backed "Company Brain"**: Automatically chunk, embed, and store coding standards in Supabase. Similarity searches occur on abstract semantic summaries of the code, retrieving highly relevant guidelines.
3. **SSE Chain-of-Thought Streaming**: Streams the inner thoughts, RAG retrievals, and arguments of the agents to the UI in real-time.
4. **MCP Server Integration**: Mounts a Model Context Protocol server inside the API, allowing external clients (like Claude Desktop or Cursor) to invoke the refactoring pipeline directly.

---

## 🛠️ Tech Stack

- **Backend**: FastAPI, `sse-starlette`, `google-genai` SDK, `psycopg` (for migrations), `mcp[cli]`.
- **Frontend**: React 19, Tailwind CSS v4, CodeMirror 6, `react-markdown`.
- **Database**: Supabase PostgreSQL + `pgvector` extension.
- **AI Models**: `gemini-2.5-flash` (free tier), `text-embedding-004` (free tier).

---

## 🚀 Setup Instructions

### 1. Database Setup (Supabase)
1. Register/log in to [supabase.com](https://supabase.com).
2. Create a new database project.
3. Go to **Project Settings -> API** and copy:
   - `SUPABASE_URL`
   - `SUPABASE_KEY` (use the `service_role` key)
4. Go to **Project Settings -> Database** and copy the **Connection string** (URI mode, Transaction Pooler on port 5432). This is your `DATABASE_URL`.

### 2. Backend Installation
1. Install Python 3.10+ and `uv` (recommended package manager).
2. Rename `backend/.env.example` to `backend/.env` and fill in your keys:
   ```env
   GOOGLE_API_KEY=AIzaSy...
   SUPABASE_URL=...
   SUPABASE_KEY=...
   DATABASE_URL=...
   ```
3. Initialize python environment and run database migrations:
   ```bash
   cd backend
   uv venv
   # Run automated migrations to create tables and the RPC match function
   uv run python -m app.db.migrate
   ```
4. Seed the vector database with company guidelines:
   ```bash
   # Chunks, embeds, and stores standard templates
   uv run python -m app.rag.ingestion
   ```
5. Start the FastAPI backend server:
   ```bash
   uv run python -m app.main
   ```
   The backend API will run on `http://localhost:8000`.

### 3. Frontend Installation
1. Ensure you have Node.js v20+ installed.
2. Install npm modules and start the Vite development server:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   The frontend dashboard will run on `http://localhost:5173`. It includes a development proxy routing `/api` requests to `localhost:8000`.

---

## 🔌 Connecting to Claude Desktop / Cursor (MCP)

To connect this pipeline directly to your local development environment:

### Claude Desktop Configuration
Open your Claude Desktop config file (typically `C:\Users\<username>\AppData\Roaming\Claude\claude_desktop_config.json` on Windows) and add this entry under `mcpServers`:

```json
{
  "mcpServers": {
    "code-refactorer": {
      "command": "uv",
      "args": [
        "--directory",
        "C:\\absolute\\path\\to\\context-aware-code-refactorer\\backend",
        "run",
        "mcp",
        "run",
        "app/mcp_server/tools.py"
      ],
      "env": {
        "GOOGLE_API_KEY": "your-gemini-key",
        "SUPABASE_URL": "your-supabase-url",
        "SUPABASE_KEY": "your-supabase-key"
      }
    }
  }
}
```

Restart Claude Desktop, and you will see a new tool icon. You can ask Claude: `"Refactor this code against company guidelines: [paste code]"`.
