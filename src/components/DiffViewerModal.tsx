import { useState, useMemo } from 'react';
import { X, GitCompare, ArrowRight, Check, Copy } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface DiffViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalCode: string;
  modifiedCode: string;
  title?: string;
  onApplyModified?: (code: string) => void;
}

export function DiffViewerModal({
  isOpen,
  onClose,
  originalCode,
  modifiedCode,
  title = 'Script Diff & Code Comparison',
  onApplyModified,
}: DiffViewerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const diffLines = useMemo(() => {
    const origLines = (originalCode || '').split('\n');
    const modLines = (modifiedCode || '').split('\n');
    const maxLen = Math.max(origLines.length, modLines.length);

    const rows: {
      lineNum: number;
      orig: string | null;
      mod: string | null;
      status: 'same' | 'changed' | 'added' | 'removed';
    }[] = [];

    for (let i = 0; i < maxLen; i++) {
      const orig = origLines[i] !== undefined ? origLines[i] : null;
      const mod = modLines[i] !== undefined ? modLines[i] : null;

      let status: 'same' | 'changed' | 'added' | 'removed' = 'same';
      if (orig === null && mod !== null) {
        status = 'added';
      } else if (orig !== null && mod === null) {
        status = 'removed';
      } else if (orig !== mod) {
        status = 'changed';
      }

      rows.push({
        lineNum: i + 1,
        orig,
        mod,
        status,
      });
    }

    return rows;
  }, [originalCode, modifiedCode]);

  const handleCopyNew = async () => {
    await navigator.clipboard.writeText(modifiedCode);
    soundEffects.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0e0914] border border-rose-950/70 rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-950/60 flex items-center justify-between bg-[#08050c]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>{title}</span>
              </h2>
              <p className="text-xs text-slate-400">
                Side-by-side comparison of original script vs optimized / debugged script
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Legend */}
        <div className="px-4 py-2 bg-[#0a0710] border-b border-rose-950/40 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-400">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500/60 inline-block" />
              Original (Before)
            </span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500/60 inline-block" />
              Modified / AI Fixed (After)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyNew}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied!' : 'Copy New Script'}</span>
            </button>
            {onApplyModified && (
              <button
                onClick={() => {
                  onApplyModified(modifiedCode);
                  onClose();
                }}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold cursor-pointer"
              >
                Apply to Studio
              </button>
            )}
          </div>
        </div>

        {/* Diff Table */}
        <div className="p-4 flex-1 overflow-y-auto font-mono text-xs select-text">
          <div className="grid grid-cols-2 gap-2 border border-rose-950/60 rounded-xl overflow-hidden bg-[#07050a]">
            {/* Header labels */}
            <div className="p-2 bg-[#100b18] border-b border-rose-950/50 text-slate-400 font-semibold text-center text-[11px]">
              Original Script ({originalCode.split('\n').length} lines)
            </div>
            <div className="p-2 bg-[#100b18] border-b border-rose-950/50 text-emerald-400 font-semibold text-center text-[11px]">
              Modified Script ({modifiedCode.split('\n').length} lines)
            </div>

            {/* Side-by-side rows */}
            <div className="col-span-2 divide-y divide-rose-950/30 max-h-[500px] overflow-y-auto">
              {diffLines.map((row) => (
                <div key={row.lineNum} className="grid grid-cols-2 text-[12px]">
                  {/* Left Original */}
                  <div
                    className={`px-3 py-1 flex items-start gap-2 border-r border-rose-950/40 ${
                      row.status === 'changed' || row.status === 'removed'
                        ? 'bg-rose-950/20 text-rose-300'
                        : 'text-slate-400'
                    }`}
                  >
                    <span className="w-7 text-right select-none text-slate-600 font-mono text-[10px] shrink-0 pt-0.5">
                      {row.orig !== null ? row.lineNum : ''}
                    </span>
                    <pre className="whitespace-pre overflow-x-auto font-mono flex-1">
                      {row.orig ?? ''}
                    </pre>
                  </div>

                  {/* Right Modified */}
                  <div
                    className={`px-3 py-1 flex items-start gap-2 ${
                      row.status === 'changed' || row.status === 'added'
                        ? 'bg-emerald-950/20 text-emerald-300 font-medium'
                        : 'text-slate-300'
                    }`}
                  >
                    <span className="w-7 text-right select-none text-slate-600 font-mono text-[10px] shrink-0 pt-0.5">
                      {row.mod !== null ? row.lineNum : ''}
                    </span>
                    <pre className="whitespace-pre overflow-x-auto font-mono flex-1">
                      {row.mod ?? ''}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
