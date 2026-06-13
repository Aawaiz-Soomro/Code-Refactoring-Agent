import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AuditSummary({ summary = '' }) {
  return (
    <div className="flex-1 p-6 text-left overflow-y-auto max-h-[600px] font-sans">
      <div className="prose prose-invert max-w-none text-sm leading-relaxed text-gray-300">
        <ReactMarkdown 
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white border-b border-white/10 pb-2 mt-0 mb-4" {...props} />,
            h2: ({node, ...props}) => <h2 className="text-base font-bold text-white mt-6 mb-2 border-b border-white/5 pb-1" {...props} />,
            h3: ({node, ...props}) => <h3 className="text-sm font-bold text-violet-400 mt-4 mb-1" {...props} />,
            p: ({node, ...props}) => <p className="mb-3 text-gray-300 leading-relaxed" {...props} />,
            ul: ({node, ...props}) => <ul className="list-disc list-inside mb-4 text-gray-300 space-y-1" {...props} />,
            ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-4 text-gray-300 space-y-1" {...props} />,
            li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
            code: ({node, inline, className, children, ...props}) => {
              const match = /language-(\w+)/.exec(className || '');
              return !inline ? (
                <pre className="bg-[#0f0f16]/90 border border-white/5 rounded-lg p-3 my-3 overflow-x-auto font-mono text-xs text-gray-200">
                  <code className={className} {...props}>
                    {children}
                  </code>
                </pre>
              ) : (
                <code className="bg-white/5 border border-white/10 rounded px-1.5 py-0.5 font-mono text-xs text-violet-400" {...props}>
                  {children}
                </code>
              );
            },
            blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-violet-500 bg-violet-500/5 px-4 py-2 my-4 rounded-r italic text-gray-400" {...props} />,
            table: ({node, ...props}) => <table className="w-full text-left border-collapse border border-white/10 my-4 text-xs" {...props} />,
            th: ({node, ...props}) => <th className="border border-white/10 bg-white/5 px-3 py-2 font-bold text-white" {...props} />,
            td: ({node, ...props}) => <td className="border border-white/10 px-3 py-2 text-gray-300" {...props} />,
          }}
        >
          {summary || '*No audit summary compiled.*'}
        </ReactMarkdown>
      </div>
    </div>
  );
}
