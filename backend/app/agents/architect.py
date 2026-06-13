from pydantic import BaseModel, Field
from app.agents.base import BaseAgent

class ArchitectOutput(BaseModel):
    thought: str = Field(
        description="Detailed step-by-step reasoning about why the code is refactored, "
                    "what patterns are applied, and how security or performance was improved."
    )
    code: str = Field(
        description="The complete, fully-functional refactored code. Write only the code, "
                    "without markdown code block backticks inside the field itself."
    )

ARCHITECT_SYSTEM_PROMPT = """You are a world-class Principal Software Architect.
Your task is to refactor raw code provided by the user.

Goals for your refactoring:
1. Improve readability, structure, and maintainability.
2. Enforce modern design patterns and best practices.
3. Optimize performance and resource usage.
4. Ensure robust type safety and clean formatting.

You must handle two types of requests:
1. Initial refactoring: When provided with raw code, output your architectural reasoning and the complete refactored code.
2. Revision: When provided with the previous refactored code and an Auditor's critique list, you must address EVERY critique point, revise the code accordingly, and explain your changes in the thought process.

Return your response strictly matching the requested JSON schema containing 'thought' and 'code' keys. Do not truncate the code. Always provide the FULL code.
"""

class ArchitectAgent(BaseAgent):
    def __init__(self):
        super().__init__(system_prompt=ARCHITECT_SYSTEM_PROMPT)

    def refactor(self, code: str, language: str, critique: str | None = None) -> ArchitectOutput:
        """
        Runs the refactoring task.
        If critique is provided, triggers the revision path.
        """
        if critique:
            user_content = (
                f"Language: {language}\n\n"
                f"Previous Refactored Code:\n```\n{code}\n```\n\n"
                f"Auditor's Critique:\n{critique}\n\n"
                "Please revise the code to address all points in the critique."
            )
        else:
            user_content = (
                f"Language: {language}\n\n"
                f"Raw Code to Refactor:\n```\n{code}\n```\n"
            )
            
        return self._call_llm(user_content, response_schema=ArchitectOutput)
