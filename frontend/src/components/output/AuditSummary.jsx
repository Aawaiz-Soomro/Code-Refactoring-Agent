import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AuditSummary({ summary = '' }) {
  return (
    <div className="flex-1 p-6 text-left overflow-y-auto max-h-[600px] font-mono">
      <div className="prose prose-sm max-w-none text-[var(--text-primary)]">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-2xl font-black text-[var(--border-main)] border-b-4 border-[var(--border-main)] pb-2 mt-0 mb-6 uppercase tracking-tight" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-xl font-black text-[var(--border-main)] mt-8 mb-4 border-b-2 border-[var(--border-main)] pb-1 uppercase tracking-tight" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-base font-bold text-[var(--border-main)] mt-6 mb-2 bg-[var(--bg-panel)] inline-block px-2 py-0.5 uppercase" {...props} />,
            p: ({node, ...props}) => <p className="mb-4 text-[var(--text-secondary)] font-medium leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-square list-inside mb-6 text-[var(--text-secondary)] space-y-2 font-medium" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-6 text-[var(--text-secondary)] space-y-2 font-medium" {...props} />,
            li: ({node, ...props}) => <li className="text-[var(--text-secondary)] marker:text-[var(--border-main)]" {...props} />,
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline ? (
                <pre className="bg-[var(--bg-card)] border-2 border-[var(--border-main)] rounded-none p-4 my-4 overflow-x-auto font-mono text-xs text-[var(--text-primary)] shadow-[4px_4px_0px_0px_#111111]">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code className="bg-[var(--bg-panel)] border border-[var(--border-main)] rounded-none px-1 py-0.5 font-mono text-xs font-bold text-[var(--border-main)]" {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-[var(--border-main)] bg-[var(--bg-panel)] px-4 py-3 my-6 font-bold italic text-[var(--text-secondary)]" {...props} />,
            table: ({node, ...props}) => <table className="w-full text-left border-collapse border-2 border-[var(--border-main)] my-6 text-sm" {...props} />,
            th: ({node, ...props}) => <th className="border-2 border-[var(--border-main)] bg-[var(--border-main)] px-4 py-2 font-black text-[var(--bg-card)] uppercase tracking-wider" {...props} />,
            td: ({node, ...props}) => <td className="border-2 border-[var(--border-main)] bg-[var(--bg-card)] px-4 py-2 text-[var(--text-secondary)] font-medium" {...props} />,
          }}
        >
          {summary || '*NO AUDIT SUMMARY COMPILED.*'}
        </ReactMarkdown>
      </div>
    </div>
  );
}
