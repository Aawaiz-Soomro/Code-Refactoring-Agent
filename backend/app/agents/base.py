from typing import Any, Type, TypeVar
from pydantic import BaseModel
from google.genai.types import GenerateContentConfig
from app.config import settings
from app.rag.embeddings import get_genai_client

T = TypeVar("T", bound=BaseModel)

class BaseAgent:
    def __init__(self, system_prompt: str):
        self.system_prompt = system_prompt
        self.client = get_genai_client()

    def _call_llm(self, user_content: str, response_schema: Type[T] | None = None) -> Any:
        """
        Helper method to call Gemini 2.5 Flash with the agent's system prompt.
        If response_schema is provided, enforces structured JSON output parsed into Pydantic.
        """
        try:
            if response_schema:
                config = GenerateContentConfig(
                    system_instruction=self.system_prompt,
                    response_mime_type="application/json",
                    response_schema=response_schema,
                    temperature=0.2 # Lower temperature for structured/reasoning tasks
                )
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=user_content,
                    config=config
                )
                return response.parsed
            else:
                config = GenerateContentConfig(
                    system_instruction=self.system_prompt,
                    temperature=0.3
                )
                response = self.client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=user_content,
                    config=config
                )
                return response.text
        except Exception as e:
            print(f"Error in LLM call for agent {self.__class__.__name__}: {e}")
            raise
