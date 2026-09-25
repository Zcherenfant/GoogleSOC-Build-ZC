import React, { useState } from 'react';
import { 
  NormalizedLogEvent, 
  KQLQueryResult, 
  IOCType 
} from '../types/telemetry';
import { CellActionTarget } from './CellFilterPopover';
import { 
  ChevronLeft, 
  ChevronRight, 
  Pin, 
  Eye, 
  Terminal, 
  Activity, 
  FileText, 
  ShieldAlert,
  BarChart3
} from 'lucide-react';

interface TelemetryTableProps {
  events: NormalizedLogEvent[];
  queryResult: KQLQueryResult;
  onSelectEvent: (event: NormalizedLogEvent) => void;
  onCellClick: (target: CellActionTarget) => void;
  onPinIOC: (type: IOCType, value: string, notes?: string) => void;
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({
  events,
  queryResult,
  onSelectEvent,
  onCellClick,
  onPinIOC,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const totalPages = Math.max(1, Math.ceil(events.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const currentEvents = events.slice(startIndex, startIndex + pageSize);

  // If page is out of bounds due to filtering, adjust it
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  }

  const handleCellClickInternal = (
    e: React.MouseEvent,
    fieldName: string,
    fieldLabel: string,
    value: string,
    iocType?: IOCType
  ) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    onCellClick({
      fieldName,
      fieldLabel,
      value,
      iocType,
      position: { x: rect.left, y: rect.bottom },
    });
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'critical':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-950 text-red-300 border border-red-800">CRIT</span>;
      case 'high':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-950 text-orange-300 border border-orange-800">HIGH</span>;
      case 'medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">MED</span>;
      case 'low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">LOW</span>;
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-zinc-400 border border-zinc-800">INFO</span>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'process':
        return <Terminal className="w-3.5 h-3.5 text-cyan-400" />;
      case 'network':
        return <Activity className="w-3.5 h-3.5 text-emerald-400" />;
      case 'file':
        return <FileText className="w-3.5 h-3.5 text-amber-400" />;
      case 'authentication':
        return <ShieldAlert className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return null;
    }
  };

  // If queryResult contains summaries (from | summarize count() by field)
  if (queryResult.summaries && queryResult.summaries.length > 0) {
    const summary = queryResult.summaries[0];
    const maxCount = Math.max(...summary.aggregations.map(a => a.count), 1);

    return (
      <div className="bg-zinc-950 p-4 space-y-4 font-mono text-xs text-zinc-200">
        <div className="flex items-center space-x-2 pb-2 border-b border-zinc-800">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="font-bold text-sm text-zinc-100">
            KQL Aggregation Summary: count() by {summary.field}
          </span>
          <span className="text-zinc-500">({summary.aggregations.length} distinct values)</span>
        </div>

        <div className="space-y-2 max-w-4xl">
          {summary.aggregations.map((item, idx) => {
            const pct = Math.round((item.count / maxCount) * 100);
            return (
              <div key={idx} className="flex items-center space-x-3 bg-zinc-900/60 p-2 rounded border border-zinc-800/80">
                <div className="w-64 truncate text-cyan-300 font-semibold text-xs" title={item.key}>
                  {item.key}
                </div>
                <div className="flex-1 bg-zinc-950 h-4 rounded overflow-hidden relative">
                  <div
                    className="bg-cyan-600 h-full rounded transition-all duration-300"
                    style={{ width: `${Math.max(pct, 2)}%` }}
                  />
                </div>
                <div className="w-16 text-right font-bold text-zinc-300">
                  {item.count}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-zinc-950 font-mono text-xs select-none">
      {/* Table Container */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-zinc-900/90 text-zinc-400 sticky top-0 z-20 border-b border-zinc-800 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3 w-10 text-center">Sev</th>
              <th className="py-2.5 px-3 w-36">Time (UTC)</th>
              <th className="py-2.5 px-3 w-28">Host</th>
              <th className="py-2.5 px-3 w-28">Source / ID</th>
              <th className="py-2.5 px-3 w-28">User</th>
              <th className="py-2.5 px-3">Process / Details</th>
              <th className="py-2.5 px-3 w-48">Network / Target</th>
              <th className="py-2.5 px-3 w-24 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-zinc-300 text-xs">
            {currentEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-zinc-500">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-zinc-400">No events matched your KQL query.</p>
                    <p className="text-xs text-zinc-600">Try loosening your filters or click "All Logs" above.</p>
                  </div>
                </td>
              </tr>
            ) : (
              currentEvents.map(evt => {
                const isMaliciousAlert = evt.severity === 'high' || evt.severity === 'critical';

                return (
                  <tr
                    key={evt.id}
                    onClick={() => onSelectEvent(evt)}
                    className={`cursor-pointer transition-colors ${
                      isMaliciousAlert
                        ? 'hover:bg-red-950/20 bg-red-950/5'
                        : 'hover:bg-zinc-900/70'
                    }`}
                  >
                    {/* Severity */}
                    <td className="py-2 px-3 text-center">
                      {getSeverityBadge(evt.severity)}
                    </td>

                    {/* Timestamp */}
                    <td className="py-2 px-3 text-zinc-400 text-[11px] whitespace-nowrap">
                      {evt.timestamp.replace('2025-03-15T', '').replace('Z', '')}
                    </td>

                    {/* Host */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <button
                        onClick={e => handleCellClickInternal(e, 'host.hostname', 'Host', evt.host.hostname, 'hostname')}
                        className="text-cyan-400 hover:text-cyan-200 hover:underline text-left font-medium"
                      >
                        {evt.host.hostname}
                      </button>
                    </td>

                    {/* Source / ID */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <div className="flex items-center space-x-1.5">
                        {getCategoryIcon(evt.event_category)}
                        <span className="text-zinc-400 uppercase text-[11px]">
                          {evt.event_source}
                        </span>
                        <span className="text-zinc-500 text-[10px]">
                          #{evt.event_id}
                        </span>
                      </div>
                    </td>

                    {/* User */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      <button
                        onClick={e => handleCellClickInternal(e, 'user.username', 'User Account', evt.user.username, 'user')}
                        className="text-zinc-300 hover:text-cyan-300 hover:underline text-left truncate max-w-[100px] block"
                      >
                        {evt.user.username}
                      </button>
                    </td>

                    {/* Primary Process / Command / Message */}
                    <td className="py-2 px-3">
                      <div className="space-y-0.5 max-w-xl">
                        {evt.process ? (
                          <div className="flex items-baseline space-x-2">
                            <button
                              onClick={e => handleCellClickInternal(e, 'process.name', 'Process Name', evt.process!.name)}
                              className="text-amber-300 hover:underline font-semibold shrink-0"
                            >
                              {evt.process.name}
                            </button>
                            <span className="text-zinc-500 text-[10px] shrink-0">
                              (PID: {evt.process.pid})
                            </span>
                            <span className="text-zinc-400 truncate text-[11px] block" title={evt.process.command_line}>
                              {evt.process.command_line}
                            </span>
                          </div>
                        ) : evt.file ? (
                          <div className="flex items-center space-x-2">
                            <span className="text-emerald-400 font-semibold">{evt.file.name}</span>
                            <span className="text-zinc-500 truncate text-[11px]">{evt.file.path}</span>
                          </div>
                        ) : (
                          <div className="text-zinc-400 truncate text-[11px]" title={evt.raw_message}>
                            {evt.raw_message}
                          </div>
                        )}

                        {/* MITRE badge */}
                        {evt.mitre && (
                          <div className="flex items-center space-x-1.5 pt-0.5">
                            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[9px] px-1 py-0.2 rounded font-bold">
                              {evt.mitre.technique_id}
                            </span>
                            <span className="text-zinc-500 text-[10px]">
                              {evt.mitre.technique_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Network / Artifact Details */}
                    <td className="py-2 px-3 whitespace-nowrap">
                      {evt.network ? (
                        <div className="space-y-0.5">
                          <button
                            onClick={e => handleCellClickInternal(e, 'dest_ip', 'Destination IP', evt.network!.dest_ip, 'ip')}
                            className="text-cyan-300 hover:underline font-semibold block text-left"
                          >
                            {evt.network.dest_ip}:{evt.network.dest_port}
                          </button>
                          {evt.network.dest_hostname && (
                            <button
                              onClick={e => handleCellClickInternal(e, 'dest_hostname', 'FQDN Domain', evt.network!.dest_hostname!, 'domain')}
                              className="text-amber-400 hover:underline text-[10px] truncate max-w-[180px] block text-left"
                            >
                              {evt.network.dest_hostname}
                            </button>
                          )}
                        </div>
                      ) : evt.file?.hashes?.sha256 ? (
                        <button
                          onClick={e => handleCellClickInternal(e, 'sha256', 'SHA256 Hash', evt.file!.hashes!.sha256!, 'file_hash')}
                          className="text-zinc-400 hover:text-cyan-300 text-[10px] truncate max-w-[180px] block"
                          title={evt.file.hashes.sha256}
                        >
                          {evt.file.hashes.sha256.slice(0, 16)}...
                        </button>
                      ) : (
                        <span className="text-zinc-600">-</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-2 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end space-x-1" onClick={e => e.stopPropagation()}>
                        <button
                          onClick={() => {
                            if (evt.network?.dest_ip) {
                              onPinIOC('ip', evt.network.dest_ip, `From ${evt.id}`);
                            } else if (evt.process?.hashes?.sha256) {
                              onPinIOC('file_hash', evt.process.hashes.sha256, `SHA256 of ${evt.process.name}`);
                            } else if (evt.process?.command_line) {
                              onPinIOC('command', evt.process.command_line, `CLI from ${evt.id}`);
                            } else {
                              onPinIOC('hostname', evt.host.hostname, `Host ${evt.id}`);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-800 rounded transition-colors"
                          title="Quick Pin to IOCs"
                        >
                          <Pin className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => onSelectEvent(evt)}
                          className="p-1 text-zinc-500 hover:text-cyan-400 hover:bg-zinc-800 rounded transition-colors"
                          title="Inspect Event JSON & Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-2.5 bg-zinc-900/90 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
        <div className="flex items-center space-x-2">
          <span>Showing</span>
          <span className="text-zinc-200 font-bold">
            {events.length > 0 ? startIndex + 1 : 0} - {Math.min(startIndex + pageSize, events.length)}
          </span>
          <span>of</span>
          <span className="text-zinc-200 font-bold">{events.length}</span>
          <span>events</span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span>Rows:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-zinc-950 border border-zinc-700 text-zinc-200 rounded px-2 py-0.5 text-xs focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={200}>200</option>
            </select>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-mono text-zinc-200">
              {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded bg-zinc-800 text-zinc-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-zinc-700 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
