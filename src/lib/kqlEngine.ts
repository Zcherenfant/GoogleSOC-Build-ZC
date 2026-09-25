import { NormalizedLogEvent, KQLQueryResult } from '../types/telemetry';

/**
 * High-performance, pure TypeScript in-memory KQL Query Engine.
 * Supports Microsoft Sentinel / Defender style KQL syntax:
 * - Table scopes (DeviceProcessEvents, DeviceNetworkEvents, DeviceFileEvents, SecurityAlert, Sysmon, Security)
 * - `| where <expr>` with ==, !=, contains, has, startswith, endswith, in (...), and, or
 * - `| summarize count() by <field>`
 * - `| sort by <field> [asc|desc]`
 * - `| take <N>` / `| limit <N>`
 * - Plain free-text substring search across all fields
 */

// Field resolver mapping convenient KQL names to NormalizedLogEvent fields
export function resolveFieldValue(event: NormalizedLogEvent, fieldName: string): any {
  const norm = fieldName.trim().toLowerCase();

  switch (norm) {
    case 'id':
      return event.id;
    case 'timestamp':
    case 'timegenerated':
      return event.timestamp;
    case 'source':
    case 'eventsource':
    case 'event_source':
      return event.event_source;
    case 'eventid':
    case 'event_id':
      return event.event_id;
    case 'category':
    case 'eventcategory':
    case 'event_category':
      return event.event_category;
    case 'severity':
      return event.severity;

    // Host
    case 'host':
    case 'hostname':
    case 'computer':
    case 'devicename':
    case 'host.hostname':
      return event.host.hostname;
    case 'hostip':
    case 'ip':
    case 'host.ip':
      return event.host.ip;

    // User
    case 'user':
    case 'username':
    case 'account':
    case 'accountname':
    case 'user.username':
      return event.user.username;
    case 'domain':
    case 'user.domain':
      return event.user.domain;

    // Process
    case 'processname':
    case 'process':
    case 'filename':
    case 'initiatingprocessfilename':
    case 'process.name':
      return event.process?.name || '';
    case 'pid':
    case 'processid':
    case 'process.pid':
      return event.process?.pid || 0;
    case 'path':
    case 'processpath':
    case 'folderpath':
    case 'process.path':
      return event.process?.path || '';
    case 'commandline':
    case 'processcommandline':
    case 'process.command_line':
      return event.process?.command_line || '';
    case 'parentprocessname':
    case 'parentname':
    case 'initiatingprocessparentfilename':
    case 'process.parent_name':
      return event.process?.parent_name || '';
    case 'parentpid':
    case 'process.parent_pid':
      return event.process?.parent_pid || 0;
    case 'parentcommandline':
    case 'process.parent_command_line':
      return event.process?.parent_command_line || '';
    case 'sha256':
    case 'hash':
    case 'process.hashes.sha256':
      return event.process?.hashes?.sha256 || event.file?.hashes?.sha256 || '';

    // Network
    case 'destip':
    case 'remoteip':
    case 'destinationip':
    case 'network.dest_ip':
      return event.network?.dest_ip || '';
    case 'destport':
    case 'remoteport':
    case 'destinationport':
    case 'network.dest_port':
      return event.network?.dest_port || 0;
    case 'srcip':
    case 'localip':
    case 'network.src_ip':
      return event.network?.src_ip || '';
    case 'srcport':
    case 'localport':
    case 'network.src_port':
      return event.network?.src_port || 0;
    case 'protocol':
    case 'network.protocol':
      return event.network?.protocol || '';
    case 'desthostname':
    case 'remoteurl':
    case 'domainname':
    case 'queryname':
    case 'network.dest_hostname':
      return event.network?.dest_hostname || '';
    case 'direction':
    case 'network.direction':
      return event.network?.direction || '';

    // File
    case 'filepath':
    case 'targetfilename':
    case 'file.path':
      return event.file?.path || '';
    case 'action':
    case 'file.action':
      return event.file?.action || '';

    // Message & MITRE
    case 'rawmessage':
    case 'raw_message':
    case 'message':
      return event.raw_message;
    case 'technique_id':
    case 'mitre':
    case 'technique':
      return event.mitre?.technique_id || '';
    case 'tactic':
      return event.mitre?.tactic || '';

    default:
      return undefined;
  }
}

