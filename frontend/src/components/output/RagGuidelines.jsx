import React from 'react';
import { Bookmark } from 'lucide-react';

export default function RagGuidelines({ guidelines = [] }) {
  return (
    <div className="flex-1 p-6 text-left overflow-y-auto max-h-[600px] font-sans flex flex-col gap-6">
      <div className="flex items-center gap-3 border-b-4 border-[var(--border-main)] pb-3 mb-2">
        <Bookmark className="w-6 h-6 text-[var(--border-main)] fill-current" />
        <h2 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter">Applied Guidelines Library</h2>
      </div>
      
      {guidelines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] italic p-8 select-none font-bold">
          NO GUIDELINES WERE RETRIEVED DURING THE AUDIT.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {guidelines.map((guide, idx) => (
            <div key={idx} className="p-5 border-2 border-[var(--border-main)] bg-[var(--bg-panel)] shadow-[4px_4px_0px_0px_#111111] transition-transform duration-100 hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[3px_3px_0px_0px_#111111]">
              <div className="flex items-center justify-between gap-4 mb-3">
                <span className="text-sm font-black text-[var(--border-main)] select-none flex items-center gap-2 uppercase tracking-wide">
                  <span className="w-2 h-2 bg-[var(--border-main)]"></span>
                  {guide}
                </span>
                <span className="text-[10px] font-black px-2 py-0.5 border-2 border-[var(--border-main)] bg-[var(--color-rag)] text-white select-none uppercase tracking-widest">
                  Active
                </span>
              </div>
              <p className="text-xs text-[var(--text-secondary)] font-bold">
                VERIFIED COMPLIANCE WITH INSTITUTIONAL {guide.toUpperCase()} REQUIREMENTS.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
