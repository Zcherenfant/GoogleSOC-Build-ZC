import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Pin, 
  ExternalLink, 
  Terminal, 
  Server, 
  User, 
  Activity, 
  FileCode, 
  ShieldAlert,
  Hash
} from 'lucide-react';
import { NormalizedLogEvent, IOCType } from '../types/telemetry';

interface EventDetailDrawerProps {
  event: NormalizedLogEvent | null;
  onClose: () => void;
  onPinIOC: (type: IOCType, value: string, notes?: string) => void;
  onFilterField: (field: string, value: string) => void;
}

export const EventDetailDrawer: React.FC<EventDetailDrawerProps> = ({
  event,
  onClose,
  onPinIOC,
  onFilterField,
}) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'structured' | 'raw' | 'json'>('structured');

  if (!event) return null;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1200);
  };

  const getSeverityBadgeClass = (sev: string) => {
    switch (sev) {
      case 'critical':
        return 'bg-red-950 text-red-300 border-red-700/80';
      case 'high':
        return 'bg-orange-950 text-orange-300 border-orange-700/80';
      case 'medium':
        return 'bg-amber-950 text-amber-300 border-amber-700/80';
      case 'low':
        return 'bg-blue-950 text-blue-300 border-blue-700/80';
      default:
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full max-w-2xl bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 flex flex-col font-mono text-xs text-zinc-200 animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-cyan-400">{event.id}</span>
            <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${getSeverityBadgeClass(event.severity)}`}>
              {event.severity}
            </span>
          </div>
          <span className="text-zinc-500">|</span>
          <span className="text-zinc-400">{event.event_source.toUpperCase()} (ID: {event.event_id})</span>
        </div>

        <button
          onClick={onClose}
          className="text-zinc-400 hover:text-white p-1 rounded-md hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-4 py-2 border-b border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'structured'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Parsed Fields
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'raw'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Raw Syslog
          </button>
          <button
            onClick={() => setActiveTab('json')}
            className={`px-3 py-1 rounded transition-colors ${
              activeTab === 'json'
                ? 'bg-cyan-950 border border-cyan-500 text-cyan-200 font-semibold'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            JSON Document
          </button>
        </div>

        <div className="text-zinc-500 text-[11px]">
          {event.timestamp}
        </div>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* MITRE ATT&CK Banner if available */}
        {event.mitre && (
          <div className="bg-zinc-900 border border-cyan-800/60 rounded-lg p-3 space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs">
                <ShieldAlert className="w-4 h-4" />
                <span>MITRE ATT&CK: {event.mitre.technique_id} - {event.mitre.technique_name}</span>
              </div>
              <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-700/60 px-2 py-0.5 rounded">
                Tactic: {event.mitre.tactic}
              </span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Behavior matches enterprise adversary technique for {event.mitre.tactic.toLowerCase()}.
            </p>
          </div>
        )}

        {activeTab === 'structured' && (
          <>
            {/* Host & User Identity Box */}
            <div className="grid grid-cols-2 gap-3 bg-zinc-900/60 p-3 rounded-lg border border-zinc-800">
              <div>
                <div className="flex items-center space-x-1.5 text-zinc-400 mb-1 text-[11px] font-semibold">
                  <Server className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Host Endpoint</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Hostname:</span>
                    <button
                      onClick={() => onFilterField('host.hostname', event.host.hostname)}
                      className="text-cyan-300 hover:underline"
                    >
                      {event.host.hostname}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">IP Address:</span>
                    <button
                      onClick={() => onFilterField('host.ip', event.host.ip)}
                      className="text-cyan-300 hover:underline"
                    >
                      {event.host.ip}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center space-x-1.5 text-zinc-400 mb-1 text-[11px] font-semibold">
                  <User className="w-3.5 h-3.5 text-cyan-400" />
                  <span>User Identity</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Account:</span>
                    <button
                      onClick={() => onFilterField('user.username', event.user.username)}
                      className="text-cyan-300 hover:underline"
                    >
                      {event.user.domain}\{event.user.username}
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Privileges:</span>
                    <span className={event.user.is_admin ? 'text-amber-400 font-bold' : 'text-zinc-400'}>
                      {event.user.is_admin ? 'Elevated (Admin / SYSTEM)' : 'Standard User'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Execution Block */}
            {event.process && (
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold text-xs">
                    <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Process Execution Details</span>
                  </div>
                  <button
                    onClick={() => onPinIOC('command', event.process!.command_line, `Executed on ${event.host.hostname}`)}
                    className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-emerald-400"
                  >
                    <Pin className="w-3 h-3" />
                    <span>Pin Command IOC</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Process Name (PID):</span>
                    <span className="text-zinc-200 font-semibold">{event.process.name} ({event.process.pid})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Parent Process (PPID):</span>
                    <span className="text-zinc-300">{event.process.parent_name || 'N/A'} ({event.process.parent_pid || 'N/A'})</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                    <span>Full Command Line:</span>
                    <button
                      onClick={() => copyToClipboard(event.process!.command_line, 'cli')}
                      className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                    >
                      {copiedField === 'cli' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedField === 'cli' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <pre className="p-2 bg-zinc-950 border border-zinc-800 rounded text-zinc-300 whitespace-pre-wrap break-all text-[11px]">
                    {event.process.command_line}
                  </pre>
                </div>

                {event.process.hashes?.sha256 && (
                  <div>
                    <div className="flex items-center justify-between text-zinc-500 text-[11px] mb-1">
                      <span>SHA256 Hash:</span>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onPinIOC('file_hash', event.process!.hashes!.sha256!, `SHA256 of ${event.process!.name}`)}
                          className="text-emerald-400 hover:text-emerald-300 flex items-center space-x-1"
                        >
                          <Pin className="w-3 h-3" />
                          <span>Pin Hash</span>
                        </button>
                        <button
                          onClick={() => copyToClipboard(event.process!.hashes!.sha256!, 'sha256')}
                          className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
                        >
                          {copiedField === 'sha256' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedField === 'sha256' ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    </div>
                    <code className="p-1.5 bg-zinc-950 border border-zinc-800 rounded text-amber-300 block text-[11px] break-all">
                      {event.process.hashes.sha256}
                    </code>
                  </div>
                )}
              </div>
            )}

            {/* Network Connection Block */}
            {event.network && (
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold text-xs">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Network Telemetry Details</span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => onPinIOC('ip', event.network!.dest_ip, `Dest IP from ${event.id}`)}
                      className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-emerald-400"
                    >
                      <Pin className="w-3 h-3" />
                      <span>Pin Dest IP</span>
                    </button>
                    {event.network.dest_hostname && (
                      <button
                        onClick={() => onPinIOC('domain', event.network!.dest_hostname!, `Domain from ${event.id}`)}
                        className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-emerald-400"
                      >
                        <Pin className="w-3 h-3" />
                        <span>Pin Domain</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Source Endpoint:</span>
                    <span className="text-zinc-200 font-semibold">{event.network.src_ip}:{event.network.src_port}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Destination Endpoint:</span>
                    <span className="text-cyan-300 font-semibold">{event.network.dest_ip}:{event.network.dest_port}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Protocol & Direction:</span>
                    <span className="text-zinc-300 uppercase">{event.network.protocol} ({event.network.direction})</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block">Resolved Hostname / FQDN:</span>
                    <span className="text-amber-300 font-semibold">{event.network.dest_hostname || 'None / Direct IP'}</span>
                  </div>
                </div>
              </div>
            )}

            {/* File System Block */}
            {event.file && (
              <div className="bg-zinc-900/60 p-3 rounded-lg border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                  <div className="flex items-center space-x-1.5 text-zinc-300 font-semibold text-xs">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    <span>File System Artifact</span>
                  </div>
                  <button
                    onClick={() => onPinIOC('file_path', event.file!.path, `Action: ${event.file!.action}`)}
                    className="flex items-center space-x-1 text-[11px] text-zinc-400 hover:text-emerald-400"
                  >
                    <Pin className="w-3 h-3" />
                    <span>Pin File Path</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <span className="text-zinc-500 block">Target File Path:</span>
                    <span className="text-cyan-300 break-all font-semibold">{event.file.path}</span>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <span className="text-zinc-500">File Name:</span>{' '}
                      <span className="text-zinc-200">{event.file.name}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500">Action:</span>{' '}
                      <span className="text-emerald-400 uppercase font-bold">{event.file.action}</span>
                    </div>
                  </div>
                  {event.file.hashes?.sha256 && (
                    <div>
                      <span className="text-zinc-500 block">File SHA256:</span>
                      <code className="p-1.5 bg-zinc-950 border border-zinc-800 rounded text-amber-300 block text-[11px] break-all">
                        {event.file.hashes.sha256}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'raw' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Raw Windows Syslog / Alert Payload:</span>
              <button
                onClick={() => copyToClipboard(event.raw_message, 'raw')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                {copiedField === 'raw' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'raw' ? 'Copied' : 'Copy Raw'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-emerald-400 font-mono text-[11px] leading-relaxed whitespace-pre-wrap break-all select-all">
              {event.raw_message}
            </pre>
          </div>
        )}

        {activeTab === 'json' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-zinc-400 text-[11px]">
              <span>Normalized SIEM Event Document:</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(event, null, 2), 'json')}
                className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                {copiedField === 'json' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedField === 'json' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-zinc-300 font-mono text-[11px] leading-relaxed overflow-x-auto select-all max-h-96">
              {JSON.stringify(event, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer quick action buttons */}
      <div className="p-3 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
        <button
          onClick={() => onFilterField('host.hostname', event.host.hostname)}
          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs transition-colors"
        >
          Isolate Host: {event.host.hostname}
        </button>

        <button
          onClick={onClose}
          className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded text-xs font-semibold transition-colors"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
