import React, { useEffect, useRef } from 'react';
import AgentBadge from './AgentBadge';
import { Terminal, Shield, CheckCircle, XCircle } from 'lucide-react';

export default function LiveTerminal({ events = [] }) {
  const terminalEndRef = useRef(null);

  useEffect(() => {
    // Smooth auto-scroll
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

  const renderEvent = (evt, idx) => {
    const { event, data, timestamp } = evt;
    const timeStr = new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    switch (event) {
      case 'session_start':
        return (
          <div key={idx} className="border-b border-white/5 pb-2 mb-2">
            <span className="text-violet-400 font-bold">[{timeStr}] PIPELINE INITIALIZED</span>
            <span className="text-gray-400 block text-xs mt-1">Session ID: {data.session_id} | Max Loops: {data.max_loops}</span>
          </div>
        );
      case 'iteration_start':
        return (
          <div key={idx} className="my-2 border-y border-white/5 py-1 text-center bg-white/2 select-none">
            <span className="text-gray-400 font-bold tracking-widest text-[10px]">LOOP ITERATION #{data.iteration}</span>
          </div>
        );
      case 'architect_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-gray-600 text-xs shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="architect" active />
            <span className="text-gray-300 italic text-xs animate-pulse">Designing architecture optimizations...</span>
          </div>
        );
      case 'architect_thinking':
        return (
          <div key={idx} className="flex flex-col gap-1 border-l-2 border-emerald-500/30 pl-3 py-1 my-1">
            <div className="flex gap-2 items-center">
              <span className="text-gray-600 text-xs select-none">[{timeStr}]</span>
              <AgentBadge agent="architect" />
              <span className="text-emerald-400 text-xs font-bold">Optimized draft ready</span>
            </div>
            <p className="text-xs text-gray-300 whitespace-pre-wrap mt-1 font-sans">{data.thought}</p>
          </div>
        );
      case 'rag_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-gray-600 text-xs shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="rag" active />
            <span className="text-gray-300 italic text-xs animate-pulse">Running semantic scan on company brain...</span>
          </div>
        );
      case 'rag_retrieved':
        return (
          <div key={idx} className="flex flex-col gap-1 border-l-2 border-amber-500/30 pl-3 py-1 my-1">
            <div className="flex gap-2 items-center">
              <span className="text-gray-600 text-xs select-none">[{timeStr}]</span>
              <AgentBadge agent="rag" />
              <span className="text-amber-400 text-xs font-bold">Retrieved {data.guidelines?.length || 0} guidelines</span>
            </div>
            {data.guidelines && data.guidelines.length > 0 ? (
              <ul className="text-[11px] text-gray-400 list-disc list-inside mt-1 font-sans">
                {data.guidelines.map((g, gIdx) => (
                  <li key={gIdx} className="truncate" title={g.title}>
                    <span className="font-semibold text-gray-300">{g.title}</span>
                    <span className="text-[10px] text-amber-500/70 ml-1.5">(cos similarity: {(g.similarity || 0).toFixed(3)})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-[10px] text-gray-500 font-sans mt-0.5">No matching guidelines found above threshold.</span>
            )}
          </div>
        );
      case 'auditor_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-gray-600 text-xs shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="auditor" active />
            <span className="text-gray-300 italic text-xs animate-pulse">Evaluating code vulnerabilities against criteria...</span>
          </div>
        );
      case 'auditor_thinking':
        const verdictColor = data.verdict === 'APPROVED' ? 'text-emerald-400' : 'text-red-400';
        return (
          <div key={idx} className={`flex flex-col gap-1 border-l-2 ${data.verdict === 'APPROVED' ? 'border-emerald-500/30' : 'border-red-500/30'} pl-3 py-1 my-1`}>
            <div className="flex gap-2 items-center">
              <span className="text-gray-600 text-xs select-none">[{timeStr}]</span>
              <AgentBadge agent="auditor" />
              <span className={`${verdictColor} text-xs font-bold`}>Verdict: {data.verdict}</span>
            </div>
            <p className="text-xs text-gray-300 whitespace-pre-wrap mt-1 font-sans">{data.thought}</p>
            {data.critique && data.critique.length > 0 && (
              <div className="mt-2 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-red-400 select-none uppercase">Violations Found:</span>
                {data.critique.map((c, cIdx) => (
                  <div key={cIdx} className="text-[11px] bg-red-500/5 border border-red-500/10 rounded px-2 py-1 font-sans">
                    <span className="font-semibold text-red-300">[{c.severity.toUpperCase()}] {c.guideline_ref}:</span> {c.issue}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'approved':
        return (
          <div key={idx} className="flex items-center gap-2 text-emerald-400 my-2 py-1 border-y border-emerald-500/10 bg-emerald-500/2">
            <CheckCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">QA AUDIT PASSED - CODE APPROVED AT ITERATION {data.iteration}</span>
          </div>
        );
      case 'rejected':
        return (
          <div key={idx} className="flex items-center gap-2 text-red-400 my-2 py-1 border-y border-red-500/10 bg-red-500/2">
            <XCircle className="w-4 h-4" />
            <span className="text-xs font-bold uppercase">QA AUDIT REJECTED - REVISING FOR ITERATION {data.iteration + 1}...</span>
          </div>
        );
      case 'synthesizer_working':
        return (
          <div key={idx} className="flex gap-2 items-start py-1">
            <span className="text-gray-600 text-xs shrink-0 select-none">[{timeStr}]</span>
            <AgentBadge agent="synthesizer" active />
            <span className="text-gray-300 italic text-xs animate-pulse">Compiling final results & compiling report...</span>
          </div>
        );
      case 'pipeline_complete':
        return (
          <div key={idx} className="border-t border-white/5 pt-2 mt-2">
            <span className="text-blue-400 font-bold">[{timeStr}] PIPELINE COMPLETE</span>
            <span className="text-gray-400 block text-xs mt-1">
              Final Verdict: {data.verdict} | Loops Run: {data.iterations}
            </span>
          </div>
        );
      case 'error':
        return (
          <div key={idx} className="border border-red-500/20 bg-red-500/10 rounded-lg p-3 my-2 text-red-400 font-sans text-xs">
            <div className="font-bold flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4" />
              <span>PIPELINE ERROR</span>
            </div>
            <p className="whitespace-pre-wrap">{data.message}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[#07070a]/90 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] select-none">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs font-bold tracking-wide text-gray-400">LIVE COGNITIVE TERMINAL</span>
        </div>
        
        {/* Active badge indicator */}
        {activeAgent && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-500 font-semibold uppercase animate-pulse">Active:</span>
            <AgentBadge agent={activeAgent} active />
          </div>
        )}
      </div>

      <div className="flex-1 p-4 font-mono text-left overflow-y-auto max-h-[300px] flex flex-col gap-2.5 text-xs bg-black/40">
        {events.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 italic select-none">
            Terminal idle. Paste raw code and press "Refactor Code" to begin...
          </div>
        ) : (
          events.map((evt, idx) => renderEvent(evt, idx))
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
