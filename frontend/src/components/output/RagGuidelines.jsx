import React from 'react';
import { Bookmark, ShieldAlert } from 'lucide-react';

export default function RagGuidelines({ guidelines = [] }) {
  return (
    <div className="flex-1 p-6 text-left overflow-y-auto max-h-[600px] font-sans flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-white/10 pb-3 mb-1">
        <Bookmark className="w-4 h-4 text-violet-400" />
        <h2 className="text-sm font-bold text-white uppercase tracking-wider">Applied Guidelines Library</h2>
      </div>
      
      {guidelines.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic p-8 select-none">
          No guidelines were retrieved during the audit.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3.5">
          {guidelines.map((guide, idx) => (
            <div key={idx} className="p-4 rounded-lg border border-[rgba(255,255,255,0.06)] bg-white/2 hover:bg-white/4 hover:border-white/10 transition-all duration-200">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="text-xs font-bold text-violet-400 select-none flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  {guide}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400 select-none">
                  Active
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium">
                Verified compliance with institutional {guide} requirements.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
