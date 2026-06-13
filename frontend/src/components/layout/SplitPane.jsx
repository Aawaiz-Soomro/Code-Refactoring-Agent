import React, { useState, useEffect, useRef } from 'react';

export default function SplitPane({ children }) {
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('split-pane-width');
    return saved ? parseFloat(saved) : 50;
  });
  
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const startResize = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging || !containerRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Enforce bounds (e.g. 30% to 70%)
      if (newWidth >= 30 && newWidth <= 70) {
        setLeftWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        localStorage.setItem('split-pane-width', leftWidth.toString());
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, leftWidth]);

  const [leftPane, rightPane] = React.Children.toArray(children);

  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex w-full overflow-hidden select-none"
      style={{ cursor: isDragging ? 'col-resize' : 'default' }}
    >
      {/* Left Pane */}
      <div 
        className="h-full overflow-y-auto flex flex-col p-4 gap-4"
        style={{ width: `${leftWidth}%` }}
      >
        {leftPane}
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={startResize}
        className={`w-2 h-full border-x-2 border-[var(--border-main)] cursor-col-resize hover:bg-[var(--text-primary)] transition-colors duration-100 relative flex items-center justify-center ${
          isDragging ? 'bg-[var(--text-primary)]' : 'bg-[var(--bg-card)]'
        }`}
      >
        <div className={`flex flex-col gap-1 pointer-events-none ${isDragging ? 'opacity-0' : 'opacity-100'}`}>
          <span className="w-1 h-1 bg-[var(--border-main)]"></span>
          <span className="w-1 h-1 bg-[var(--border-main)]"></span>
          <span className="w-1 h-1 bg-[var(--border-main)]"></span>
        </div>
      </div>

      {/* Right Pane */}
      <div 
        className="h-full overflow-y-auto flex flex-col p-4 gap-4"
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPane}
      </div>
    </div>
  );
}
