import React, { useState } from 'react';
import { KQL_CHEAT_SHEET } from '../lib/kqlEngine';
import { X, BookOpen, Play, Copy, Check, Search, Terminal } from 'lucide-react';

interface KqlCheatSheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyQuery: (query: string) => void;
}

export const KqlCheatSheetModal: React.FC<KqlCheatSheetModalProps> = ({
  isOpen,
  onClose,
  onApplyQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  if (!isOpen) return null;

  const filteredQueries = KQL_CHEAT_SHEET.filter(
    item =>
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCopy = (query: string, index: number) => {
    navigator.clipboard.writeText(query);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 select-none font-mono text-xs">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-zinc-100">KQL Syntax & Threat Hunting Cheat Sheet</h2>
              <p className="text-[11px] text-zinc-400">Microsoft Sentinel & Defender Kusto syntax practical references</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-zinc-800 bg-zinc-900/40">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search KQL queries by keyword, category, or command..."
              className="w-full bg-zinc-950 border border-zinc-700/80 rounded-md pl-9 pr-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Query List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filteredQueries.map((item, idx) => (
            <div
              key={idx}
              className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg space-y-2 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] text-cyan-400 font-semibold uppercase tracking-wider block">
                    {item.category}
                  </span>
                  <span className="text-zinc-200 font-bold text-xs">
                    {item.title}
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0">
                  <button
                    onClick={() => handleCopy(item.query, idx)}
                    className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800"
                    title="Copy KQL query"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      onApplyQuery(item.query);
                      onClose();
                    }}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold shadow-xs"
                  >
                    <Play className="w-3 h-3 fill-white" />
                    <span>Run Query</span>
                  </button>
                </div>
              </div>

              <pre className="p-2 bg-zinc-950 border border-zinc-800/80 rounded text-cyan-300 font-mono text-[11px] whitespace-pre-wrap break-all select-all">
                {item.query}
              </pre>

              <p className="text-zinc-400 text-[11px]">
                {item.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Supported: <strong>| where</strong> (==, !=, contains, in), <strong>| summarize</strong>, <strong>| sort by</strong>, <strong>| take</strong></span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
