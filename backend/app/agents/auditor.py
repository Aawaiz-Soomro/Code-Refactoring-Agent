from typing import Literal
from pydantic import BaseModel, Field
from app.agents.base import BaseAgent

class CritiqueItem(BaseModel):
    severity: Literal["high", "medium", "low"] = Field(
        description="The severity level of the violation or concern."
    )
    guideline_ref: str = Field(
        description="The specific rule code/reference name from the company guidelines (e.g., SEC-001, API-002) "
                    "or 'general' if not explicitly defined in the guidelines."
    )
    issue: str = Field(
        description="A precise description of the issue or violation found."
    )
    suggestion: str = Field(
        description="Actionable code change or design advice to resolve the critique."
    )

class AuditorOutput(BaseModel):
    thought: str = Field(
        description="Hostile audit reasoning process, documenting line-by-line inspection of the refactored code "
                    "against the provided company guidelines."
    )
    verdict: Literal["APPROVED", "REJECTED"] = Field(
        description="APPROVED if the code satisfies all provided company guidelines and contains no major security "
                    "or design flaws. REJECTED if any guideline is violated or major edge cases are unhandled."
    )
    critique: list[CritiqueItem] = Field(
        default_factory=list,
        description="List of critique items representing violations. Must be empty if APPROVED."
    )
    summary: str = Field(
        description="A concise summary of the audit results (e.g., '1 high-severity security issue found' "
                    "or 'All checks passed successfully. Code approved.')."
    )

AUDITOR_SYSTEM_PROMPT = """You are a hostile, pedantic, and extremely rigorous QA Security and Style Auditor.
Your job is to audit refactored code against company-specific guidelines retrieved from our RAG brain.

Evaluation Protocol:
1. Examine the refactored code and the retrieved company guidelines very carefully.
2. Be strict. If there is ANY violation of the rules (such as string interpolation in SQL queries, hardcoded keys, improper HTTP status codes, or unhandled exceptions), you MUST reject the code (verdict = REJECTED).
3. Look for edge cases, performance bottlenecks, and validation failures.
4. If the code does not violate any retrieved rules and is clean/secure, approve it (verdict = APPROVED).
5. For every violation, provide a CritiqueItem with its severity, the violated guideline reference, the description of the issue, and an actionable suggestion.

Remember, you represent the gatekeeper of code quality. It is better to reject code with minor issues than to let faulty patterns leak into production.
Return your response strictly matching the requested JSON schema.
"""

class AuditorAgent(BaseAgent):
    def __init__(self):
        super().__init__(system_prompt=AUDITOR_SYSTEM_PROMPT)

    def audit(self, code: str, language: str, guidelines: list[dict]) -> AuditorOutput:
        """
        Audits code against retrieved guidelines.
        """
        # Format the guidelines into a clear block
        guidelines_text = ""
        if guidelines:
            for i, doc in enumerate(guidelines):
                title = doc.get("title", "Guideline")
                content = doc.get("content", "")
                guidelines_text += f"--- Guideline #{i+1}: {title} ---\n{content}\n\n"
        else:
            guidelines_text = "No specific company guidelines were retrieved. Audit the code against general industry standards."

        user_content = (
            f"Language: {language}\n\n"
            f"Refactored Code to Audit:\n```\n{code}\n```\n\n"
            f"Retrieved Company Guidelines:\n{guidelines_text}\n"
        )
        
        return self._call_llm(user_content, response_schema=AuditorOutput)
