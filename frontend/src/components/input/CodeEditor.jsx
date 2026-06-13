import React from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

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
    <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[#0d0d15]/50 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)]">
        <span className="text-xs font-semibold text-gray-400 select-none">
          {readOnly ? 'READ ONLY OUTPUT' : 'SOURCE CODE INPUT'}
        </span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-violet-400 tracking-wide uppercase select-none">
          {language}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto text-left relative min-h-[250px]">
        <CodeMirror
          value={value}
          height="100%"
          extensions={getLanguageExtension()}
          theme={vscodeDark}
          onChange={onChange}
          readOnly={readOnly}
          className="h-full border-0 focus:outline-none"
        />
      </div>
    </div>
  );
}
