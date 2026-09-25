import React, { useState } from 'react';
import { PinnedIOC, IOCType } from '../types/telemetry';
import { 
  Pin, 
  Trash2, 
  Copy, 
  Check, 
  Plus, 
  Globe, 
  FileCode, 
  Terminal, 
  Server, 
  User, 
  Hash, 
  Save, 
  Clock,
  ExternalLink
} from 'lucide-react';

interface IOCPinboardProps {
  pinnedIOCs: PinnedIOC[];
  onRemoveIOC: (id: string) => void;
  onAddIOC: (type: IOCType, value: string, notes?: string) => void;
  notes: string;
  onNotesChange: (notes: string) => void;
  onExportDossier: () => void;
}

export const IOCPinboard: React.FC<IOCPinboardProps> = ({
  pinnedIOCs,
  onRemoveIOC,
  onAddIOC,
  notes,
  onNotesChange,
  onExportDossier,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newType, setNewType] = useState<IOCType>('ip');
  const [newValue, setNewValue] = useState('');
  const [newNote, setNewNote] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1000);
  };

  const handleCreateIOC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newValue.trim()) return;
    onAddIOC(newType, newValue.trim(), newNote.trim() || undefined);
    setNewValue('');
    setNewNote('');
    setIsAdding(false);
  };

  const getTypeIcon = (type: IOCType) => {
    switch (type) {
      case 'ip':
        return <Globe className="w-3.5 h-3.5 text-cyan-400" />;
      case 'domain':
        return <Globe className="w-3.5 h-3.5 text-amber-400" />;
      case 'file_hash':
        return <Hash className="w-3.5 h-3.5 text-emerald-400" />;
      case 'file_path':
        return <FileCode className="w-3.5 h-3.5 text-blue-400" />;
      case 'command':
        return <Terminal className="w-3.5 h-3.5 text-purple-400" />;
      case 'hostname':
        return <Server className="w-3.5 h-3.5 text-teal-400" />;
      case 'user':
        return <User className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Pin className="w-3.5 h-3.5 text-zinc-400" />;
    }
  };

  // Group IOCs by category
  const categories: { label: string; type: IOCType }[] = [
    { label: 'External IPs & Network', type: 'ip' },
    { label: 'C2 Domains & Hostnames', type: 'domain' },
    { label: 'Cryptographic Hashes', type: 'file_hash' },
    { label: 'Staged File Paths', type: 'file_path' },
    { label: 'Malicious Command Lines', type: 'command' },
    { label: 'Compromised Hosts & Users', type: 'hostname' },
  ];

  return (
    <div className="flex-1 flex flex-col md:flex-row min-h-0 bg-zinc-950 font-mono text-xs text-zinc-200">
      {/* Left Column: Pinned IOC Artifacts (60%) */}
      <div className="flex-1 flex flex-col min-h-0 border-r border-zinc-800">
        {/* Sub-header */}
        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pin className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-sm text-zinc-100">
              Forensic Evidence & Indicators of Compromise (IOCs)
            </span>
            <span className="text-zinc-500 text-xs">({pinnedIOCs.length} items pinned)</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsAdding(!isAdding)}
              className="flex items-center space-x-1 px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Add Custom IOC</span>
            </button>
            <button
              onClick={onExportDossier}
              className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-emerald-300 rounded text-xs transition-colors"
            >
              <span>Export Dossier</span>
            </button>
          </div>
        </div>

        {/* Optional Add IOC Form */}
        {isAdding && (
          <form onSubmit={handleCreateIOC} className="p-3 bg-zinc-900/90 border-b border-zinc-800 space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-zinc-400 text-[10px] block mb-0.5">IOC Type:</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as IOCType)}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
                >
                  <option value="ip">IPv4 Address</option>
                  <option value="domain">Domain Name</option>
                  <option value="file_hash">SHA256 / MD5 Hash</option>
                  <option value="file_path">File Path</option>
                  <option value="command">Command Line</option>
                  <option value="hostname">Host Endpoint</option>
                  <option value="user">User Account</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="text-zinc-400 text-[10px] block mb-0.5">IOC Value:</label>
                <input
                  type="text"
                  value={newValue}
                  onChange={e => setNewValue(e.target.value)}
                  placeholder="e.g., 185.220.101.5 or updater.exe"
                  className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="text-zinc-400 text-[10px] block mb-0.5">Analyst Note / Context:</label>
              <input
                type="text"
                value={newNote}
                onChange={e => setNewNote(e.target.value)}
                placeholder="Observed in Phase 1 triage from EXCEL macro..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded p-1 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2.5 py-1 text-zinc-400 hover:text-zinc-200 text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
              >
                Save IOC
              </button>
            </div>
          </form>
        )}

        {/* IOC List Display */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {pinnedIOCs.length === 0 ? (
            <div className="py-20 text-center text-zinc-500 space-y-2">
              <Pin className="w-8 h-8 mx-auto text-zinc-600" />
              <p className="text-zinc-400 font-semibold text-sm">No Indicators Pinned Yet.</p>
              <p className="text-xs text-zinc-600 max-w-md mx-auto">
                As you triage logs in the SIEM Explorer, click any cell value or the pin icon to capture evidence for your debrief.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {pinnedIOCs.map(ioc => (
                <div
                  key={ioc.id}
                  className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 flex items-start justify-between space-x-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                    <div className="pt-0.5">{getTypeIcon(ioc.type)}</div>
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] uppercase font-bold text-zinc-500">
                          {ioc.type.replace('_', ' ')}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          Phase {ioc.phaseDiscovered}
                        </span>
                      </div>
                      <div
                        className="text-cyan-300 font-bold text-xs break-all select-all font-mono"
                        title={ioc.value}
                      >
                        {ioc.value}
                      </div>
                      {ioc.notes && (
                        <p className="text-zinc-400 text-[11px] leading-tight italic">
                          "{ioc.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => handleCopy(ioc.id, ioc.value)}
                      className="p-1.5 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
                      title="Copy IOC value"
                    >
                      {copiedId === ioc.id ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={() => onRemoveIOC(ioc.id)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition-colors"
                      title="Unpin IOC"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Investigation Notebook & Scratchpad (40%) */}
      <div className="w-full md:w-96 flex flex-col min-h-0 bg-zinc-950">
        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileCode className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-sm text-zinc-100">
              Analyst Investigation Notes
            </span>
          </div>
          <span className="text-emerald-400 text-[10px] flex items-center space-x-1">
            <Save className="w-3 h-3" />
            <span>Auto-saved</span>
          </span>
        </div>

        <div className="flex-1 p-3 flex flex-col min-h-0 space-y-2">
          <p className="text-[11px] text-zinc-400">
            Maintain your chronological hypotheses, command decoding notes, and findings. These are fed directly into the Shift Lead for debrief context.
          </p>

          <textarea
            value={notes}
            onChange={e => onNotesChange(e.target.value)}
            placeholder={`[09:16 UTC] Workstation WKSTN-CORP-014:\n- Marcus Jenkins opened Q1_Expense_Reconciliation.xlsm from Outlook.\n- EXCEL.EXE (PID 4820) spawned cmd.exe with obfuscated PowerShell bypass command.\n- Command decoded: Downloads stage-2 payload from 185.220.101.5...`}
            className="flex-1 w-full bg-zinc-900/80 border border-zinc-800 rounded-lg p-3 font-mono text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-none leading-relaxed"
          />

          <div className="pt-1 flex items-center justify-between text-[11px] text-zinc-500">
            <span>{notes.length} characters written</span>
            <button
              onClick={() => onNotesChange('')}
              className="text-zinc-600 hover:text-red-400"
            >
              Clear Scratchpad
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
