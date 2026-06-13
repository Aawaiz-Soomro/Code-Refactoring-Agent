import React, { useState, useEffect } from 'react';
import Header from './components/layout/Header';
import SplitPane from './components/layout/SplitPane';
import CodeEditor from './components/input/CodeEditor';
import ControlBar from './components/input/ControlBar';
import LiveTerminal from './components/stream/LiveTerminal';
import OutputTabs from './components/output/OutputTabs';
import useRefactor from './hooks/useRefactor';
import useSSE from './hooks/useSSE';
import { ShieldAlert, Info } from 'lucide-react';

const SAMPLES = {
  python: `import sqlite3
import hashlib

# VIOLATION: Hardcoded DB credentials/secrets (Rule SEC-003)
DB_SECRET_KEY = "super-secret-crypto-key-123"

def get_user_data(email):
    # VIOLATION: SQL injection vulnerability (Rule SEC-001)
    conn = sqlite3.connect("users.db")
    cursor = conn.cursor()
    query = f"SELECT * FROM users WHERE email = '{email}'"
    cursor.execute(query)
    return cursor.fetchone()

def hash_password(password):
    # VIOLATION: Weak hashing algorithm (Rule SEC-006)
    hasher = hashlib.md5()
    hasher.update(password.encode('utf-8'))
    return hasher.hexdigest()

def update_profile(email, bio):
    # VIOLATION: Bare exception handling and no logger usage (Rule ERR-003, ERR-004)
    try:
        conn = sqlite3.connect("users.db")
        cursor = conn.cursor()
        cursor.execute("UPDATE users SET bio = ? WHERE email = ?", (bio, email))
        conn.commit()
    except:
        # VIOLATION: Suppressing exception silently (Rule ERR-004)
        pass
`,
  javascript: `const pg = require('pg');

// VIOLATION: Hardcoded key (Rule SEC-003)
const API_SECRET_TOKEN = "xyz_jwt_token_key";

async function loginUser(req, res) {
  const { username, password } = req.body;
  
  // VIOLATION: SQL Injection (Rule SEC-001)
  const client = new pg.Client();
  await client.connect();
  
  try {
    const query = \`SELECT * FROM users WHERE username = '\${username}' AND password = '\${password}'\`;
    const result = await client.query(query);
    
    if (result.rows.length === 0) {
      // VIOLATION: Root array response API violation (Rule API-006)
      return res.status(200).json(["User not found"]);
    }
    
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    // VIOLATION: Leaking stack trace in API error (Rule ERR-006)
    return res.status(500).json({ error: err.stack });
  }
}
`
};

export default function App() {
  const [language, setLanguage] = useState('python');
  const [maxLoops, setMaxLoops] = useState(3);
  const [inputCode, setInputCode] = useState(SAMPLES.python);

  const { refactorCode, loading: submitLoading, error: submitError } = useRefactor();
  const {
    events,
    finalCode,
    auditSummary,
    appliedGuidelines,
    status,
    triggerStream,
    resetStream
  } = useSSE();

  // Load language sample code when language changes
  useEffect(() => {
    setInputCode(SAMPLES[language]);
  }, [language]);

  const handleSubmit = async () => {
    resetStream();
    try {
      const sessionId = await refactorCode(inputCode, language, maxLoops);
      triggerStream(sessionId);
    } catch (e) {
      console.error(e);
    }
  };

  const isRunning = status === 'running';

  return (
    <div className="min-h-screen flex flex-col bg-[var(--bg-main)] text-[var(--text-primary)] relative z-0">
      {/* Premium Header */}
      <Header />

      {/* Main Resizable Workspace */}
      <main className="flex-1 flex overflow-hidden">
        <SplitPane>
          {/* Left Panel: Input & Live Console */}
          <div className="h-full flex flex-col gap-4 overflow-hidden">
            {/* Input Editor */}
            <div className="flex-1 flex flex-col min-h-[300px]">
              <CodeEditor
                value={inputCode}
                onChange={setInputCode}
                language={language}
                readOnly={isRunning}
              />
            </div>

            {/* Run Controls */}
            <ControlBar
              language={language}
              setLanguage={setLanguage}
              maxLoops={maxLoops}
              setMaxLoops={setMaxLoops}
              onSubmit={handleSubmit}
              loading={submitLoading || isRunning}
            />

            {/* SSE Stream Logs */}
            <div className="h-[250px] shrink-0 flex flex-col">
              <LiveTerminal events={events} />
            </div>
          </div>

          {/* Right Panel: Output Tabs */}
          <div className="h-full flex flex-col overflow-hidden">
            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2 font-medium select-none">
                <ShieldAlert className="w-4 h-4" />
                <span>Error: {submitError}</span>
              </div>
            )}
            
            <OutputTabs
              finalCode={finalCode}
              auditSummary={auditSummary}
              appliedGuidelines={appliedGuidelines}
              language={language}
              status={status}
            />
          </div>
        </SplitPane>
      </main>

      {/* Status Bar Footer */}
      <footer className="w-full py-2 px-6 border-t-2 border-[var(--border-main)] bg-[var(--bg-card)] flex items-center justify-between text-xs text-[var(--text-secondary)] font-bold font-mono select-none shrink-0 uppercase tracking-tight z-10 relative">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-none border border-black ${isRunning ? 'bg-[var(--color-rag)] animate-[mechanical-blink_1s_steps(2,end)_infinite]' : 'bg-[var(--color-architect)]'}`}></span>
            STATUS: {isRunning ? 'PROCESSING...' : status === 'complete' ? 'READY' : 'IDLE'}
          </span>
          {events.length > 0 && (
            <span className="text-[var(--text-muted)]">| SESSION ACTIVE</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-[var(--border-main)]" />
          <span>SYS.GEMINI_FLASH_2.5 // VEC.EMBED_2</span>
        </div>
      </footer>
    </div>
  );
}
