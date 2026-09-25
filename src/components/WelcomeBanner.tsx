import React, { useState } from 'react';
import { 
  GraduationCap, 
  Sparkles, 
  Terminal, 
  ShieldAlert, 
  GitFork, 
  Bot, 
  X, 
  ChevronRight, 
  FileText, 
  Play, 
  Info,
  CheckCircle2,
  ExternalLink,
  Layers,
  Zap
} from 'lucide-react';

interface WelcomeBannerProps {
  onRunSampleQuery: (query: string) => void;
  onOpenTourModal: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onRunSampleQuery,
  onOpenTourModal,
}) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(() => {
    return localStorage.getItem('opensoc_welcome_dismissed') === 'true';
  });

  if (isDismissed) return null;

  const handleDismiss = () => {
    setIsDismissed(true);
    localStorage.setItem('opensoc_welcome_dismissed', 'true');
  };

  return (
    <div className="bg-gradient-to-r from-cyan-950/80 via-zinc-900 to-purple-950/80 border-b border-cyan-800/60 p-4 font-mono text-xs text-zinc-200 select-none animate-in fade-in duration-200">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        {/* Left: Headline & Core Pitch */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center space-x-2 flex-wrap">
            <span className="flex items-center space-x-1.5 px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold text-[11px]">
              <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
              <span>FACULTY & INTERVIEWER BRIEFING</span>
            </span>

            <span className="text-zinc-500 hidden sm:inline">•</span>

            <span className="text-zinc-300 font-semibold text-xs">
              Welcome to <span className="text-cyan-400 font-bold">OpenSOC Studio</span>
            </span>

            <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-700/60 text-[10px]">
              Zero-Cloud-Cost Telemetry
            </span>
          </div>

          <p className="text-zinc-300 text-xs leading-relaxed max-w-4xl">
            A production-grade, browser-native Tier-1 & Tier-2 SOC training simulation. Instead of heavy $50/student cloud VM labs or string-guessing CTF flags, students triage 1,300+ deterministic enterprise logs, craft real <strong>Microsoft Sentinel / Defender KQL</strong> queries, map MITRE ATT&CK techniques, and defend their findings in <strong>Socratic AI Debriefs</strong> with Shift Lead Alex Mercer.
          </p>

          {/* Quick Feature Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
            <span className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>In-Memory KQL Engine (&lt;2ms)</span>
            </span>
            <span className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
              <Bot className="w-3 h-3 text-purple-400" />
              <span>Dual-Engine AI Shift Lead</span>
            </span>
            <span className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
              <GitFork className="w-3 h-3 text-emerald-400" />
              <span>Process Tree Visualizer</span>
            </span>
            <span className="flex items-center space-x-1 bg-zinc-900/80 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              <span>Operation Cobalt Drift Kill Chain</span>
            </span>
          </div>
        </div>

        {/* Right: Quick Action Controls */}
        <div className="flex items-center space-x-2 shrink-0 self-end lg:self-center">
          <button
            onClick={() => onRunSampleQuery('DeviceProcessEvents | where ProcessName in ("EXCEL.EXE", "powershell.exe", "cmd.exe")')}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs transition-colors shadow-sm shadow-cyan-950"
            title="Inspect Phase 1 Initial Access telemetry immediately"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Test Detection Query</span>
          </button>

          <button
            onClick={onOpenTourModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-cyan-700/60 text-cyan-300 rounded font-semibold text-xs transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>Full System Architecture</span>
          </button>

          <button
            onClick={handleDismiss}
            className="p-1.5 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded transition-colors ml-1"
            title="Dismiss Welcome Banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
