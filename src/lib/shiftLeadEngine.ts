import { PinnedIOC } from '../types/telemetry';
import { SCENARIO_PHASES } from '../data/scenarioPhases';

export interface SocraticEvaluationResult {
  gateApproved: boolean;
  score: number;
  reply: string;
  identifiedItems: string[];
  missingItems: string[];
  suggestions: string[];
}

/**
 * Deterministic Socratic Evaluation Engine.
 * Evaluates student debriefs using semantic keyword and entity pattern matching,
 * providing authentic SOC Shift Lead feedback without requiring external APIs.
 */
export function evaluateStudentDebriefDeterministic(
  phaseId: number,
  studentMessage: string,
  pinnedIOCs: PinnedIOC[],
  investigationNotes: string
): SocraticEvaluationResult {
  const phase = SCENARIO_PHASES.find(p => p.id === phaseId) || SCENARIO_PHASES[0];
  const combinedText = `${studentMessage} ${investigationNotes} ${pinnedIOCs.map(i => i.value).join(' ')}`.toLowerCase();

  const identifiedItems: string[] = [];
  const missingItems: string[] = [];
  const suggestions: string[] = [];

  if (phaseId === 1) {
    // Phase 1: Initial Access & Execution
    const checks = [
      {
        name: 'Weaponized Attachment Name',
        keywords: ['q1_expense_reconciliation', 'reconciliation.xlsm', 'reconciliation'],
        clue: 'Search for the .xlsm document name opened by the user.',
      },
      {
        name: 'Parent Office Process (EXCEL.EXE)',
        keywords: ['excel.exe', 'excel', 'pid 4820', '4820'],
        clue: 'Identify the exact parent process and PID that executed the command interpreter.',
      },
      {
        name: 'Spawned Shell (cmd / powershell)',
        keywords: ['powershell', 'cmd.exe', 'cmd', 'powershell.exe'],
        clue: 'Confirm which command shell was spawned directly from the macro.',
      },
      {
        name: 'Obfuscated Command-Line Argument / Bypass Flag',
        keywords: ['bypass', 'encodedcommand', '-enc', 'base64', 'windowstyle hidden'],
        clue: 'Inspect the full command-line arguments for security bypass flags.',
      },
    ];

    checks.forEach(check => {
      const match = check.keywords.some(k => combinedText.includes(k));
      if (match) identifiedItems.push(check.name);
      else {
        missingItems.push(check.name);
        suggestions.push(check.clue);
      }
    });
  } else if (phaseId === 2) {
    // Phase 2: Defense Evasion & Dropper Staging
    const checks = [
      {
        name: 'Dropped Executable Name (updater.exe)',
        keywords: ['updater.exe', 'updater'],
        clue: 'Locate the executable dropped on disk in Sysmon Event ID 11.',
      },
      {
        name: 'Writable User Directory (Temp / AppData)',
        keywords: ['temp', 'appdata\\local\\temp', 'appdata'],
        clue: 'Specify the folder path where the dropped binary was staged.',
      },
      {
        name: 'Cryptographic Hash (SHA256)',
        keywords: ['a93b2f56', 'sha256', 'hash', 'a93b'],
        clue: 'Extract and record the SHA256 file hash of the dropped binary.',
      },
      {
        name: 'Helper DLL & LOLBIN (rundll32 / net_worker.dll)',
        keywords: ['rundll32', 'net_worker.dll', 'net_worker'],
        clue: 'Check what secondary DLL was executed using rundll32.exe.',
      },
    ];

    checks.forEach(check => {
      const match = check.keywords.some(k => combinedText.includes(k));
      if (match) identifiedItems.push(check.name);
      else {
        missingItems.push(check.name);
        suggestions.push(check.clue);
      }
    });
  } else if (phaseId === 3) {
    // Phase 3: Command & Control (C2) Beaconing
    const checks = [
      {
        name: 'Malicious External IPv4 (185.220.101.5)',
        keywords: ['185.220.101.5'],
        clue: 'Find the external IP address that updater.exe contacted.',
      },
      {
        name: 'Destination Port (443 / HTTPS)',
        keywords: ['443', 'https'],
        clue: 'Specify the network port used for beacon communications.',
      },
      {
        name: 'Malicious C2 Domain (update-telemetry-service.com)',
        keywords: ['update-telemetry-service.com', 'update-telemetry-service'],
        clue: 'Inspect DNS telemetry (Sysmon ID 22) for the queried FQDN.',
      },
      {
        name: 'Registry Run Persistence Key',
        keywords: ['run', 'windowsupdatetelemetry', 'currentversion\\run', 'registry'],
        clue: 'Identify the startup registry run key created for persistence.',
      },
    ];

    checks.forEach(check => {
      const match = check.keywords.some(k => combinedText.includes(k));
      if (match) identifiedItems.push(check.name);
      else {
        missingItems.push(check.name);
        suggestions.push(check.clue);
      }
    });
  } else {
    // Phase 4: Lateral Movement & Server Pivot (Bonus Stage)
    const checks = [
      {
        name: 'Compromised Target Server (FS-CORP-01)',
        keywords: ['fs-corp-01', '10.0.1.5'],
        clue: 'Identify the internal server hostname and IP where the pivot occurred.',
      },
      {
        name: 'Lateral Movement Protocol (SMB / Port 445)',
        keywords: ['445', 'smb', 'port 445'],
        clue: 'Document the network protocol and destination port used for internal pivot.',
      },
      {
        name: 'Network Authentication Event (4624 Type 3)',
        keywords: ['4624', 'type 3', 'logon type: 3', 'network logon'],
        clue: 'Locate the Security logon event ID confirming lateral authentication.',
      },
      {
        name: 'Staged Exfiltration Archive',
        keywords: ['archive_exfil.zip', 'finance_confidential', 'exfil', 'archive'],
        clue: 'Find the zip archive created on the file share for data collection.',
      },
    ];

    checks.forEach(check => {
      const match = check.keywords.some(k => combinedText.includes(k));
      if (match) identifiedItems.push(check.name);
      else {
        missingItems.push(check.name);
        suggestions.push(check.clue);
      }
    });
  }

  const score = Math.round((identifiedItems.length / (identifiedItems.length + missingItems.length)) * 100);
  const gateApproved = score >= 75; // 3 out of 4 criteria met

  let reply = '';
  if (gateApproved) {
    reply = `[GATE APPROVED] Excellent analytical work, Analyst!
You have successfully demonstrated command of ${phase.title}.

Key Findings Confirmed:
${identifiedItems.map(item => `  ✓ ${item}`).join('\n')}

Your reconstruction accurately matches our ground-truth telemetry. You have established a defensible chain of custody and forensic reasoning. I am signing off on this phase gate. Advance to the next phase in the playbook when ready!`;
  } else {
    reply = `[GATE INCOMPLETE] Good progress on your debrief, but your evidence dossier still has crucial gaps before I can sign off on this phase gate.

What you've established so far:
${identifiedItems.length > 0 ? identifiedItems.map(item => `  ✓ ${item}`).join('\n') : '  - Initial overview provided, but key IOCs are missing.'}

What is still missing from your analysis:
${missingItems.map(item => `  ✗ ${item}`).join('\n')}

Shift Lead Guidance:
${suggestions.slice(0, 2).map(s => `• ${s}`).join('\n')}

Check your SIEM queries again, verify the raw telemetry details, and update your debrief.`;
  }

  return {
    gateApproved,
    score,
    reply,
    identifiedItems,
    missingItems,
    suggestions,
  };
}

