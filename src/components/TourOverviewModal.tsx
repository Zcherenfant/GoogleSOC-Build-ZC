import React from 'react';
import { 
  X, 
  GraduationCap, 
  Terminal, 
  Bot, 
  GitFork, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Play, 
  Database, 
  Cpu, 
  Layers, 
  Search,
  BookOpen
} from 'lucide-react';

interface TourOverviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunSampleQuery: (query: string) => void;
}

export const TourOverviewModal: React.FC<TourOverviewModalProps> = ({
  isOpen,
  onClose,
  onRunSampleQuery,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 font-mono text-xs select-none">
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-cyan-950 border border-cyan-700 text-cyan-300">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm font-bold text-zinc-100">OpenSOC Studio: Architectural & Faculty Briefing</h2>
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-semibold">
                  v1.2 Production Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Evaluation guide for Professors, Technical Interviewers, and SOC Engineering Leads
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-zinc-300">
          {/* Executive Vision */}
          <div className="bg-zinc-900/70 border border-cyan-900/50 rounded-lg p-4 space-y-2">
            <h3 className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>1. The Pedagogical Problem & Our Solution</span>
            </h3>
            <p className="text-zinc-300 text-xs leading-relaxed">
              Traditional SOC training labs suffer from two major flaws:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded">
                <span className="text-red-400 font-bold text-xs block mb-1">Traditional Model Flaws</span>
                <ul className="text-zinc-400 space-y-1 text-[11px]">
                  <li>• Expensive cloud VMs ($30-$80/student/mo)</li>
                  <li>• 10-15 minute spin-up & connection latency</li>
                  <li>• Rigid CTF flags (guessing string formats)</li>
                  <li>• Zero feedback on analyst articulation</li>
                </ul>
              </div>

              <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded">
                <span className="text-emerald-400 font-bold text-xs block mb-1">OpenSOC Studio Innovation</span>
                <ul className="text-zinc-300 space-y-1 text-[11px]">
                  <li>• 100% in-browser, sub-100ms instant load times</li>
                  <li>• Zero external VM cost or cloud billing</li>
                  <li>• Socratic AI debriefs evaluate student reasoning</li>
                  <li>• Production Microsoft KQL syntax & process trees</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Core Architectural Pillars */}
          <div className="space-y-3">
            <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-purple-400" />
              <span>2. Core Technical Architecture</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* In-Memory SIEM */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>Columnar KQL Engine</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Pure TypeScript in-memory query engine supporting table scopes (<code className="text-cyan-300">DeviceProcessEvents</code>, <code className="text-cyan-300">Sysmon</code>, <code className="text-cyan-300">SecurityAlert</code>), boolean predicates, <code className="text-cyan-300">| where</code>, <code className="text-cyan-300">| summarize count() by ...</code>, and sub-2ms filtering over 1,300+ events.
                </p>
              </div>

              {/* Socratic AI Shift Lead */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center space-x-1.5 text-purple-400 font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>Dual-Engine Shift Lead</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  AI Shift Lead Alex Mercer interviews the student. Supports both <strong>Google Gemini 3.8 Flash</strong> and a built-in deterministic rubric matching engine with multi-model fallback to guarantee zero interruptions during peak demand.
                </p>
              </div>

              {/* Process Tree & MITRE */}
              <div className="bg-zinc-900/50 border border-zinc-800 p-3 rounded-lg space-y-1.5">
                <div className="flex items-center space-x-1.5 text-emerald-400 font-bold text-xs">
                  <GitFork className="w-4 h-4" />
                  <span>Process Hierarchy & Matrix</span>
                </div>
                <p className="text-zinc-400 text-[11px] leading-relaxed">
                  Reconstructs full parent-child process ancestry trees with attack chain highlighting, accompanied by an interactive MITRE ATT&CK Enterprise Matrix mapping every malicious technique.
                </p>
              </div>
            </div>
          </div>

          {/* 4-Stage Playbook Walkthrough */}
          <div className="space-y-3">
            <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>3. Scenario Narrative: "Operation Cobalt Drift"</span>
            </h3>

            <div className="space-y-2">
              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-zinc-200">Phase 1: Initial Access & Execution</span>
                  <p className="text-zinc-400 text-[11px]">
                    Macro-enabled lure <code className="text-cyan-300">Q1_Expense_Reconciliation.xlsm</code> opened in Outlook by Marcus Jenkins. <code className="text-amber-300">EXCEL.EXE (PID 4820)</code> spawns <code className="text-amber-300">cmd.exe</code> with obfuscated base64 PowerShell flags.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-zinc-200">Phase 2: Defense Evasion & Dropper Staging</span>
                  <p className="text-zinc-400 text-[11px]">
                    PowerShell downloads binary into <code className="text-cyan-300">AppData\Local\Temp\updater.exe</code> (SHA256: <code className="text-amber-300">a93b2f56...</code>) and spawns LOLBIN <code className="text-cyan-300">rundll32.exe net_worker.dll</code>.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  3
                </span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-zinc-200">Phase 3: Command & Control (C2) Beaconing</span>
                  <p className="text-zinc-400 text-[11px]">
                    Malicious updater resolves DNS for <code className="text-cyan-300">update-telemetry-service.com</code>, beacons to <code className="text-cyan-300">185.220.101.5:443</code>, and establishes Windows Registry Run key persistence.
                  </p>
                </div>
              </div>

              <div className="p-2.5 bg-zinc-900/60 border border-zinc-800 rounded flex items-start space-x-3">
                <span className="w-5 h-5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  4
                </span>
                <div className="space-y-0.5 text-xs">
                  <span className="font-bold text-zinc-200">Phase 4: Lateral Movement & File Server Pivot (Bonus Stage)</span>
                  <p className="text-zinc-400 text-[11px]">
                    Adversary pivots across internal subnets via SMB (Port 445) to central file server <code className="text-cyan-300">FS-CORP-01 (10.0.1.5)</code>, authenticates via Type 3 Network Logon (4624), installs a remote service, and stages <code className="text-cyan-300">archive_exfil.zip</code>.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Evaluation Checklist */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-2">
            <h3 className="text-zinc-200 font-bold text-xs uppercase tracking-wider flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>4. How Interviewers & Faculty Can Test The Platform in 2 Minutes</span>
            </h3>

            <div className="space-y-1.5 text-xs text-zinc-400">
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Step 1:</span>
                <span>Click <strong>"Test Detection Query"</strong> below or select <strong>EDR Alerts</strong> filter.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Step 2:</span>
                <span>Click any row in the table to inspect parsed event properties, or click cell values to filter.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Step 3:</span>
                <span>Switch to <strong>Process Tree</strong> tab to inspect the visual parent-child execution chain.</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Step 4:</span>
                <span>In the Shift Lead panel on the right, type: <em>"Marcus Jenkins opened Q1_Expense_Reconciliation.xlsm in EXCEL.EXE which spawned cmd and powershell with bypass"</em> and see Alex Mercer validate your phase gate!</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-emerald-400 font-bold">Step 5:</span>
                <span>Click <strong>"Export Dossier"</strong> in the top header to download a complete markdown IR report.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span>Engineered with React, TypeScript, Tailwind CSS, and in-memory columnar indexing.</span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                onRunSampleQuery('DeviceProcessEvents | where ProcessName in ("EXCEL.EXE", "powershell.exe", "cmd.exe")');
                onClose();
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded font-semibold text-xs shadow-xs"
            >
              <Play className="w-3 h-3 fill-white" />
              <span>Launch Demo Investigation</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
