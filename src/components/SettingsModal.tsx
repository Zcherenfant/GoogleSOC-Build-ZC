import React from 'react';
import { X, Cpu, Sparkles, CheckCircle2, ShieldCheck, Database, RotateCcw } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  aiEngineStatus: 'gemini-3.8-flash' | 'deterministic-socratic';
  onResetInvestigation: () => void;
  pinnedIocCount: number;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  aiEngineStatus,
  onResetInvestigation,
  pinnedIocCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h2 className="text-sm font-bold text-zinc-100">AI Shift Lead & Engine Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded hover:bg-zinc-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4 text-zinc-300">
          {/* Dual-Engine Overview */}
          <div className="bg-zinc-900/70 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200">Active Shift Lead Engine:</span>
              <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>{aiEngineStatus === 'gemini-3.8-flash' ? 'Google Gemini 3.8 Flash' : 'Deterministic Socratic Engine'}</span>
              </span>
            </div>

            <p className="text-zinc-400 text-[11px] leading-relaxed">
              OpenSOC Studio features a dual-engine architecture. When a Gemini API key is configured on the backend, Shift Lead Alex Mercer leverages Gemini for contextual, organic debrief dialogues. If offline or without an API key, the built-in deterministic Socratic rule engine evaluates student deductions using exact scenario ground-truth criteria.
            </p>
          </div>

          {/* Engine Capabilities Comparison */}
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
              Architectural Engine Modes:
            </span>

            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-zinc-900/40 p-2.5 rounded border border-zinc-800 space-y-1">
                <div className="font-bold text-cyan-400 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Socratic Rule Engine</span>
                </div>
                <ul className="text-zinc-400 space-y-0.5 text-[10px]">
                  <li>• 100% Free / Zero API cost</li>
                  <li>• Sub-10ms instant validation</li>
                  <li>• Deterministic rubric grading</li>
                  <li>• Authentic SOC guidance</li>
                </ul>
              </div>

              <div className="bg-zinc-900/40 p-2.5 rounded border border-purple-900/50 space-y-1">
                <div className="font-bold text-purple-400 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Gemini 3.8 Flash</span>
                </div>
                <ul className="text-zinc-400 space-y-0.5 text-[10px]">
                  <li>• Natural Tier-3 supervisor chat</li>
                  <li>• Semantic reasoning evaluation</li>
                  <li>• Interactive Socratic coaching</li>
                  <li>• Automatic fallback on error</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Local State & Reset */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-zinc-200 flex items-center space-x-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
                <span>Browser State Persistence</span>
              </span>
              <span className="text-[10px] text-zinc-400">{pinnedIocCount} IOCs pinned</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              All playbook phases, debrief messages, and pinned IOCs are automatically stored in browser localStorage.
            </p>
            <button
              onClick={() => {
                onResetInvestigation();
                onClose();
              }}
              className="mt-1 w-full py-1.5 bg-red-950/60 hover:bg-red-900/60 border border-red-800/80 text-red-300 rounded text-xs transition-colors flex items-center justify-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Incident Investigation to Phase 1</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
