import { NormalizedLogEvent } from '../types/telemetry';

export interface ProcessNode {
  pid: number;
  name: string;
  path: string;
  commandLine: string;
  parentPid?: number;
  parentName?: string;
  timestamp: string;
  hostname: string;
  username: string;
  severity: string;
  hashes?: { sha256?: string; md5?: string };
  eventId: string;
  isMaliciousCandidate: boolean;
  children: ProcessNode[];
}

export function buildProcessTrees(events: NormalizedLogEvent[]): ProcessNode[] {
  // Extract all process creation events (Sysmon 1 or Security 4688)
  const procEvents = events.filter(
    e => e.event_category === 'process' && e.process && (e.event_id === 1 || e.event_id === 4688)
  );

  const nodeMap = new Map<number, ProcessNode>();
  const rootNodes: ProcessNode[] = [];

  // Build individual nodes
  for (const evt of procEvents) {
    if (!evt.process) continue;

    const isMalicious =
      evt.severity === 'high' ||
      evt.severity === 'critical' ||
      evt.process.name.toLowerCase() === 'updater.exe' ||
      evt.process.command_line.toLowerCase().includes('bypass') ||
      evt.process.command_line.toLowerCase().includes('encodedcommand');

    const node: ProcessNode = {
      pid: evt.process.pid,
      name: evt.process.name,
      path: evt.process.path,
      commandLine: evt.process.command_line,
      parentPid: evt.process.parent_pid,
      parentName: evt.process.parent_name,
      timestamp: evt.timestamp,
      hostname: evt.host.hostname,
      username: evt.user.username,
      severity: evt.severity,
      hashes: evt.process.hashes,
      eventId: evt.id,
      isMaliciousCandidate: isMalicious,
      children: [],
    };

    nodeMap.set(evt.process.pid, node);
  }

  // Link children to parents
  for (const node of nodeMap.values()) {
    if (node.parentPid && nodeMap.has(node.parentPid)) {
      const parent = nodeMap.get(node.parentPid)!;
      parent.children.push(node);
    } else {
      rootNodes.push(node);
    }
  }

  // Sort roots by timestamp
  return rootNodes.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}
