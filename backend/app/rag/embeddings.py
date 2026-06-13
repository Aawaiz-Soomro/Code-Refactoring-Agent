from google import genai
from google.genai import types
from app.config import settings

_genai_client = None

def get_genai_client() -> genai.Client:
    global _genai_client
    if _genai_client is None:
        _genai_client = genai.Client(api_key=settings.GOOGLE_API_KEY)
    return _genai_client

def get_embedding(text: str) -> list[float]:
    """Generate a single embedding vector for the given text using text-embedding-004."""
    client = get_genai_client()
    try:
        response = client.models.embed_content(
            model=settings.EMBEDDING_MODEL,
            contents=text,
            config=types.EmbedContentConfig(output_dimensionality=settings.EMBEDDING_DIMENSIONS)
        )
        return response.embeddings[0].values
    except Exception as e:
        print(f"Error generating embedding: {e}")
        raise

def get_embeddings_batch(texts: list[str]) -> list[list[float]]:
    """Generate multiple embeddings in a single batch call."""
    if not texts:
        return []
    client = get_genai_client()
    try:
        embeddings = []
        for text in texts:
            response = client.models.embed_content(
                model=settings.EMBEDDING_MODEL,
                contents=text,
                config=types.EmbedContentConfig(output_dimensionality=settings.EMBEDDING_DIMENSIONS)
            )
            embeddings.append(response.embeddings[0].values)
        return embeddings
    except Exception as e:
        print(f"Error generating batch embeddings: {e}")
        raise
