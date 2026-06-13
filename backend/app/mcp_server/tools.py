from uuid import uuid4
from mcp.server.fastmcp import FastMCP
from app.pipeline.event_bus import CollectorEventBus
from app.pipeline.orchestrator import PipelineOrchestrator
from app.db.supabase_client import get_supabase_client

# Create the FastMCP server instance
mcp = FastMCP("Context-Aware Code Refactorer")

@mcp.tool()
async def refactor_code(
    code: str,
    language: str = "python",
    max_loops: int = 3
) -> dict:
    """
    Runs the adversarial multi-agent refactoring pipeline on raw code.
    Evaluates the code against company guidelines stored in the RAG brain.
    Returns the final refactored code, an audit report, and the chain-of-thought dialogue.
    """
    session_id = str(uuid4())
    print(f"[MCP Server] Starting tool refactor_code (Session: {session_id})")
    
    # Use CollectorEventBus to gather all logs/thought traces in-memory
    event_bus = CollectorEventBus()
    orchestrator = PipelineOrchestrator()
    
    try:
        result = await orchestrator.run(
            session_id=session_id,
            raw_code=code,
            language=language,
            max_loops=max_loops,
            event_bus=event_bus
        )
        
        return {
            "session_id": session_id,
            "verdict": result.verdict,
            "iterations": result.iterations,
            "final_code": result.final_code,
            "audit_summary": result.audit_summary,
            "applied_guidelines": result.applied_guidelines,
            "chain_of_thought": event_bus.events
        }
    except Exception as e:
        print(f"[MCP Server] Error in refactor_code tool: {e}")
        return {
            "error": f"Adversarial pipeline failed: {str(e)}",
            "chain_of_thought": event_bus.events
        }

@mcp.resource("guidelines://all")
def get_guidelines_resource() -> str:
    """
    Exposes all institutional company guidelines from the database as an MCP resource.
    """
    print("[MCP Server] Reading guidelines://all resource")
    try:
        supabase = get_supabase_client()
        res = supabase.table("knowledge_documents") \
                      .select("title, content, chunk_index") \
                      .order("source_file", desc=False) \
                      .order("chunk_index", desc=False) \
                      .execute()
                      
        docs = res.data if res.data else []
        if not docs:
            return "No company guidelines ingested yet."
            
        formatted_guidelines = "# Enforced Company Guidelines\n\n"
        for doc in docs:
            formatted_guidelines += f"## {doc.get('title')} (Chunk {doc.get('chunk_index')})\n"
            formatted_guidelines += f"{doc.get('content')}\n\n"
            
        return formatted_guidelines
    except Exception as e:
        return f"Error retrieving guidelines resource: {str(e)}"
