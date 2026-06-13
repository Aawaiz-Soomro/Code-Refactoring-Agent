from typing import Any, Optional
from pydantic import BaseModel, Field

class RefactorRequest(BaseModel):
    code: str = Field(..., description="The raw code to be refactored and audited.")
    language: str = Field("python", description="Programming language of the input code.")
    max_loops: int = Field(3, ge=1, le=5, description="Max number of iterations for the adversarial loop.")

class RefactorResponse(BaseModel):
    session_id: str = Field(..., description="UUID representing this refactoring session.")

class GuidelineModel(BaseModel):
    id: str
    title: str
    source_file: str
    content: str
    chunk_index: int
    similarity: Optional[float] = None
