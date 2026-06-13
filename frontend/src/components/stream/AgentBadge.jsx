import React from 'react';

export default function AgentBadge({ agent, active = false }) {
  const getAgentStyles = () => {
    switch (agent.toLowerCase()) {
      case 'architect':
        return {
          bg: 'bg-[var(--color-architect)] text-black border-[var(--border-main)]',
          dot: 'bg-black',
        };
      case 'auditor':
        return {
          bg: 'bg-[var(--color-auditor)] text-white border-[var(--border-main)]',
          dot: 'bg-white',
        };
      case 'synthesizer':
        return {
          bg: 'bg-[var(--color-synthesizer)] text-black border-[var(--border-main)]',
          dot: 'bg-black',
        };
      case 'rag':
        return {
          bg: 'bg-[var(--color-rag)] text-white border-[var(--border-main)]',
          dot: 'bg-white',
        };
      default:
        return {
          bg: 'bg-[var(--bg-main)] text-[var(--text-primary)] border-[var(--border-main)]',
          dot: 'bg-[var(--border-main)]',
        };
    }
  };

  const styles = getAgentStyles();

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 border-2 text-[10px] font-black tracking-widest uppercase select-none shadow-[1px_1px_0px_0px_#111111] ${styles.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-none ${styles.dot} ${active ? 'animate-[mechanical-blink_1s_steps(2,end)_infinite]' : ''}`}></span>
      <span>{agent}</span>
    </span>
  );
}
