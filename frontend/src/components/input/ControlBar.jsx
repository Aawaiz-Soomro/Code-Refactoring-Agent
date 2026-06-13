import React from 'react';
import { Play, Loader2, Cpu } from 'lucide-react';

export default function ControlBar({
  language,
  setLanguage,
  maxLoops,
  setMaxLoops,
  onSubmit,
  loading
}) {
  return (
    <div className="w-full flex items-center justify-between p-3.5 rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0d0d15]/50 backdrop-blur-md">
      <div className="flex items-center gap-4">
        {/* Language Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 tracking-wider select-none">LANGUAGE</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="bg-[#12121a] border border-[rgba(255,255,255,0.08)] rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:outline-none focus:border-violet-500 disabled:opacity-50 cursor-pointer"
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
          </select>
        </div>

        {/* Max Loops Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-bold text-gray-500 tracking-wider select-none">MAX AUDIT LOOPS</label>
          <div className="flex items-center gap-2">
            <input
              type="range"
              min="1"
              max="5"
              value={maxLoops}
              onChange={(e) => setMaxLoops(parseInt(e.target.value))}
              disabled={loading}
              className="w-24 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500 disabled:opacity-50"
            />
            <span className="text-xs font-bold text-violet-400 select-none w-4">{maxLoops}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 shadow-md shadow-violet-600/25 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
      >
        {loading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>Refactoring...</span>
          </>
        ) : (
          <>
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Refactor Code</span>
          </>
        )}
      </button>
    </div>
  );
}
