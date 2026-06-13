import asyncio
import traceback
from typing import Any, Literal, Optional
from pydantic import BaseModel, Field
from app.agents.architect import ArchitectAgent
from app.agents.auditor import AuditorAgent, CritiqueItem
from app.agents.synthesizer import SynthesizerAgent
from app.pipeline.event_bus import EventBus
from app.rag.retriever import generate_search_query_from_code, retrieve_relevant_guidelines

class PipelineResult(BaseModel):
    final_code: str = Field(description="The final compiled, refactored and approved code.")
    audit_summary: str = Field(description="A comprehensive markdown summary of the audit and changes.")
    applied_guidelines: list[str] = Field(description="List of applied guideline references/titles.")
    iterations: int = Field(description="Number of iterations run in the loop.")
    verdict: str = Field(description="Final verdict, e.g., APPROVED or MAX_LOOPS_EXHAUSTED.")

class PipelineOrchestrator:
    def __init__(self):
        self.architect = ArchitectAgent()
        self.auditor = AuditorAgent()
        self.synthesizer = SynthesizerAgent()

    async def run(
        self,
        session_id: str,
        raw_code: str,
        language: str,
        max_loops: int = 3,
        event_bus: Optional[EventBus] = None
    ) -> PipelineResult:
        """
        Drives the stateful loop, coordinating the Architect, Auditor, and Synthesizer,
        utilizing RAG retrieval, and emitting progress events via the event_bus.
        """
        # Set up a fallback logger if event_bus is None
        async def emit_event(event_type: str, data: Any = None):
            if event_bus:
                await event_bus.emit(event_type, data)
            else:
                print(f"[Orchestrator {session_id}] Event: {event_type} - {str(data)[:120]}...")

        await emit_event("session_start", {
            "session_id": session_id,
            "language": language,
            "max_loops": max_loops
        })

        current_code = raw_code
        critique_text = None
        dialogue_history = []
        all_retrieved_guidelines = []
        guidelines_applied_keys = set()
        
        # Keep track of unique guidelines retrieved to feed to the synthesizer
        retrieved_guidelines_cache = {}

        iteration = 0
        verdict = "REJECTED"

        try:
            while iteration < max_loops:
                iteration += 1
                await emit_event("iteration_start", {"iteration": iteration})

                # --- 1. ARCHITECT REFRACTORING ---
                print(f"[Orchestrator] Running Architect - Iteration {iteration}...")
                await emit_event("architect_working", {"iteration": iteration})
                
                # Run Architect as a blocking sync call wrapped in an executor
                # (Gemini API calls are synchronous in google-genai, so run in thread pool)
                loop = asyncio.get_running_loop()
                architect_out = await loop.run_in_executor(
                    None,
                    self.architect.refactor,
                    current_code,
                    language,
                    critique_text
                )
                
                # Update current code with Architect's draft
                current_code = architect_out.code

                await emit_event("architect_thinking", {
                    "iteration": iteration,
                    "thought": architect_out.thought,
                    "code": architect_out.code
                })

                # --- 2. RAG RETRIEVAL ---
                await emit_event("rag_working", {"iteration": iteration})
                
                # Extract summary query from code
                search_query = await loop.run_in_executor(
                    None,
                    generate_search_query_from_code,
                    current_code,
                    language
                )
                
                # Retrieve guidelines from pgvector
                guidelines = await loop.run_in_executor(
                    None,
                    retrieve_relevant_guidelines,
                    search_query,
                    0.50, # Cosine similarity threshold
                    5     # Retrieve top-5
                )

                # Cache retrieved guidelines and mark them as seen
                for g in guidelines:
                    guideline_id = g.get("id")
                    if guideline_id:
                        retrieved_guidelines_cache[guideline_id] = g
                        guidelines_applied_keys.add(g.get("title", "Guideline"))

                # Emit RAG results
                await emit_event("rag_retrieved", {
                    "iteration": iteration,
                    "query": search_query,
                    "guidelines": [
                        {
                            "title": g.get("title"),
                            "content": g.get("content"),
                            "similarity": g.get("similarity")
                        } for g in guidelines
                    ]
                })

                # --- 3. AUDITOR TESTING ---
                await emit_event("auditor_working", {"iteration": iteration})
                print(f"[Orchestrator] Running Auditor - Iteration {iteration}...")
                
                auditor_out = await loop.run_in_executor(
                    None,
                    self.auditor.audit,
                    current_code,
                    language,
                    guidelines
                )

                await emit_event("auditor_thinking", {
                    "iteration": iteration,
                    "thought": auditor_out.thought,
                    "verdict": auditor_out.verdict,
                    "critique": [c.model_dump() for c in auditor_out.critique],
                    "summary": auditor_out.summary
                })

                # Record dialogue log
                dialogue_history.append({
                    "iteration": iteration,
                    "architect_thought": architect_out.thought,
                    "architect_code": architect_out.code,
                    "auditor_thought": auditor_out.thought,
                    "auditor_verdict": auditor_out.verdict,
                    "auditor_critique": str([c.model_dump() for c in auditor_out.critique])
                })

                verdict = auditor_out.verdict
                if auditor_out.verdict == "APPROVED":
                    await emit_event("approved", {"iteration": iteration})
                    break
                else:
                    # Format critique text to prompt Architect revision
                    critique_lines = []
                    for idx, item in enumerate(auditor_out.critique):
                        critique_lines.append(
                            f"{idx+1}. [{item.severity.upper()}] Ref: {item.guideline_ref}. "
                            f"Issue: {item.issue}. Suggestion: {item.suggestion}"
                        )
                    critique_text = "\n".join(critique_lines)
                    
                    await emit_event("rejected", {
                        "iteration": iteration,
                        "critique": [c.model_dump() for c in auditor_out.critique]
                    })
            
            # --- 4. SYNTHESIS ---
            await emit_event("synthesizer_working", {"session_id": session_id})
            print("[Orchestrator] Running Synthesizer...")
            
            unique_guidelines = list(retrieved_guidelines_cache.values())
            
            synthesizer_out = await loop.run_in_executor(
                None,
                self.synthesizer.synthesize,
                raw_code,
                current_code,
                dialogue_history,
                unique_guidelines
            )

            result = PipelineResult(
                final_code=synthesizer_out.final_code,
                audit_summary=synthesizer_out.audit_summary_md,
                applied_guidelines=list(guidelines_applied_keys),
                iterations=iteration,
                verdict="APPROVED" if verdict == "APPROVED" else "MAX_LOOPS_EXHAUSTED"
            )

            await emit_event("pipeline_complete", result.model_dump())
            return result

        except Exception as e:
            traceback.print_exc()
            error_msg = f"Pipeline execution failed: {str(e)}"
            await emit_event("error", {"message": error_msg})
            raise RuntimeError(error_msg)
