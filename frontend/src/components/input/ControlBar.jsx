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
    <div className="brutalist-panel w-full flex items-center justify-between p-4 bg-[var(--bg-panel)] rounded-none shrink-0">
      <div className="flex items-center gap-6">
        {/* Language Selection */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest select-none uppercase">Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={loading}
            className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-none px-3 py-1.5 text-xs text-[var(--text-primary)] font-bold focus:outline-none focus:ring-0 cursor-pointer shadow-[2px_2px_0px_0px_#111111]"
          >
            <option value="python">PYTHON</option>
            <option value="javascript">JAVASCRIPT</option>
          </select>
        </div>

        {/* Max Loops Selector */}
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-black text-[var(--text-secondary)] tracking-widest select-none uppercase">Max Audit Loops</label>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="5"
              value={maxLoops}
              onChange={(e) => setMaxLoops(parseInt(e.target.value))}
              disabled={loading}
              className="w-24 h-2 bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-none appearance-none cursor-pointer accent-black disabled:opacity-50"
            />
            <span className="text-xs font-black text-[var(--text-primary)] select-none w-4">{maxLoops}</span>
          </div>
        </div>
      </div>

      {/* Action CTA */}
      <button
        onClick={onSubmit}
        disabled={loading}
        className="brutalist-btn flex items-center gap-2 px-6 py-2.5 text-sm bg-[var(--color-rag)] border-2 border-black"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>PROCESSING...</span>
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            <span>EXECUTE AUDIT</span>
          </>
        )}
      </button>
    </div>
  );
}