/**
 * Evaluates an individual comparison condition like `dest_port == 443` or `ProcessName contains "powershell"`
 */
function evaluateSingleCondition(event: NormalizedLogEvent, conditionStr: string): boolean {
  const trimmed = conditionStr.trim();
  if (!trimmed) return true;

  // Check for 'in (...)' syntax
  const inMatch = trimmed.match(/^([a-zA-Z0-9_.]+)\s+in\s*\(([^)]+)\)$/i);
  if (inMatch) {
    const field = inMatch[1];
    const valueRaw = resolveFieldValue(event, field);
    const candidateList = inMatch[2]
      .split(',')
      .map(item => item.trim().replace(/^["']|["']$/g, '').toLowerCase());
    const eventValStr = String(valueRaw ?? '').toLowerCase();
    return candidateList.includes(eventValStr);
  }

  // Operators ordered by length to prevent partial prefix match
  const operators = ['==', '!=', '=~', 'contains', '!contains', 'has', 'startswith', 'endswith', '>=', '<=', '>', '<'];
  let matchedOp: string | null = null;
  let opIndex = -1;

  for (const op of operators) {
    const idx = trimmed.indexOf(` ${op} `);
    if (idx !== -1) {
      matchedOp = op;
      opIndex = idx;
      break;
    }
  }

  if (!matchedOp || opIndex === -1) {
    // If no explicit operator, treat as full text search for that keyword
    const searchVal = trimmed.replace(/^["']|["']$/g, '').toLowerCase();
    return eventMatchesFreeText(event, searchVal);
  }

  const fieldPart = trimmed.slice(0, opIndex).trim();
  const valPart = trimmed.slice(opIndex + matchedOp.length + 2).trim().replace(/^["']|["']$/g, '');
  const actualVal = resolveFieldValue(event, fieldPart);

  if (actualVal === undefined) {
    return false;
  }

  const actualStr = String(actualVal).toLowerCase();
  const searchStr = valPart.toLowerCase();

  switch (matchedOp) {
    case '==':
    case '=~':
      return actualStr === searchStr;
    case '!=':
      return actualStr !== searchStr;
    case 'contains':
    case 'has':
      return actualStr.includes(searchStr);
    case '!contains':
      return !actualStr.includes(searchStr);
    case 'startswith':
      return actualStr.startsWith(searchStr);
    case 'endswith':
      return actualStr.endsWith(searchStr);
    case '>':
      return Number(actualVal) > Number(valPart);
    case '<':
      return Number(actualVal) < Number(valPart);
    case '>=':
      return Number(actualVal) >= Number(valPart);
    case '<=':
      return Number(actualVal) <= Number(valPart);
    default:
      return false;
  }
}

/**
 * Checks if event matches free text search across common fields
 */
function eventMatchesFreeText(event: NormalizedLogEvent, keyword: string): boolean {
  const kw = keyword.toLowerCase();
  if (event.id.toLowerCase().includes(kw)) return true;
  if (event.host.hostname.toLowerCase().includes(kw)) return true;
  if (event.host.ip.toLowerCase().includes(kw)) return true;
  if (event.user.username.toLowerCase().includes(kw)) return true;
  if (event.process?.name.toLowerCase().includes(kw)) return true;
  if (event.process?.command_line.toLowerCase().includes(kw)) return true;
  if (event.network?.dest_ip.toLowerCase().includes(kw)) return true;
  if (event.network?.dest_hostname?.toLowerCase().includes(kw)) return true;
  if (event.file?.path.toLowerCase().includes(kw)) return true;
  if (event.file?.name.toLowerCase().includes(kw)) return true;
  if (event.raw_message.toLowerCase().includes(kw)) return true;
  if (event.mitre?.technique_id.toLowerCase().includes(kw)) return true;
  if (event.mitre?.technique_name.toLowerCase().includes(kw)) return true;
  if (String(event.event_id).includes(kw)) return true;
  return false;
}

/**
 * Evaluates a compound where expression with 'and' / 'or'
 */
function evaluateWhereExpression(event: NormalizedLogEvent, expression: string): boolean {
  // Check for ' or ' first (lower precedence)
  const orParts = expression.split(/\s+or\s+/i);
  if (orParts.length > 1) {
    return orParts.some(part => evaluateWhereExpression(event, part));
  }

  // Then split by ' and '
  const andParts = expression.split(/\s+and\s+/i);
  return andParts.every(part => evaluateSingleCondition(event, part));
}

/**
 * Main KQL Engine execution function
 */
export function executeKQLQuery(
  allEvents: NormalizedLogEvent[],
  queryStr: string
): KQLQueryResult {
  const startTime = performance.now();
  const trimmedQuery = queryStr.trim();

  if (!trimmedQuery) {
    return {
      events: allEvents,
      totalMatched: allEvents.length,
      queryTimeMs: Math.round((performance.now() - startTime) * 10) / 10,
    };
  }

  // Parse pipes
  const pipes = trimmedQuery.split('|').map(p => p.trim());
  let currentResults = [...allEvents];
  let summaries: KQLQueryResult['summaries'] = undefined;

  // First segment is the table / initial scope
  const firstSegment = pipes[0];
  if (firstSegment) {
    const tableScope = firstSegment.toLowerCase();

    if (tableScope === 'deviceprocessevents') {
      currentResults = currentResults.filter(e => e.event_category === 'process');
    } else if (tableScope === 'devicenetworkevents') {
      currentResults = currentResults.filter(e => e.event_category === 'network');
    } else if (tableScope === 'devicefileevents') {
      currentResults = currentResults.filter(e => e.event_category === 'file');
    } else if (tableScope === 'securityalert') {
      currentResults = currentResults.filter(e => e.event_source === 'edr_alert');
    } else if (tableScope === 'sysmon') {
      currentResults = currentResults.filter(e => e.event_source === 'sysmon');
    } else if (tableScope === 'security') {
      currentResults = currentResults.filter(e => e.event_source === 'security');
    } else if (tableScope === 'firewall') {
      currentResults = currentResults.filter(e => e.event_source === 'firewall');
    } else if (tableScope !== '*' && tableScope !== 'all' && !firstSegment.startsWith('where')) {
      // Free text search in table position
      currentResults = currentResults.filter(e => eventMatchesFreeText(e, firstSegment));
    }
  }

  // Process subsequent pipe operators
  for (let i = 1; i < pipes.length; i++) {
    const pipe = pipes[i];

    if (pipe.startsWith('where ')) {
      const expr = pipe.replace(/^where\s+/i, '');
      currentResults = currentResults.filter(event => evaluateWhereExpression(event, expr));
    } else if (pipe.startsWith('sort by ') || pipe.startsWith('order by ')) {
      const sortParts = pipe.replace(/^(sort|order)\s+by\s+/i, '').split(/\s+/);
      const sortField = sortParts[0];
      const isDesc = sortParts[1]?.toLowerCase() === 'desc';

      currentResults.sort((a, b) => {
        const valA = resolveFieldValue(a, sortField);
        const valB = resolveFieldValue(b, sortField);
        if (valA === valB) return 0;
        if (valA === undefined) return 1;
        if (valB === undefined) return -1;
        const res = valA > valB ? 1 : -1;
        return isDesc ? -res : res;
      });
    } else if (pipe.startsWith('take ') || pipe.startsWith('limit ')) {
      const limitCount = parseInt(pipe.replace(/^(take|limit)\s+/i, ''), 10);
      if (!isNaN(limitCount) && limitCount > 0) {
        currentResults = currentResults.slice(0, limitCount);
      }
    } else if (pipe.startsWith('summarize ')) {
      // Support: summarize count() by <field>
      const sumMatch = pipe.match(/^summarize\s+count\(\)\s+by\s+([a-zA-Z0-9_.]+)/i);
      if (sumMatch) {
        const groupField = sumMatch[1];
        const counts: Record<string, number> = {};
        for (const evt of currentResults) {
          const val = String(resolveFieldValue(evt, groupField) ?? 'unknown');
          counts[val] = (counts[val] || 0) + 1;
        }

        const aggregations = Object.entries(counts)
          .map(([key, count]) => ({ key, count }))
          .sort((a, b) => b.count - a.count);

        summaries = [{ field: groupField, aggregations }];
      }
    }
  }

  const queryTimeMs = Math.round((performance.now() - startTime) * 10) / 10;

  return {
    events: currentResults,
    totalMatched: currentResults.length,
    queryTimeMs,
    summaries,
  };
}

/**
 * Pre-authored library of useful KQL queries for students
 */
export const KQL_CHEAT_SHEET = [
  {
    category: 'Phase 1: Initial Access & Execution',
    title: 'Find Office Application Spawning Command Shell',
    query: 'DeviceProcessEvents | where InitiatingProcessFileName in ("EXCEL.EXE", "WINWORD.EXE") | where ProcessName in ("cmd.exe", "powershell.exe")',
    description: 'Pinpoints suspicious child processes spawned directly by Microsoft Excel or Word.',
  },
  {
    category: 'Phase 1: Initial Access & Execution',
    title: 'Detect Obfuscated / Encoded PowerShell Arguments',
    query: 'Sysmon | where EventID == 1 and CommandLine contains "encodedCommand" or CommandLine contains "-enc"',
    description: 'Searches for PowerShell executed with base64 encoded payload flags.',
  },
  {
    category: 'Phase 2: Defense Evasion & Droppers',
    title: 'Files Dropped in AppData\\Temp by Scripting Engines',
    query: 'Sysmon | where EventID == 11 and FilePath contains "Temp" and ProcessName in ("powershell.exe", "cmd.exe")',
    description: 'Identifies executables and DLLs dropped into temporary folders by command scripts.',
  },
  {
    category: 'Phase 2: Defense Evasion & Droppers',
    title: 'Rundll32 Invocation of Staged DLLs',
    query: 'DeviceProcessEvents | where ProcessName == "rundll32.exe" and CommandLine contains "Temp"',
    description: 'Uncovers LOLBIN usage executing staged malicious DLLs from user temp.',
  },
  {
    category: 'Phase 3: Command & Control (C2)',
    title: 'Outbound Connections from Dropped Executables',
    query: 'DeviceNetworkEvents | where ProcessName == "updater.exe" and Direction == "outbound"',
    description: 'Tracks network connections made by updater.exe to uncover external C2 IPs.',
  },
  {
    category: 'Phase 3: Command & Control (C2)',
    title: 'DNS Resolution of Untrusted Domains',
    query: 'Sysmon | where EventID == 22 and QueryName contains "telemetry"',
    description: 'Finds domain queries generated by malware prior to establishing beacon connections.',
  },
  {
    category: 'Phase 3: Command & Control (C2)',
    title: 'Registry Run Key Persistence',
    query: 'Sysmon | where EventID == 13 and RawMessage contains "CurrentVersion\\\\Run"',
    description: 'Spots startup persistence keys written to the Windows Registry.',
  },
  {
    category: 'Phase 4: Lateral Movement',
    title: 'Internal SMB Traffic to File Servers (Port 445)',
    query: 'DeviceNetworkEvents | where DestPort == 445 and Direction == "internal"',
    description: 'Monitors SMB traffic across internal subnets indicating lateral movement.',
  },
  {
    category: 'Phase 4: Lateral Movement',
    title: 'Type 3 (Network) Successful Logons on File Server',
    query: 'Security | where EventID == 4624 and Host == "FS-CORP-01" and RawMessage contains "Logon Type: 3"',
    description: 'Validates credential reuse and remote network logon to server FS-CORP-01.',
  },
  {
    category: 'General Threat Hunting',
    title: 'All High & Critical Severity Detections',
    query: 'SecurityAlert | where Severity in ("high", "critical")',
    description: 'Quick triage view of all high-impact detections across the enterprise.',
  },
];
