import React from 'react';
import { 
  ShieldAlert, 
  Terminal, 
  Cpu, 
  GitFork, 
  FileText, 
  Grid, 
  BookOpen, 
  RotateCcw,
  Sparkles,
  ChevronRight,
  CheckCircle2,
  Lock,
  GraduationCap
} from 'lucide-react';
import { InvestigationPhase } from '../types/telemetry';

interface HeaderProps {
  phases: InvestigationPhase[];
  currentPhaseId: number;
  unlockedPhaseId: number;
  onSelectPhase: (phaseId: number) => void;
  aiEngineStatus: 'gemini-3.8-flash' | 'deterministic-socratic';
  onOpenCheatSheet: () => void;
  onOpenProcessTree: () => void;
  onOpenMitre: () => void;
  onOpenDossier: () => void;
  onOpenSettings: () => void;
  onOpenWelcomeTour: () => void;
  onResetInvestigation: () => void;
  activeTab: 'siem' | 'process_tree' | 'evidence' | 'mitre';
  setActiveTab: (tab: 'siem' | 'process_tree' | 'evidence' | 'mitre') => void;
  pinnedIocCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  phases,
  currentPhaseId,
  unlockedPhaseId,
  onSelectPhase,
  aiEngineStatus,
  onOpenCheatSheet,
  onOpenDossier,
  onOpenSettings,
  onOpenWelcomeTour,
  onResetInvestigation,
  activeTab,
  setActiveTab,
  pinnedIocCount,
}) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-zinc-100 sticky top-0 z-40 select-none">
      {/* Top Banner: Branding & Status */}
      <div className="px-4 py-2.5 flex items-center justify-between border-b border-zinc-800/80">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 bg-cyan-950/60 border border-cyan-800/60 px-2.5 py-1 rounded">
            <ShieldAlert className="w-5 h-5 text-cyan-400 animate-pulse" />
            <span className="font-mono font-bold tracking-wider text-sm text-cyan-200">
              OpenSOC<span className="text-cyan-400">.Studio</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-2 text-xs text-zinc-400 font-mono bg-zinc-900 border border-zinc-800 px-2.5 py-1 rounded">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping mr-1" />
            <span className="text-zinc-300 font-semibold">INCIDENT:</span>
            <span className="text-red-400">CR-2025-0914 (Operation Cobalt Drift)</span>
            <span className="text-zinc-600">|</span>
            <span className="text-amber-400">SEV: CRITICAL</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-1 bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('siem')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'siem'
                ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-950'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>SIEM Telemetry</span>
          </button>
          <button
            onClick={() => setActiveTab('process_tree')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'process_tree'
                ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-950'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <GitFork className="w-3.5 h-3.5" />
            <span>Process Tree</span>
          </button>
          <button
            onClick={() => setActiveTab('evidence')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'evidence'
                ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-950'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Evidence & IOCs</span>
            {pinnedIocCount > 0 && (
              <span className="ml-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] px-1.5 py-0.2 rounded-full">
                {pinnedIocCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('mitre')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
              activeTab === 'mitre'
                ? 'bg-cyan-600 text-white font-medium shadow-sm shadow-cyan-950'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>ATT&CK Matrix</span>
          </button>
        </div>

        {/* Right Tools & Shift Lead Engine Mode */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenWelcomeTour}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-cyan-950/70 hover:bg-cyan-900/70 border border-cyan-700/60 text-cyan-300 rounded transition-colors"
            title="Faculty & Interviewer Briefing"
          >
            <GraduationCap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Faculty Guide</span>
          </button>

          <button
            onClick={onOpenCheatSheet}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/70 text-zinc-300 rounded transition-colors"
            title="KQL Cheat Sheet"
          >
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">KQL Queries</span>
          </button>

          <button
            onClick={onOpenDossier}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs font-mono bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/60 text-emerald-300 rounded transition-colors"
            title="Generate Incident Report"
          >
            <FileText className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export Dossier</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-2.5 py-1 text-xs font-mono bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 rounded transition-colors"
            title="AI Shift Lead Engine Mode"
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden lg:inline text-zinc-400">Shift Lead:</span>
            <span className="text-zinc-200 font-medium">
              {aiEngineStatus === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'Socratic Engine'}
            </span>
            <Sparkles className="w-3 h-3 text-amber-400" />
          </button>

          <button
            onClick={onResetInvestigation}
            className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 rounded transition-colors"
            title="Reset Scenario Progress"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Phased & Gated Playbook Bar */}
      <div className="px-4 py-2 bg-zinc-900/60 flex items-center justify-between overflow-x-auto text-xs font-mono scrollbar-none">
        <div className="flex items-center space-x-2 text-zinc-400 mr-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Playbook Phases:</span>
        </div>

        <div className="flex items-center space-x-2 overflow-x-auto">
          {phases.map((phase, idx) => {
            const isUnlocked = phase.id <= unlockedPhaseId;
            const isCurrent = phase.id === currentPhaseId;
            const isPassed = phase.id < unlockedPhaseId;

            return (
              <React.Fragment key={phase.id}>
                <button
                  onClick={() => isUnlocked && onSelectPhase(phase.id)}
                  disabled={!isUnlocked}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-cyan-950/80 border border-cyan-500 text-cyan-200 font-semibold shadow-sm'
                      : isPassed
                      ? 'bg-zinc-900/90 border border-emerald-800/80 text-emerald-300 hover:border-emerald-600'
                      : isUnlocked
                      ? 'bg-zinc-900 border border-zinc-700 text-zinc-300 hover:border-zinc-500'
                      : 'bg-zinc-950/50 border border-zinc-900 text-zinc-600 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center space-x-1.5">
                    {isPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : !isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-zinc-600" />
                    ) : (
                      <span className="w-4 h-4 rounded-full bg-cyan-900 text-cyan-300 flex items-center justify-center text-[10px] font-bold">
                        {phase.id}
                      </span>
                    )}
                    <span>{phase.code}</span>
                    <span className="hidden md:inline font-normal text-zinc-400">
                      - {phase.title}
                    </span>
                  </div>
                </button>

                {idx < phases.length - 1 && (
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-700 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className="hidden xl:flex items-center space-x-3 text-[11px] text-zinc-400 shrink-0 ml-4">
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Gate Passed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>Active Triage</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2 h-2 rounded-full bg-zinc-600" />
            <span>Gated Phase</span>
          </span>
        </div>
      </div>
    </header>
  );
};
