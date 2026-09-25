import React from 'react';
import { ShieldAlert, ExternalLink, CheckCircle2, Search } from 'lucide-react';

interface MitreMatrixModalProps {
  onFilterTechnique: (techniqueId: string) => void;
}

interface MatrixColumn {
  tactic: string;
  techniques: {
    id: string;
    name: string;
    detectedInScenario: boolean;
    description: string;
    phase: number;
  }[];
}

export const MitreMatrixModal: React.FC<MitreMatrixModalProps> = ({
  onFilterTechnique,
}) => {
  const columns: MatrixColumn[] = [
    {
      tactic: 'Initial Access',
      techniques: [
        {
          id: 'T1566.001',
          name: 'Spearphishing Attachment',
          detectedInScenario: true,
          description: 'Macro-enabled Excel sheet Q1_Expense_Reconciliation.xlsm opened from email.',
          phase: 1,
        },
      ],
    },
    {
      tactic: 'Execution',
      techniques: [
        {
          id: 'T1204.002',
          name: 'Malicious File Execution',
          detectedInScenario: true,
          description: 'User opened macro spreadsheet triggering Excel spawn.',
          phase: 1,
        },
        {
          id: 'T1059.001',
          name: 'PowerShell Interpreter',
          detectedInScenario: true,
          description: 'cmd.exe spawned powershell.exe with -ExecutionPolicy Bypass and encodedCommand.',
          phase: 1,
        },
      ],
    },
    {
      tactic: 'Defense Evasion',
      techniques: [
        {
          id: 'T1027',
          name: 'Obfuscated Files or Info',
          detectedInScenario: true,
          description: 'Base64 encoded CLI and disguised updater.exe binary.',
          phase: 2,
        },
        {
          id: 'T1036.005',
          name: 'Match Legitimate Name/Path',
          detectedInScenario: true,
          description: 'Staging in AppData\\Local\\Temp disguised as telemetry updater.',
          phase: 2,
        },
        {
          id: 'T1218.011',
          name: 'Rundll32 Execution',
          detectedInScenario: true,
          description: 'rundll32.exe used to invoke net_worker.dll,DllRegisterServer.',
          phase: 2,
        },
      ],
    },
    {
      tactic: 'Persistence',
      techniques: [
        {
          id: 'T1547.001',
          name: 'Registry Run Keys',
          detectedInScenario: true,
          description: 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdateTelemetry.',
          phase: 3,
        },
        {
          id: 'T1543.003',
          name: 'Windows Service Creation',
          detectedInScenario: true,
          description: 'Service SvcHostNetworkManager created on file server FS-CORP-01.',
          phase: 4,
        },
      ],
    },
    {
      tactic: 'Discovery',
      techniques: [
        {
          id: 'T1033',
          name: 'System Owner Discovery',
          detectedInScenario: true,
          description: 'whoami.exe /priv executed to enumerate user privilege tokens.',
          phase: 4,
        },
        {
          id: 'T1018',
          name: 'Remote System Discovery',
          detectedInScenario: true,
          description: 'nltest.exe /dclist:CORP used to discover domain controller.',
          phase: 4,
        },
      ],
    },
    {
      tactic: 'Lateral Movement',
      techniques: [
        {
          id: 'T1021.002',
          name: 'SMB/Admin Shares',
          detectedInScenario: true,
          description: 'Internal port 445 traffic from WKSTN-CORP-014 to FS-CORP-01.',
          phase: 4,
        },
        {
          id: 'T1078.002',
          name: 'Domain Accounts',
          detectedInScenario: true,
          description: 'Type 3 Network Logon 4624 leveraging Marcus Jenkins domain account.',
          phase: 4,
        },
      ],
    },
    {
      tactic: 'Command & Control',
      techniques: [
        {
          id: 'T1071.001',
          name: 'Web Protocols: HTTPS',
          detectedInScenario: true,
          description: 'Periodic beaconing to 185.220.101.5:443 (update-telemetry-service.com).',
          phase: 3,
        },
        {
          id: 'T1105',
          name: 'Ingress Tool Transfer',
          detectedInScenario: true,
          description: 'PowerShell web download of stage-2 update.bin.',
          phase: 2,
        },
      ],
    },
    {
      tactic: 'Collection',
      techniques: [
        {
          id: 'T1560.001',
          name: 'Archive via Utility',
          detectedInScenario: true,
          description: 'Staging archive_exfil.zip in confidential finance file share.',
          phase: 4,
        },
      ],
    },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 font-mono text-xs text-zinc-200">
      {/* Header */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-zinc-100">
            MITRE ATT&CK Enterprise Matrix Mapping
          </span>
          <span className="text-zinc-500 text-xs">
            (Operation Cobalt Drift Kill Chain Coverage)
          </span>
        </div>

        <div className="flex items-center space-x-4 text-xs text-zinc-400">
          <span className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <span className="text-zinc-200">Active Adversary Technique</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span>Click any card to filter SIEM logs</span>
        </div>
      </div>

      {/* Grid Columns */}
      <div className="flex-1 overflow-x-auto p-4">
        <div className="flex space-x-3 min-w-max">
          {columns.map((col, idx) => (
            <div
              key={idx}
              className="w-56 bg-zinc-900/60 border border-zinc-800 rounded-lg flex flex-col"
            >
              {/* Column Header */}
              <div className="p-2.5 bg-zinc-900 border-b border-zinc-800 font-bold text-zinc-200 text-xs flex items-center justify-between">
                <span>{col.tactic}</span>
                <span className="text-[10px] text-zinc-500 bg-zinc-950 px-1.5 py-0.5 rounded">
                  {col.techniques.length}
                </span>
              </div>

              {/* Technique Cards */}
              <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                {col.techniques.map(tech => (
                  <div
                    key={tech.id}
                    onClick={() => onFilterTechnique(tech.id)}
                    className="p-2.5 rounded-md bg-zinc-950 border border-cyan-800/60 hover:border-cyan-400 cursor-pointer transition-all space-y-1.5 group shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-400 font-bold text-[11px] group-hover:underline">
                        {tech.id}
                      </span>
                      <span className="text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.2 rounded font-semibold">
                        Phase {tech.phase}
                      </span>
                    </div>

                    <div className="text-zinc-200 font-semibold text-xs leading-snug">
                      {tech.name}
                    </div>

                    <p className="text-zinc-400 text-[10px] leading-tight line-clamp-3">
                      {tech.description}
                    </p>

                    <div className="pt-1 flex items-center justify-between text-[10px] text-zinc-500">
                      <span className="flex items-center space-x-1 text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Telemetry Detected</span>
                      </span>
                      <Search className="w-3 h-3 text-zinc-500 group-hover:text-cyan-400" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
