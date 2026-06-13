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
    <div className="min-h-screen flex flex-col bg-[#050508] text-[#f3f4f6]">
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
      <footer className="w-full py-2 px-6 border-t border-[rgba(255,255,255,0.06)] bg-[#07070a] flex items-center justify-between text-[10px] text-gray-500 font-medium select-none shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${isRunning ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            Status: {isRunning ? 'Running' : status === 'complete' ? 'Completed' : 'Idle'}
          </span>
          {events.length > 0 && (
            <span className="text-gray-600">| Session active</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-gray-600" />
          <span>Powered by Gemini 2.5 Flash & text-embedding-004</span>
        </div>
      </footer>
    </div>
  );
}
