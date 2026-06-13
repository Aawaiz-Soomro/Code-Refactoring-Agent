import React from 'react';
import CodeEditor from '../input/CodeEditor';

export default function RefactoredCode({ code = '', language = 'python' }) {
  return (
    <div className="flex-1 flex flex-col p-4">
      <CodeEditor value={code} language={language} readOnly={true} />
    </div>
  );
}
