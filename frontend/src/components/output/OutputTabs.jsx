import React, { useState } from 'react';
import { FileCode, FileText, Bookmark } from 'lucide-react';
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
    { id: 'code', label: 'Refactored Code', icon: FileCode },
    { id: 'audit', label: 'QA Audit Summary', icon: FileText },
    { id: 'guidelines', label: 'Applied Guidelines', icon: Bookmark }
  ];

  const renderTabContent = () => {
    if (status === 'idle') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 italic p-8 select-none">
          No output available yet. Submit code to begin processing...
        </div>
      );
    }
    
    if (status === 'running') {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 select-none">
          <div className="w-8 h-8 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin mb-3"></div>
          <p className="text-xs font-semibold animate-pulse">Auditing code in progress...</p>
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
    <div className="w-full flex-1 flex flex-col rounded-xl overflow-hidden border border-[rgba(255,255,255,0.06)] bg-[#0d0d15]/50 backdrop-blur-md">
      {/* Tab Header Selector */}
      <div className="flex border-b border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] select-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 text-xs font-semibold border-b-2 cursor-pointer transition-all duration-200 ${
                isActive
                  ? 'border-violet-500 text-white bg-white/2'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-white/1'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Body */}
      <div className="flex-1 flex flex-col overflow-auto bg-black/10">
        {renderTabContent()}
      </div>
    </div>
  );
}
