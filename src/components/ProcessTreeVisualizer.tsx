import React, { useState } from 'react';
import { ProcessNode } from '../lib/processTree';
import { NormalizedLogEvent, IOCType } from '../types/telemetry';
import { 
  GitFork, 
  Terminal, 
  ShieldAlert, 
  Pin, 
  Eye, 
  ChevronDown, 
  ChevronRight,
  Filter,
  CheckCircle2
} from 'lucide-react';

interface ProcessTreeVisualizerProps {
  processTrees: ProcessNode[];
  onSelectEventById: (eventId: string) => void;
  onPinIOC: (type: IOCType, value: string, notes?: string) => void;
}

export const ProcessTreeVisualizer: React.FC<ProcessTreeVisualizerProps> = ({
  processTrees,
  onSelectEventById,
  onPinIOC,
}) => {
  const [selectedHost, setSelectedHost] = useState<string>('WKSTN-CORP-014');
  const [onlyMalicious, setOnlyMalicious] = useState<boolean>(true);
  const [collapsedPids, setCollapsedPids] = useState<Set<number>>(new Set());

  const toggleCollapse = (pid: number) => {
    const next = new Set(collapsedPids);
    if (next.has(pid)) next.delete(pid);
    else next.add(pid);
    setCollapsedPids(next);
  };

  // Filter trees
  const filteredTrees = processTrees.filter(tree => {
    if (selectedHost !== 'all' && tree.hostname !== selectedHost) return false;
    if (onlyMalicious) {
      // Must contain a malicious candidate in root or subtree
      const hasMalicious = (node: ProcessNode): boolean => {
        if (node.isMaliciousCandidate) return true;
        return node.children.some(hasMalicious);
      };
      return hasMalicious(tree);
    }
    return true;
  });

  const renderNode = (node: ProcessNode, depth: number = 0) => {
    const isCollapsed = collapsedPids.has(node.pid);
    const hasChildren = node.children.length > 0;
    const isMalicious = node.isMaliciousCandidate;

    return (
      <div key={node.pid} className="space-y-1">
        <div
          className={`flex items-start space-x-2 p-2 rounded-md border font-mono text-xs transition-all ${
            isMalicious
              ? 'bg-red-950/20 border-red-800/80 hover:bg-red-950/30'
              : 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900'
          }`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          {/* Collapse icon / indent */}
          <div className="pt-0.5">
            {hasChildren ? (
              <button
                onClick={() => toggleCollapse(node.pid)}
                className="text-zinc-400 hover:text-cyan-400 p-0.5 rounded"
              >
                {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-4 h-4 flex items-center justify-center text-zinc-600">
                •
              </div>
            )}
          </div>

          {/* Node Icon */}
          <div className="pt-0.5">
            {isMalicious ? (
              <ShieldAlert className="w-4 h-4 text-red-400" />
            ) : (
              <Terminal className="w-4 h-4 text-cyan-400" />
            )}
          </div>

          {/* Node Details */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-bold text-zinc-100 text-xs">
                {node.name}
              </span>
              <span className="text-zinc-500 text-[10px]">
                PID: <span className="text-cyan-400 font-semibold">{node.pid}</span>
              </span>
              {node.parentPid && (
                <span className="text-zinc-500 text-[10px]">
                  PPID: <span className="text-zinc-400">{node.parentPid}</span> ({node.parentName})
                </span>
              )}
              <span className="text-zinc-500 text-[10px]">
                User: <span className="text-zinc-300">{node.username}</span>
              </span>
              <span className="text-zinc-500 text-[10px]">
                Time: <span className="text-zinc-400">{node.timestamp.replace('2025-03-15T', '').replace('Z', '')}</span>
              </span>

              {isMalicious && (
                <span className="px-1.5 py-0.2 bg-red-900/60 border border-red-700 text-red-300 rounded text-[9px] font-bold">
                  SUSPICIOUS / ATTACK CHAIN
                </span>
              )}
            </div>

            {/* Command Line */}
            <div className="p-1.5 bg-zinc-950/80 rounded border border-zinc-800 text-[11px] text-zinc-300 break-all select-all font-mono">
              {node.commandLine}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center space-x-3 pt-0.5 text-[11px]">
              <button
                onClick={() => onSelectEventById(node.eventId)}
                className="flex items-center space-x-1 text-cyan-400 hover:text-cyan-300"
              >
                <Eye className="w-3 h-3" />
                <span>Inspect Event ({node.eventId})</span>
              </button>

              <button
                onClick={() => onPinIOC('command', node.commandLine, `Process: ${node.name} (PID ${node.pid})`)}
                className="flex items-center space-x-1 text-zinc-400 hover:text-emerald-400"
              >
                <Pin className="w-3 h-3" />
                <span>Pin Command</span>
              </button>

              {node.hashes?.sha256 && (
                <button
                  onClick={() => onPinIOC('file_hash', node.hashes!.sha256!, `Hash of ${node.name}`)}
                  className="flex items-center space-x-1 text-zinc-400 hover:text-amber-400"
                >
                  <Pin className="w-3 h-3" />
                  <span>Pin SHA256</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Children nodes */}
        {hasChildren && !isCollapsed && (
          <div className="space-y-1">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 font-mono text-xs text-zinc-200">
      {/* Controls Bar */}
      <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <GitFork className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-zinc-100">
            Process Hierarchy Tree Visualizer
          </span>
          <span className="text-zinc-500 text-xs">
            (Parent-Child Process Reconstruction)
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-zinc-400 text-xs">Target Host:</span>
            <select
              value={selectedHost}
              onChange={e => setSelectedHost(e.target.value)}
              className="bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1 text-xs text-zinc-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="WKSTN-CORP-014">WKSTN-CORP-014 (Victim)</option>
              <option value="FS-CORP-01">FS-CORP-01 (File Server)</option>
              <option value="all">All Enterprise Endpoints</option>
            </select>
          </div>

          <label className="flex items-center space-x-2 cursor-pointer text-xs text-zinc-300">
            <input
              type="checkbox"
              checked={onlyMalicious}
              onChange={e => setOnlyMalicious(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-cyan-600 focus:ring-0"
            />
            <span>Highlight Attack Chain Trees Only</span>
          </label>
        </div>
      </div>

      {/* Visual Tree Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredTrees.length === 0 ? (
          <div className="py-16 text-center text-zinc-500 space-y-2">
            <p className="text-sm font-semibold text-zinc-400">No process trees match your current filter.</p>
            <p className="text-xs text-zinc-600">Toggle "Highlight Attack Chain Trees Only" to inspect all background enterprise processes.</p>
          </div>
        ) : (
          filteredTrees.map(tree => renderNode(tree, 0))
        )}
      </div>
    </div>
  );
};
