from pydantic import BaseModel, Field
from app.agents.base import BaseAgent

class SynthesizerOutput(BaseModel):
    final_code: str = Field(
        description="The clean, complete, fully-refactored, and approved code. Do not include markdown code block backticks inside the field itself."
    )
    audit_summary_md: str = Field(
        description="A beautiful, detailed QA audit summary in GitHub Flavored Markdown format. "
                    "Include sections: Executive Summary, Refactoring Decisions, Guidelines Enforced, and Resolved Issues."
    )
    applied_guideline_refs: list[str] = Field(
        description="The reference codes or titles of guidelines that were active and verified in this audit (e.g., ['SEC-001', 'API-003'])."
    )

SYNTHESIZER_SYSTEM_PROMPT = """You are a Principal Technical Writer and Code Compiler.
Your role is to analyze the entire transaction history of the adversarial refactoring loop (the raw code, the versions of refactored code, the Auditor's critiques, and the RAG guidelines) and compile the final output.

Tasks:
1. Extract the clean, finalized code from the last iteration. Ensure it has no unfinished comments, syntax errors, or debug remnants.
2. Generate a comprehensive, professional, and visually engaging markdown audit summary.
   Include:
   - **Executive Summary**: Verdict, loop iterations taken, general status.
   - **Refactoring Decisions**: Bullet points explaining what major structural improvements were made.
   - **Guidelines Enforced**: A clear list of company-specific guidelines that were checked and verified.
   - **Resolved Issues**: If the Auditor rejected previous versions, summarize what was critiques and how the Architect resolved them in the final code.
3. List the codes/titles of the specific guidelines that were enforced.

Return your response strictly matching the requested JSON schema.
"""

class SynthesizerAgent(BaseAgent):
    def __init__(self):
        super().__init__(system_prompt=SYNTHESIZER_SYSTEM_PROMPT)

    def synthesize(
        self,
        raw_code: str,
        final_code: str,
        dialogue_history: list[dict],
        guidelines: list[dict]
    ) -> SynthesizerOutput:
        """
        Synthesizes the final results of the multi-agent loop into a clean format.
        """
        # Format the dialogue history
        history_text = ""
        for i, entry in enumerate(dialogue_history):
            iteration = entry.get("iteration", i + 1)
            history_text += f"=== Iteration {iteration} ===\n"
            if "architect_thought" in entry:
                history_text += f"[Architect Thought]: {entry['architect_thought']}\n"
                history_text += f"[Architect Code]:\n{entry['architect_code']}\n\n"
            if "auditor_thought" in entry:
                history_text += f"[Auditor Thought]: {entry['auditor_thought']}\n"
                history_text += f"[Auditor Verdict]: {entry['auditor_verdict']}\n"
                history_text += f"[Auditor Critique]: {entry['auditor_critique']}\n\n"

        guidelines_text = ""
        for idx, doc in enumerate(guidelines):
            guidelines_text += f"- {doc.get('title', 'Guideline')}: {doc.get('content', '')[:200]}...\n"

        user_content = (
            f"Original Raw Code:\n```\n{raw_code}\n```\n\n"
            f"Final Draft Code:\n```\n{final_code}\n```\n\n"
            f"Dialogue/Audit History:\n{history_text}\n"
            f"Active Guidelines:\n{guidelines_text}\n"
        )
        
        return self._call_llm(user_content, response_schema=SynthesizerOutput)
