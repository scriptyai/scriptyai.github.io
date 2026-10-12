import { useState } from 'react';
import { X, Bookmark, Trash2, Copy, Check, Play, Download, Terminal, Plus } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

export interface SavedScriptItem {
  id: string;
  title: string;
  code: string;
  timestamp: number;
  category?: string;
}

interface SavedScriptsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedScripts: SavedScriptItem[];
  onDeleteScript: (id: string) => void;
  onLoadScript: (script: SavedScriptItem) => void;
  onExportAll: () => void;
}

export function SavedScriptsModal({
  isOpen,
  onClose,
  savedScripts,
  onDeleteScript,
  onLoadScript,
  onExportAll,
}: SavedScriptsModalProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (script: SavedScriptItem) => {
    await navigator.clipboard.writeText(script.code);
    soundEffects.playSuccess();
    setCopiedId(script.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadSingle = (script: SavedScriptItem) => {
    soundEffects.playClick();
    const blob = new Blob([script.code], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${script.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.lua`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090d18] border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>My Saved Lua Scripts</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {savedScripts.length} saved
                </span>
              </h2>
              <p className="text-xs text-slate-400">Locally saved custom scripts, snippets, and production builds</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action bar */}
        <div className="p-3 bg-slate-950/40 border-b border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 font-mono text-[11px]">Persisted in local browser storage</span>
          {savedScripts.length > 0 && (
            <button
              onClick={onExportAll}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors flex items-center gap-1.5 cursor-pointer font-medium"
            >
              <Download className="w-3.5 h-3.5 text-cyan-400" />
              <span>Export All as ZIP/JSON</span>
            </button>
          )}
        </div>

        {/* Script List */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {savedScripts.length === 0 ? (
            <div className="text-center py-16 space-y-2">
              <Terminal className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-slate-300 font-medium text-sm">No saved scripts yet</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Generate any script with Mujtaba Scripty AI and click "Save to Stash" to bookmark it here for instant access anytime.
              </p>
            </div>
          ) : (
            savedScripts.map((script) => (
              <div
                key={script.id}
                className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200">{script.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(script.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-400 line-clamp-1">
                    {script.code.slice(0, 100).replace(/\n/g, ' ')}...
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => {
                      soundEffects.playClick();
                      onLoadScript(script);
                      onClose();
                    }}
                    className="px-2.5 py-1 text-xs rounded bg-cyan-600/20 text-cyan-300 hover:bg-cyan-600/30 border border-cyan-500/30 flex items-center gap-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Open in VM</span>
                  </button>

                  <button
                    onClick={() => handleCopy(script)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Copy code"
                  >
                    {copiedId === script.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>

                  <button
                    onClick={() => handleDownloadSingle(script)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                    title="Download .lua"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.playError();
                      onDeleteScript(script.id);
                    }}
                    className="p-1.5 rounded bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
