import React, { useState } from 'react';
import { Brain, RefreshCw, CheckCircle, Database } from 'lucide-react';

export default function Header() {
  const [ingesting, setIngesting] = useState(false);
  const [message, setMessage] = useState('');

  const triggerIngest = async () => {
    setIngesting(true);
    setMessage('');
    try {
      const response = await fetch('/api/guidelines/ingest', { method: 'POST' });
      const data = await response.json();
      setMessage('Ingestion started!');
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage('Failed to start ingestion.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setIngesting(false);
    }
  };

  return (
    <header className="w-full flex items-center justify-between py-4 px-6 border-b border-[rgba(255,255,255,0.06)] bg-[rgba(10,10,15,0.7)] backdrop-blur-md sticky top-0 z-50">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-gradient-to-tr from-violet-600 to-blue-500 rounded-lg shadow-lg shadow-violet-500/20">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white m-0 flex items-center gap-2">
            Context-Aware Code Refactorer
          </h1>
          <p className="text-xs text-gray-400 font-medium">Adversarial Multi-Agent Audit Pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {message && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center gap-1.5 animate-pulse">
            <CheckCircle className="w-3.5 h-3.5" />
            {message}
          </span>
        )}
        <button
          onClick={triggerIngest}
          disabled={ingesting}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-[rgba(255,255,255,0.08)] bg-white/5 hover:bg-white/10 text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          title="Trigger ingestion of guidelines files from the local knowledge base directory"
        >
          <Database className="w-3.5 h-3.5" />
          <span>Ingest Brain</span>
          <RefreshCw className={`w-3 h-3 ${ingesting ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
