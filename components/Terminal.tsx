'use client';

import { useEffect, useRef } from 'react';

interface TerminalProps {
  logs: string[];
  isRunning: boolean;
}

export default function Terminal({ logs, isRunning }: TerminalProps) {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="neumorphic-card bg-card border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></span>
          Live Terminal
        </h3>
        <span className="text-xs text-muted-foreground">{logs.length} events</span>
      </div>

      <div
        ref={terminalRef}
        className="bg-black/5 dark:bg-black/20 rounded-lg p-4 font-mono text-sm text-foreground overflow-y-auto max-h-64 border border-border/50"
      >
        {logs.length === 0 ? (
          <div className="text-muted-foreground">$ Waiting for commands...</div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="text-muted-foreground">
              $ {log}
            </div>
          ))
        )}
        {isRunning && (
          <div className="text-primary animate-pulse">▌</div>
        )}
      </div>
    </div>
  );
}
