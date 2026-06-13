import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { githubLight } from '@uiw/codemirror-theme-github';

export default function CodeEditor({ value, onChange, language = 'python', readOnly = false }) {
  const getLanguageExtension = () => {
    switch (language) {
      case 'javascript':
        return [javascript()];
      case 'python':
      default:
        return [python()];
    }
  };

  return (
    <div className="brutalist-panel w-full flex-1 flex flex-col rounded-none overflow-hidden shrink-0">
      <div className="flex items-center justify-between px-4 py-2 border-b-2 border-[var(--border-main)] bg-[var(--bg-main)]">
        <span className="text-[10px] font-black text-[var(--text-secondary)] select-none uppercase tracking-widest">
          {readOnly ? 'READ ONLY OUTPUT' : 'SOURCE CODE INPUT'}
        </span>
        <span className="text-[10px] font-black px-2 py-0.5 bg-[var(--text-primary)] text-[var(--bg-main)] tracking-widest uppercase select-none">
          {language}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto text-left relative min-h-[250px]">
        <CodeMirror
          value={value}
          height="100%"
          extensions={getLanguageExtension()}
          theme={githubLight}
          onChange={onChange}
          readOnly={readOnly}
          className="h-full border-0 focus:outline-none"
        />
      </div>
    </div>
  );
}
