import React, { useState } from 'react';
import { FileCode, FileText, Bookmark, Loader2 } from 'lucide-react';
import RefactoredCode from './RefactoredCode';
import AuditSummary from './AuditSummary';
import RagGuidelines from './RagGuidelines';

export default function OutputTabs({
  finalCode = '',
  auditSummary = '',
  appliedGuidelines = [],
  language = 'python',
  status = 'idle'
}) {
  const [activeTab, setActiveTab] = useState('code');

  const tabs = [
    { id: 'code', label: 'REFACTORED CODE', icon: FileCode },
    { id: 'audit', label: 'QA AUDIT SUMMARY', icon: FileText },
    { id: 'guidelines', label: 'APPLIED GUIDELINES', icon: Bookmark }
  ];

  const renderTabContent = () => {
    if (status === 'idle') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-secondary)] italic p-8 select-none font-bold uppercase">
          Awaiting input source code...
        </div>
      );
    }
    
    if (status === 'running') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-[var(--text-primary)] p-8 select-none bg-[var(--bg-panel)]">
          <Loader2 className="w-8 h-8 animate-spin mb-3 text-[var(--text-primary)]" strokeWidth={2.5} />
          <p className="text-sm font-black uppercase tracking-widest animate-[mechanical-blink_1s_steps(2,end)_infinite]">Compiling Output...</p>
        </div>
      );
    }

    switch (activeTab) {
      case 'audit':
        return <AuditSummary summary={auditSummary} />;
      case 'guidelines':
        return <RagGuidelines guidelines={appliedGuidelines} />;
      case 'code':
      default:
        return <RefactoredCode code={finalCode} language={language} />;
    }
  };

  return (
    <div className="brutalist-panel w-full flex-1 flex flex-col rounded-none overflow-hidden shrink-0">
      {/* Tab Header Selector */}
      <div className="flex border-b-2 border-[var(--border-main)] bg-[var(--bg-main)] select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-[10px] font-black tracking-widest border-r-2 last:border-r-0 border-b-4 cursor-pointer transition-none uppercase ${
                isActive
                  ? 'border-b-[var(--border-main)] border-r-[var(--border-main)] text-[var(--bg-card)] bg-[var(--text-primary)]'
                  : 'border-b-transparent border-r-[var(--border-main)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-panel)]'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={2.5} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 flex flex-col overflow-auto bg-[var(--bg-card)]">
        {renderTabContent()}
      </div>
    </div>
  );
}
