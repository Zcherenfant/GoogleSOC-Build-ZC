import React, { useEffect, useRef } from 'react';
import { Filter, EyeOff, Pin, Copy, Check, X } from 'lucide-react';
import { IOCType } from '../types/telemetry';

export interface CellActionTarget {
  fieldName: string;
  fieldLabel: string;
  value: string;
  iocType?: IOCType;
  position: { x: number; y: number };
}

interface CellFilterPopoverProps {
  target: CellActionTarget | null;
  onClose: () => void;
  onFilterInclude: (fieldName: string, value: string) => void;
  onFilterExclude: (fieldName: string, value: string) => void;
  onPinIOC: (type: IOCType, value: string) => void;
}

export const CellFilterPopover: React.FC<CellFilterPopoverProps> = ({
  target,
  onClose,
  onFilterInclude,
  onFilterExclude,
  onPinIOC,
}) => {
  const [copied, setCopied] = React.useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  if (!target) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(target.value);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      onClose();
    }, 800);
  };

  // Determine smart IOC type if not explicitly set
  const resolveIocType = (): IOCType => {
    if (target.iocType) return target.iocType;
    if (target.fieldName.includes('ip')) return 'ip';
    if (target.fieldName.includes('hostname')) return 'hostname';
    if (target.fieldName.includes('domain')) return 'domain';
    if (target.fieldName.includes('hash') || target.fieldName.includes('sha256')) return 'file_hash';
    if (target.fieldName.includes('path') || target.fieldName.includes('file')) return 'file_path';
    if (target.fieldName.includes('command')) return 'command';
    if (target.fieldName.includes('user')) return 'user';
    return 'domain';
  };

  // Keep popover on screen
  const style: React.CSSProperties = {
    top: `${Math.min(target.position.y + 10, window.innerHeight - 200)}px`,
    left: `${Math.min(target.position.x - 20, window.innerWidth - 260)}px`,
  };

  return (
    <div
      ref={popoverRef}
      style={style}
      className="fixed z-50 w-64 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl p-2.5 font-mono text-xs text-zinc-200"
    >
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="truncate">
          <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
            {target.fieldLabel}
          </span>
          <span className="text-cyan-400 font-semibold truncate block" title={target.value}>
            {target.value}
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-zinc-500 hover:text-zinc-300 p-1 rounded"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="pt-2 space-y-1">
        <button
          onClick={() => {
            onFilterInclude(target.fieldName, target.value);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-cyan-300 text-left transition-colors"
        >
          <Filter className="w-3.5 h-3.5 text-cyan-400" />
          <span>Filter to this value</span>
        </button>

        <button
          onClick={() => {
            onFilterExclude(target.fieldName, target.value);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 text-left transition-colors"
        >
          <EyeOff className="w-3.5 h-3.5 text-amber-400" />
          <span>Exclude this value</span>
        </button>

        <button
          onClick={() => {
            onPinIOC(resolveIocType(), target.value);
            onClose();
          }}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-emerald-300 text-left transition-colors"
        >
          <Pin className="w-3.5 h-3.5 text-emerald-400" />
          <span>Pin to IOC Notebook</span>
        </button>

        <button
          onClick={handleCopy}
          className="w-full flex items-center space-x-2 px-2.5 py-1.5 rounded hover:bg-zinc-800 text-zinc-300 hover:text-white text-left transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-zinc-400" />
              <span>Copy value</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
