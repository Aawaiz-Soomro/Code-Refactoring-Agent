import React, { useEffect, useRef } from 'react';
import AgentBadge from './AgentBadge';
import { Terminal, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function LiveTerminal({ events = [] }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [events]);

  const getActiveAgent = () => {
    if (events.length === 0) return null;
    const lastEvent = events[events.length - 1];
    
    if (lastEvent.event.includes('architect')) return 'architect';
    if (lastEvent.event.includes('auditor')) return 'auditor';
    if (lastEvent.event.includes('rag')) return 'rag';
    if (lastEvent.event.includes('synthesizer')) return 'synthesizer';
    return null;
  };

  const activeAgent = getActiveAgent();

  const renderEvent = (evt, idx, isLast) => {
    const { event, data, timestamp } = evt;
    const timeStr = new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    switch (event) {
      case 'session_start':
        return (
          <div key={idx} className="border-b-2 border-[var(--border-main)] pb-2 mb-2">
            <span className="text-[var(--text-primary)] font-black">[{timeStr}] PIPELINE INITIALIZED</span>
            <span className="text-[var(--text-secondary)] block mt-1 font-bold">Session ID: {data.session_id} | Max Loops: {data.max_loops}</span>
          </div>
        );
      case 'iteration_start':
        return (
          <div key={idx} className="my-2 border-y-2 border-[var(--border-main)] py-1 text-center bg-[var(--bg-panel)] select-none">
            <span className="text-[var(--text-secondary)] font-black tracking-widest text-[10px] uppercase">LOOP ITERATION #{data.iteration}</span>
          </div>
        );
      case 'architect_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-[var(--text-secondary)] font-bold shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="architect" active={isLast} />
            <span className={`text-[var(--text-primary)] italic font-medium ${isLast ? 'animate-[mechanical-blink_1s_steps(2,end)_infinite]' : ''}`}>Designing architecture optimizations...</span>
          </div>
        );
      case 'architect_thinking':
        return (
          <div key={idx} className="flex flex-col gap-1 border-l-4 border-[var(--color-architect)] pl-3 py-1 my-1 bg-[var(--bg-panel)] border-y-2 border-r-2 border-y-[var(--border-main)] border-r-[var(--border-main)]">
            <div className="flex gap-2 items-center">
              <span className="text-[var(--text-secondary)] font-bold select-none">[{timeStr}]</span>
              <AgentBadge agent="architect" />
              <span className="text-[var(--color-architect)] bg-black px-1 font-black uppercase">Optimized draft ready</span>
            </div>
            <p className="text-[var(--text-primary)] whitespace-pre-wrap mt-1 font-medium">{data.thought}</p>
          </div>
        );
      case 'rag_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-[var(--text-secondary)] font-bold shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="rag" active={isLast} />
            <span className={`text-[var(--text-primary)] italic font-medium ${isLast ? 'animate-[mechanical-blink_1s_steps(2,end)_infinite]' : ''}`}>Running semantic scan on company brain...</span>
          </div>
        );
      case 'rag_retrieved':
        return (
          <div key={idx} className="flex flex-col gap-1 border-l-4 border-[var(--color-rag)] pl-3 py-1 my-1 bg-[var(--bg-panel)] border-y-2 border-r-2 border-y-[var(--border-main)] border-r-[var(--border-main)]">
            <div className="flex gap-2 items-center">
              <span className="text-[var(--text-secondary)] font-bold select-none">[{timeStr}]</span>
              <AgentBadge agent="rag" />
              <span className="text-[var(--color-rag)] bg-[var(--border-main)] px-1 font-black uppercase text-white">Retrieved {data.guidelines?.length || 0} guidelines</span>
            </div>
            {data.guidelines && data.guidelines.length > 0 ? (
              <ul className="text-[var(--text-secondary)] list-disc list-inside mt-1 font-medium">
                {data.guidelines.map((g, gIdx) => (
                  <li key={gIdx} className="truncate" title={g.title}>
                    <span className="font-bold text-[var(--text-primary)]">{g.title}</span>
                    <span className="text-[var(--color-rag)] font-bold ml-1.5">(cos: {(g.similarity || 0).toFixed(3)})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[var(--text-muted)] font-medium mt-0.5">No matching guidelines found above threshold.</span>
            )}
          </div>
        );
      case 'auditor_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-[var(--text-secondary)] font-bold shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="auditor" active={isLast} />
            <span className={`text-[var(--text-primary)] italic font-medium ${isLast ? 'animate-[mechanical-blink_1s_steps(2,end)_infinite]' : ''}`}>Evaluating code vulnerabilities against criteria...</span>
          </div>
        );
      case 'auditor_thinking':
        const verdictColor = data.verdict === 'APPROVED' ? 'var(--color-architect)' : 'var(--color-auditor)';
        const verdictBg = data.verdict === 'APPROVED' ? 'bg-black text-[var(--color-architect)]' : 'bg-[var(--color-auditor)] text-white';
        return (
          <div key={idx} className={`flex flex-col gap-1 border-l-4 pl-3 py-1 my-1 bg-[var(--bg-panel)] border-y-2 border-r-2 border-y-[var(--border-main)] border-r-[var(--border-main)]`} style={{borderLeftColor: verdictColor}}>
            <div className="flex gap-2 items-center">
              <span className="text-[var(--text-secondary)] font-bold select-none">[{timeStr}]</span>
              <AgentBadge agent="auditor" />
              <span className={`px-1 font-black uppercase ${verdictBg}`}>Verdict: {data.verdict}</span>
            </div>
            <p className="text-[var(--text-primary)] whitespace-pre-wrap mt-1 font-medium">{data.thought}</p>
            {data.critique && data.critique.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <span className="font-black text-[var(--color-auditor)] select-none uppercase border-b-2 border-[var(--border-main)] inline-block w-max">Violations Found:</span>
                {data.critique.map((c, cIdx) => (
                  <div key={cIdx} className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-none px-2 py-1 shadow-[2px_2px_0px_0px_#111111] mb-1">
                    <span className="font-black text-[var(--color-auditor)]">[{c.severity.toUpperCase()}] {c.guideline_ref}:</span> <span className="font-medium text-[var(--text-primary)]">{c.issue}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'approved':
        return (
          <div key={idx} className="flex items-center gap-2 text-[var(--color-architect)] my-2 py-2 px-2 border-2 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[2px_2px_0px_0px_#111111]">
            <CheckCircle className="w-5 h-5 text-[var(--color-architect)] stroke-[3px]" />
            <span className="font-black uppercase tracking-widest">QA AUDIT PASSED - CODE APPROVED AT ITERATION {data.iteration}</span>
          </div>
        );
      case 'rejected':
        return (
          <div key={idx} className="flex items-center gap-2 text-[var(--bg-card)] bg-[var(--color-auditor)] my-2 py-2 px-2 border-2 border-[var(--border-main)] shadow-[2px_2px_0px_0px_#111111]">
            <XCircle className="w-5 h-5 stroke-[3px]" />
            <span className="font-black uppercase tracking-widest">QA AUDIT REJECTED - REVISING FOR ITERATION {data.iteration + 1}...</span>
          </div>
        );
      case 'synthesizer_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-[var(--text-secondary)] font-bold shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="synthesizer" active={isLast} />
            <span className={`text-[var(--text-primary)] italic font-medium ${isLast ? 'animate-[mechanical-blink_1s_steps(2,end)_infinite]' : ''}`}>Compiling final results & compiling report...</span>
          </div>
        );
      case 'pipeline_complete':
        return (
          <div key={idx} className="border-t-4 border-[var(--border-main)] pt-2 mt-2 bg-[var(--bg-panel)] p-2 shadow-[2px_2px_0px_0px_#111111]">
            <span className="text-[var(--color-rag)] font-black uppercase">[{timeStr}] PIPELINE COMPLETE</span>
            <span className="text-[var(--text-primary)] block font-bold mt-1">
              Final Verdict: <span className="underline">{data.verdict}</span> | Loops Run: {data.iterations}
            </span>
          </div>
        );
      case 'error':
        return (
          <div key={idx} className="border-2 border-[var(--border-main)] bg-[var(--color-auditor)] rounded-none p-3 my-2 text-white shadow-[4px_4px_0px_0px_#111111]">
            <div className="font-black flex items-center gap-2 mb-1 uppercase tracking-widest text-[var(--bg-card)]">
              <Shield className="w-5 h-5" />
              <span>PIPELINE ERROR</span>
            </div>
            <p className="whitespace-pre-wrap font-bold">{data.message}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="brutalist-panel w-full flex-1 flex flex-col rounded-none overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[var(--border-main)] bg-[var(--bg-main)] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[var(--border-main)]" strokeWidth={2.5} />
          <span className="text-[10px] font-black tracking-widest text-[var(--text-secondary)] uppercase">LIVE COGNITIVE TERMINAL</span>
        </div>
        
        {activeAgent && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[var(--border-main)] font-black tracking-widest uppercase animate-[mechanical-blink_1s_steps(2,end)_infinite]">Active:</span>
            <AgentBadge agent={activeAgent} active />
          </div>
        )}
      </div>

      <div className="flex-1 p-4 font-mono text-left overflow-y-auto max-h-[300px] flex flex-col gap-3 text-[11px] bg-[var(--bg-card)] text-[var(--text-primary)]">
        {events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] font-bold italic select-none">
            TERMINAL IDLE. PASTE RAW CODE AND PRESS "EXECUTE AUDIT" TO BEGIN.
          </div>
        ) : (
          events.map((evt, idx) => renderEvent(evt, idx, idx === events.length - 1))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
