from google import genai
from app.config import settings
from app.db.supabase_client import get_supabase_client
from app.rag.embeddings import get_embedding, get_genai_client

def generate_search_query_from_code(code: str, language: str = "python") -> str:
    """
    Generate a brief semantic summary / query of the code's purpose and patterns
    using Gemini to retrieve much more relevant guidelines from the RAG store.
    """
    client = get_genai_client()
    prompt = (
        f"Analyze this {language} code and extract a short (1-2 sentences) summary of what "
        "technologies, architectural patterns, and security-sensitive operations are occurring "
        "(e.g., 'SQL database query', 'API endpoint', 'cryptography', 'input validation').\n\n"
        f"Code:\n```\n{code}\n```\n\n"
        "Summary:"
    )
    
    try:
        response = client.models.generate_content(
            model=settings.GEMINI_MODEL,
            contents=prompt
        )
        summary = response.text.strip()
        print(f"Generated search query for RAG: {summary}")
        return summary
    except Exception as e:
        print(f"Error generating search query from code: {e}")
        # Fallback to the first 500 characters of code
        return code[:500]

def retrieve_relevant_guidelines(query: str, threshold: float = 0.60, count: int = 5) -> list[dict]:
    """
    Embed the query and query Supabase for matching guidelines using match_guidelines RPC.
    """
    print(f"Retrieving guidelines for query: {query}")
    try:
        embedding = get_embedding(query)
    except Exception as e:
        print(f"Failed to generate embedding for retrieval: {e}")
        return []
        
    supabase = get_supabase_client()
    try:
        res = supabase.rpc("match_guidelines", {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": count
        }).execute()
        
        guidelines = res.data if res.data else []
        print(f"Retrieved {len(guidelines)} guidelines matching query.")
        return guidelines
    except Exception as e:
        print(f"Error calling match_guidelines RPC: {e}")
        return []
