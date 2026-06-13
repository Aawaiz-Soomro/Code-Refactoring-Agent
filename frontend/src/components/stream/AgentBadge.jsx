import React from 'react';

export default function AgentBadge({ agent, active = false }) {
  const getAgentStyles = () => {
    switch (agent.toLowerCase()) {
      case 'architect':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
          dot: 'bg-emerald-400',
          pulse: 'pulse-architect'
        };
      case 'auditor':
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400',
          dot: 'bg-red-400',
          pulse: 'pulse-auditor'
        };
      case 'synthesizer':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
          dot: 'bg-blue-400',
          pulse: 'pulse-synthesizer'
        };
      case 'rag':
        return {
          bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
          dot: 'bg-amber-400',
          pulse: 'pulse-rag'
        };
      default:
        return {
          bg: 'bg-gray-500/10 border-gray-500/20 text-gray-400',
          dot: 'bg-gray-400',
          pulse: ''
        };
    }
  };

  const styles = getAgentStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-wide uppercase select-none ${styles.bg} ${active ? styles.pulse : ''}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${styles.dot} ${active ? 'animate-ping' : ''}`}></span>
      <span>{agent}</span>
    </span>
  );
}
