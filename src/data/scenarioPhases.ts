import { InvestigationPhase } from '../types/telemetry';

export const SCENARIO_PHASES: InvestigationPhase[] = [
  {
    id: 1,
    code: 'PHASE-01',
    title: 'Initial Access & Execution',
    subtitle: 'Spearphishing Email Payload Triage',
    briefing: `At 09:16:11 UTC, an elevated EDR alert triggered on workstation WKSTN-CORP-014 (User: CORP\\mjenkins).
The detection alert reports: "Office Application spawned command shell with obfuscated CLI arguments".
Your objective is to reconstruct the initial access vector, verify the weaponized document, identify the parent process PID, and decode the initial command line.`,
    threatActorContext: 'FIN7 / Cobalt Drift initial access tradecraft frequently leverages macro-enabled Excel spreadsheets disguised as urgent financial statements or reconciliation requests.',
    objectives: [
      {
        id: 'obj-1-1',
        title: 'Identify Weaponized Document',
        description: 'Find the exact file name and path of the spreadsheet opened by Marcus Jenkins.',
        keyArtifactClue: 'Look for EXCEL.EXE in Sysmon Event ID 1 or search for .xlsm files.',
      },
      {
        id: 'obj-1-2',
        title: 'Analyze Parent-Child Execution',
        description: 'Identify the parent process name, parent PID, and child shell spawned from Office.',
        keyArtifactClue: 'Check EXCEL.EXE (PID 4820) child process creation.',
      },
      {
        id: 'obj-1-3',
        title: 'Extract Obfuscated Execution CLI',
        description: 'Extract the full command line including bypass flags and base64 encoded payload.',
        keyArtifactClue: 'Search for -ExecutionPolicy Bypass or -encodedCommand in Process CommandLine.',
      },
      {
        id: 'obj-1-4',
        title: 'Map MITRE ATT&CK Techniques',
        description: 'Map the activity to MITRE techniques (T1204.002, T1059.001).',
        keyArtifactClue: 'User Execution: Malicious File and Command and Scripting Interpreter.',
      },
    ],
    gatePassCriteria: {
      requiredKeywords: ['excel', 'powershell', 'q1_expense_reconciliation.xlsm', 'bypass'],
      alternativePhrasings: [
        ['excel.exe', 'excel'],
        ['powershell.exe', 'powershell', 'cmd.exe'],
        ['q1_expense_reconciliation', 'reconciliation.xlsm'],
        ['encodedcommand', 'bypass', '4820', '4912'],
      ],
      explanation: 'Must mention the weaponized spreadsheet Q1_Expense_Reconciliation.xlsm, EXCEL.EXE spawning cmd/powershell, and the encoded command execution.',
    },
    recommendedQueries: [
      'DeviceProcessEvents | where ProcessName in ("EXCEL.EXE", "powershell.exe", "cmd.exe")',
      'Sysmon | where EventID == 1 and Host == "WKSTN-CORP-014"',
      'DeviceProcessEvents | where CommandLine contains "encodedCommand"',
      'SecurityAlert | where Severity in ("High", "Critical")',
    ],
  },
  {
    id: 2,
    code: 'PHASE-02',
    title: 'Defense Evasion & Dropper Staging',
    subtitle: 'Analyzing Dropped Binaries in User Temp',
    briefing: `Following the encoded PowerShell execution, telemetry indicates subsequent file drops and secondary payloads on WKSTN-CORP-014.
Adversaries commonly stage binaries in writable user directories like AppData\\Local\\Temp to bypass application folder restrictions.
Your objective is to identify the dropped executable, retrieve its cryptographic hash (SHA256), and determine what secondary processes or LOLBINs were spawned.`,
    threatActorContext: 'Adversaries use LOLBINs (Living Off The Land Binaries) like rundll32.exe and disguise dropped binaries with deceptive names like updater.exe or telemetry services.',
    objectives: [
      {
        id: 'obj-2-1',
        title: 'Locate Dropped Stage-2 Binary',
        description: 'Identify the exact file path and name of the binary dropped into AppData\\Local\\Temp.',
        keyArtifactClue: 'Check Sysmon Event ID 11 (File Create) on WKSTN-CORP-014.',
      },
      {
        id: 'obj-2-2',
        title: 'Extract Cryptographic SHA256 Hash',
        description: 'Extract the SHA256 hash of updater.exe for threat intel attribution.',
        keyArtifactClue: 'Check file creation or process launch hash properties.',
      },
      {
        id: 'obj-2-3',
        title: 'Identify Dropped Helper DLL & LOLBIN',
        description: 'Find the DLL dropped alongside the updater and the system binary used to execute it.',
        keyArtifactClue: 'Look for rundll32.exe invoking net_worker.dll,DllRegisterServer.',
      },
    ],
    gatePassCriteria: {
      requiredKeywords: ['updater.exe', 'temp', 'rundll32', 'net_worker.dll'],
      alternativePhrasings: [
        ['updater.exe', 'updater'],
        ['temp', 'appdata\\local\\temp'],
        ['rundll32.exe', 'rundll32'],
        ['net_worker.dll', 'net_worker', 'a93b2f56784d14b248a31e87498c5d2b7819f860183149e29a9972b22eef8531'],
      ],
      explanation: 'Must identify updater.exe dropped in Temp, the SHA256 hash or net_worker.dll, and the execution via rundll32.exe.',
    },
    recommendedQueries: [
      'Sysmon | where EventID == 11 and FilePath contains "Temp"',
      'DeviceProcessEvents | where ProcessName == "updater.exe"',
      'Sysmon | where EventID == 1 and CommandLine contains "rundll32"',
      'DeviceFileEvents | where Action == "created" and Host == "WKSTN-CORP-014"',
    ],
  },
  {
    id: 3,
    code: 'PHASE-03',
    title: 'Command & Control (C2) Beaconing',
    subtitle: 'Network Telemetry & Persistence Identification',
    briefing: `With stage-2 binaries executing, our network egress monitors have logged repetitive outbound HTTPS connections originating from the unverified updater.exe process.
Investigate Sysmon Event ID 3 (Network Connection), Sysmon Event ID 22 (DNS Query), and Event ID 13 (Registry Persistence) to document the C2 server IP, external domain, beacon interval, and startup persistence mechanism.`,
    threatActorContext: 'Cobalt Strike beacons utilize HTTP/HTTPS listeners with configurable jitter and sleep intervals to blend with normal encrypted web traffic.',
    objectives: [
      {
        id: 'obj-3-1',
        title: 'Identify Malicious C2 IPv4 & Port',
        description: 'Pinpoint the external public IP address and destination port of the C2 server.',
        keyArtifactClue: 'Filter Sysmon ID 3 where process is updater.exe and direction is outbound.',
      },
      {
        id: 'obj-3-2',
        title: 'Uncover C2 Domain Name',
        description: 'Find the domain name queried via DNS before the encrypted connections began.',
        keyArtifactClue: 'Inspect Sysmon Event ID 22 (DNS query) from WKSTN-CORP-014.',
      },
      {
        id: 'obj-3-3',
        title: 'Document Host Persistence Mechanism',
        description: 'Locate the Registry Run key created by updater.exe to survive system reboots.',
        keyArtifactClue: 'Search for Sysmon Event ID 13 or registry keys under CurrentVersion\\Run.',
      },
    ],
    gatePassCriteria: {
      requiredKeywords: ['185.220.101.5', '443', 'update-telemetry-service.com', 'run'],
      alternativePhrasings: [
        ['185.220.101.5'],
        ['update-telemetry-service.com', 'update-telemetry-service'],
        ['443', 'https'],
        ['run', 'windowsupdatetelemetry', 'registry'],
      ],
      explanation: 'Must identify the C2 IP 185.220.101.5, port 443, domain update-telemetry-service.com, and the Registry Run persistence key.',
    },
    recommendedQueries: [
      'DeviceNetworkEvents | where ProcessName == "updater.exe"',
      'Sysmon | where EventID == 3 and DestPort == 443',
      'Sysmon | where EventID == 22 and QueryName contains "telemetry"',
      'Sysmon | where EventID == 13 and TargetObject contains "Run"',
    ],
  },
  {
    id: 4,
    code: 'PHASE-04',
    title: 'Lateral Movement & Server Pivot',
    subtitle: 'Bonus Stage: Enterprise File Server Compromise',
    briefing: `Adversary telemetry has breached host boundaries!
Preliminary logs suggest the attacker conducted internal reconnaissance from WKSTN-CORP-014 and performed an unauthorized lateral pivot to our central file server FS-CORP-01 (10.0.1.5).
Investigate Windows Authentication logs (Event ID 4624 Type 3), SMB telemetry (Port 445), and file system activity on FS-CORP-01 to confirm credential compromise and exfiltration staging.`,
    threatActorContext: 'Adversaries use Pass-the-Hash or harvested domain user tokens to establish SMB sessions (T1021.002) against internal file servers, staging corporate financial data into compressed zip archives before exfiltration.',
    objectives: [
      {
        id: 'obj-4-1',
        title: 'Identify Target Server & IP',
        description: 'Determine which server was targeted for lateral movement and its IP address.',
        keyArtifactClue: 'Look for internal SMB connections (dest_port == 445) from 10.0.4.14.',
      },
      {
        id: 'obj-4-2',
        title: 'Verify Authentication Mechanism',
        description: 'Confirm the Security Logon Event (Event ID 4624, Logon Type 3) on FS-CORP-01.',
        keyArtifactClue: 'Filter Security logs on FS-CORP-01 for user mjenkins.',
      },
      {
        id: 'obj-4-3',
        title: 'Detect Persistence / Remote Service',
        description: 'Identify the remote service installed on FS-CORP-01 (Event ID 4697).',
        keyArtifactClue: 'Check Event 4697 Service Name: SvcHostNetworkManager.',
      },
      {
        id: 'obj-4-4',
        title: 'Locate Staged Exfiltration Archive',
        description: 'Find the compressed archive created on the file share for data exfiltration.',
        keyArtifactClue: 'Inspect Sysmon Event ID 11 on FS-CORP-01 under C:\\Shares\\Finance_Confidential.',
      },
    ],
    gatePassCriteria: {
      requiredKeywords: ['fs-corp-01', '445', '4624', 'archive_exfil.zip'],
      alternativePhrasings: [
        ['fs-corp-01', '10.0.1.5'],
        ['445', 'smb'],
        ['4624', 'type 3', 'logon'],
        ['archive_exfil.zip', 'finance_confidential', 'svchostnetworkmanager'],
      ],
      explanation: 'Must document lateral pivot to FS-CORP-01 via SMB port 445, network logon 4624, and the staging of archive_exfil.zip in Finance_Confidential share.',
    },
    recommendedQueries: [
      'DeviceNetworkEvents | where DestPort == 445 and Host == "WKSTN-CORP-014"',
      'Security | where EventID == 4624 and Host == "FS-CORP-01"',
      'Sysmon | where Host == "FS-CORP-01" and EventID == 11',
      'SecurityAlert | where Host == "FS-CORP-01"',
    ],
  },
];
