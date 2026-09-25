import React, { useState } from 'react';
import { Search, Play, X, Zap, HelpCircle, History } from 'lucide-react';

interface KQLSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  onRunQuery: (query: string) => void;
  onClearQuery: () => void;
  matchedCount: number;
  totalCount: number;
  queryTimeMs: number;
  onOpenCheatSheet: () => void;
  queryHistory: string[];
}

export const KQLSearchBar: React.FC<KQLSearchBarProps> = ({
  query,
  onQueryChange,
  onRunQuery,
  onClearQuery,
  matchedCount,
  totalCount,
  queryTimeMs,
  onOpenCheatSheet,
  queryHistory,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  const quickFilterPills = [
    { label: 'All Logs', query: '*' },
    { label: 'EDR Alerts', query: 'SecurityAlert | where Severity in ("high", "critical")' },
    { label: 'Sysmon ID 1 (Proc)', query: 'Sysmon | where EventID == 1' },
    { label: 'Sysmon ID 3 (Net)', query: 'Sysmon | where EventID == 3' },
    { label: 'Sysmon ID 11 (File)', query: 'Sysmon | where EventID == 11' },
    { label: 'Logons (4624)', query: 'Security | where EventID == 4624' },
    { label: 'Host: WKSTN-014', query: 'host.hostname == "WKSTN-CORP-014"' },
    { label: 'Host: FS-CORP-01', query: 'host.hostname == "FS-CORP-01"' },
    { label: 'Process: powershell', query: 'ProcessName contains "powershell"' },
    { label: 'Process: updater.exe', query: 'ProcessName == "updater.exe"' },
    { label: 'Port 445 (SMB)', query: 'dest_port == 445' },
    { label: 'C2 IP: 185.220.101.5', query: 'dest_ip == "185.220.101.5"' },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onRunQuery(query);
      setShowHistory(false);
    }
  };

  return (
    <div className="bg-zinc-950 border-b border-zinc-800 p-3 space-y-2">
      {/* Primary KQL Input Row */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='KQL Query (e.g., DeviceProcessEvents | where ProcessName == "powershell.exe" | where CommandLine contains "bypass") or search terms...'
            className="w-full bg-zinc-900 border border-zinc-700/80 rounded-md pl-9 pr-24 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
          />

          <div className="absolute inset-y-0 right-0 pr-2 flex items-center space-x-1.5">
            {query && (
              <button
                onClick={onClearQuery}
                className="text-zinc-500 hover:text-zinc-300 p-1 rounded"
                title="Clear query"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {queryHistory.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="text-zinc-400 hover:text-cyan-400 p-1 rounded"
                  title="Query History"
                >
                  <History className="w-4 h-4" />
                </button>

                {showHistory && (
                  <div className="absolute right-0 top-8 w-80 bg-zinc-900 border border-zinc-700 rounded-md shadow-xl z-50 p-2 font-mono text-xs">
                    <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 text-zinc-400 font-bold">
                      <span>Recent Queries</span>
                      <button
                        onClick={() => setShowHistory(false)}
                        className="text-zinc-500 hover:text-zinc-300"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pt-1.5">
                      {queryHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            onQueryChange(item);
                            onRunQuery(item);
                            setShowHistory(false);
                          }}
                          className="w-full text-left truncate text-zinc-300 hover:text-cyan-300 hover:bg-zinc-800 px-2 py-1 rounded"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Run Button */}
        <button
          onClick={() => onRunQuery(query)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-sm font-medium rounded-md shadow-sm shadow-cyan-950 transition-colors shrink-0"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Execute</span>
        </button>

        {/* Cheat sheet trigger */}
        <button
          onClick={onOpenCheatSheet}
          className="flex items-center space-x-1 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md font-mono text-sm transition-colors shrink-0"
          title="KQL Syntax Help"
        >
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">Syntax Guide</span>
        </button>
      </div>

      {/* Quick Filter Pills Row & Query Telemetry */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto text-xs font-mono">
          <span className="text-[11px] uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline">
            Filters:
          </span>
          {quickFilterPills.map((pill, idx) => {
            const isActive = query === pill.query;
            return (
              <button
                key={idx}
                onClick={() => {
                  onQueryChange(pill.query);
                  onRunQuery(pill.query);
                }}
                className={`px-2.5 py-0.8 rounded text-xs transition-all ${
                  isActive
                    ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-semibold'
                    : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        {/* Execution Metrics */}
        <div className="flex items-center space-x-3 text-xs font-mono text-zinc-400 ml-auto shrink-0">
          <div className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>
              <span className="text-zinc-200 font-semibold">{matchedCount}</span> of{' '}
              <span className="text-zinc-400">{totalCount}</span> events
            </span>
          </div>
          <span className="text-zinc-700">|</span>
          <div className="text-emerald-400">
            <span>{queryTimeMs} ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};
