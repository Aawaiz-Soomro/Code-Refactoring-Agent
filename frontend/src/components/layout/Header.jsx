import React, { useState } from 'react';
import { RefreshCw, CheckCircle, Database } from 'lucide-react';

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
    <header className="w-full flex items-center justify-between py-3 px-6 border-b-2 border-[var(--border-main)] bg-[var(--bg-card)] sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="px-2.5 py-1 border-2 border-[var(--border-main)] bg-[var(--border-main)] text-[var(--bg-card)] shadow-[2px_2px_0px_0px_#111111] rounded-none flex items-center justify-center font-mono font-black text-lg tracking-tighter select-none">
          //CR
        </div>
        <div>
          <h1 className="text-xl font-black tracking-tighter text-[var(--text-primary)] uppercase m-0 flex items-center gap-2">
            Context-Aware Code Refactorer
          </h1>
          <p className="text-[10px] uppercase font-mono font-bold text-[var(--text-secondary)] tracking-widest mt-0.5">Adversarial Multi-Agent Audit Pipeline</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {message && (
          <span className="text-xs font-bold font-mono px-3 py-1.5 border-2 border-black bg-[var(--color-architect)] text-black flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#111111]">
            <CheckCircle className="w-3.5 h-3.5" />
            {message}
          </span>
        )}
        <button
          onClick={triggerIngest}
          disabled={ingesting}
          className="brutalist-btn flex items-center gap-2 px-4 py-2 text-xs"
          title="Trigger ingestion of guidelines files from the local knowledge base directory"
        >
          <Database className="w-4 h-4" />
          <span>INGEST BRAIN</span>
          <RefreshCw className={`w-3 h-3 ${ingesting ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </header>
  );
}
