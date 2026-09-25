/**
 * Normalized telemetry and SOC investigation schemas
 */

export type LogSource = 'sysmon' | 'security' | 'powershell' | 'edr_alert' | 'firewall';
export type EventCategory = 'process' | 'network' | 'authentication' | 'file';
export type Severity = 'informational' | 'low' | 'medium' | 'high' | 'critical';

export interface NormalizedLogEvent {
  id: string;                          // Unique ID (e.g., "EVT-1042")
  timestamp: string;                   // ISO 8601 string (e.g., "2025-03-15T09:14:22Z")
  event_source: LogSource;
  event_id: number;                    // 1 (Proc Create), 3 (Network), 11 (File Create), 4624 (Logon)
  event_category: EventCategory;
  severity: Severity;
  
  host: {
    hostname: string;                  // e.g., "WKSTN-CORP-014", "FS-CORP-01"
    ip: string;                        // e.g., "10.0.4.14"
  };
  user: {
    username: string;                  // e.g., "mjenkins", "svc_backup", "SYSTEM"
    domain: string;                    // e.g., "CORP"
    is_admin?: boolean;
  };
  process?: {
    pid: number;
    name: string;                      // e.g., "powershell.exe"
    path: string;                      // e.g., "C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe"
    command_line: string;              // Full CLI command
    parent_pid?: number;
    parent_name?: string;              // e.g., "EXCEL.EXE"
    parent_command_line?: string;
    hashes?: { sha256?: string; md5?: string };
  };
  network?: {
    protocol: 'tcp' | 'udp' | 'dns' | 'http';
    src_ip: string;
    src_port: number;
    dest_ip: string;                   // e.g., "185.220.101.5" or "10.0.1.5"
    dest_port: number;                 // e.g., 443, 445
    dest_hostname?: string;            // e.g., "update-telemetry-service.com"
    direction: 'inbound' | 'outbound' | 'internal';
  };
  file?: {
    path: string;                      // e.g., "C:\Users\mjenkins\AppData\Local\Temp\updater.exe"
    name: string;
    action: 'created' | 'modified' | 'deleted';
    hashes?: { sha256: string };
  };
  raw_message: string;
  mitre?: {
    tactic: string;                    // e.g., "Execution", "Defense Evasion", "Command and Control"
    technique_id: string;              // e.g., "T1059.001"
    technique_name: string;            // e.g., "PowerShell"
  };
}

export interface PhaseObjective {
  id: string;
  title: string;
  description: string;
  keyArtifactClue: string;
}

export interface InvestigationPhase {
  id: number;
  code: string;
  title: string;
  subtitle: string;
  briefing: string;
  threatActorContext: string;
  objectives: PhaseObjective[];
  gatePassCriteria: {
    requiredKeywords: string[];
    alternativePhrasings?: string[][];
    explanation: string;
  };
  recommendedQueries: string[];
}

export type IOCType = 'ip' | 'domain' | 'file_hash' | 'file_path' | 'command' | 'user' | 'hostname';

export interface PinnedIOC {
  id: string;
  type: IOCType;
  value: string;
  notes?: string;
  phaseDiscovered: number;
  eventId?: string;
  timestamp: string;
}

export interface DebriefMessage {
  id: string;
  sender: 'student' | 'shift_lead';
  text: string;
  timestamp: string;
  isGateApproval?: boolean;
  score?: number;
  suggestions?: string[];
}

export interface SIEMFilterCriteria {
  rawKql?: string;
  searchQuery?: string;
  eventSource?: LogSource | 'all';
  eventCategory?: EventCategory | 'all';
  severity?: Severity | 'all';
  hostname?: string;
  username?: string;
  timeRange?: string; // 'all' | '1h' | '6h' | '24h'
}

export interface KQLQueryResult {
  events: NormalizedLogEvent[];
  totalMatched: number;
  queryTimeMs: number;
  summaries?: {
    field: string;
    aggregations: { key: string; count: number }[];
  }[];
  error?: string;
}