/**
 * Returns contextual assistance or guidance from the Shift Lead
 */
export function getShiftLeadSocraticHint(phaseId: number): string {
  const hints: Record<number, string[]> = {
    1: [
      'Focus on the relationship between Office processes and system command interpreters. In high-security environments, EXCEL.EXE should never spawn cmd.exe or powershell.exe.',
      'Check the Process CommandLine field in Sysmon Event ID 1. Attackers frequently use -ExecutionPolicy Bypass and -encodedCommand to obscure what their script executes.',
      'Try searching for file extension .xlsm in DeviceProcessEvents or Sysmon logs to find the downloaded spearphishing lure.',
    ],
    2: [
      'When PowerShell downloads a file, it often stages it in a user-writable path such as C:\\Users\\<username>\\AppData\\Local\\Temp. Look at Sysmon Event ID 11 (File Create).',
      'Attackers disguise their malware with benign names like "updater.exe". Always verify the file hash (SHA256) to look up in threat intelligence databases.',
      'Notice the LOLBIN rundll32.exe being executed shortly after updater.exe starts. What DLL is it registering?',
    ],
    3: [
      'Look at Sysmon Event ID 3 (Network Connection) filtered for the updater process. What external IP and port is it calling home to?',
      'Check Sysmon Event ID 22 (DNS queries) for WKSTN-CORP-014. Attackers typically resolve a C2 domain right before establishing TLS/HTTPS beacons.',
      'How does the malware survive a reboot? Check Sysmon Event ID 13 for modifications to the Windows Run keys in the registry.',
    ],
    4: [
      'Inspect internal network traffic originating from 10.0.4.14 (WKSTN-CORP-014) destined for other corporate subnets (10.0.1.0/24). Which server is receiving SMB connections on port 445?',
      'On the target file server, search for Windows Security Event ID 4624. Look specifically for Logon Type 3 (Network Logon) using the victim user credentials.',
      'Check Sysmon Event ID 11 on the file server FS-CORP-01. Did the attacker create any zip or staging archive in confidential shares?',
    ],
  };

  const list = hints[phaseId] || hints[1];
  return list[Math.floor(Math.random() * list.length)];
}
