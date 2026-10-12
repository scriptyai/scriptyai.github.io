import { useState, useMemo } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-lua';
import { Copy, Check, Download, Play, Bug, Zap, HelpCircle, Terminal, Bookmark, Sparkles, ChevronDown, ShieldCheck, Lock, GitCompare } from 'lucide-react';
import { runLuaCode } from '../utils/luaRunner';
import { ExecutionResult, LuaTarget } from '../types';
import { soundEffects } from '../utils/audioEffects';

interface CodeViewerProps {
  code: string;
  target?: LuaTarget;
  title?: string;
  onDebugCode?: (code: string) => void;
  onOptimizeCode?: (code: string) => void;
  onExplainCode?: (code: string) => void;
  onCompleteScript?: (code: string) => void;
  onSaveScript?: (title: string, code: string) => void;
  onAuditCode?: (code: string) => void;
  onMinifyCode?: (code: string) => void;
  onCompareDiff?: (code: string) => void;
}

export function CodeViewer({
  code,
  target = 'executor',
  title = 'Generated Lua Script',
  onDebugCode,
  onOptimizeCode,
  onExplainCode,
  onCompleteScript,
  onSaveScript,
  onAuditCode,
  onMinifyCode,
  onCompareDiff,
}: CodeViewerProps) {
  const [copied, setCopied] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<ExecutionResult | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  const cleanCode = useMemo(() => {
    return code.replace(/```lua/gi, '').replace(/```/g, '').trim();
  }, [code]);

  const lineCount = useMemo(() => {
    return cleanCode.split('\n').length;
  }, [cleanCode]);

  const appearsTruncated = useMemo(() => {
    const trimmed = cleanCode.trim();
    if (trimmed.length < 60) return false;
    const lines = trimmed.split('\n');
    const lastLine = lines[lines.length - 1].trim();
    if (
      lastLine.endsWith('then') ||
      lastLine.endsWith('do') ||
      lastLine.endsWith('function') ||
      lastLine.endsWith(',') ||
      lastLine.endsWith('(') ||
      lastLine.endsWith('local') ||
      lastLine.endsWith('==') ||
      lastLine.endsWith('..')
    ) {
      return true;
    }
    if (
      trimmed.includes('-- ...') ||
      trimmed.includes('-- rest of code') ||
      trimmed.includes('-- TODO') ||
      trimmed.includes('-- add remaining')
    ) {
      return true;
    }
    const blockOpeners = (trimmed.match(/\b(function|if|for|while)\b/g) || []).length;
    const blockClosers = (trimmed.match(/\bend\b/g) || []).length;
    return blockOpeners > blockClosers + 1;
  }, [cleanCode]);

  const highlightedHtml = useMemo(() => {
    try {
      if (Prism.languages.lua) {
        return Prism.highlight(cleanCode, Prism.languages.lua, 'lua');
      }
      return cleanCode;
    } catch {
      return cleanCode;
    }
  }, [cleanCode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      soundEffects.playSuccess();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleDownload = () => {
    soundEffects.playClick();
    const extension = 'lua';
    const blob = new Blob([cleanCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const safeTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, '_') || 'executor_script';
    link.download = `${safeTitle}.${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExecute = () => {
    soundEffects.playClick();
    setIsRunning(true);
    setShowConsole(true);
    setTimeout(() => {
      const result = runLuaCode(cleanCode);
      setExecResult(result);
      setIsRunning(false);
      if (result.success) {
        soundEffects.playSuccess();
      } else {
        soundEffects.playError();
      }
    }, 50);
  };

  const handleSaveToStash = () => {
    if (onSaveScript) {
      soundEffects.playSuccess();
      onSaveScript(title, cleanCode);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
    }
  };

  return (
    <div className="rounded-2xl border border-rose-950/60 bg-[#0d0914] overflow-hidden shadow-2xl transition-all">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 px-4 py-3 bg-[#08050c]/85 border-b border-rose-950/50">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
          </div>

          <span className="h-4 w-px bg-slate-800 mx-1"></span>

          <span className="text-xs font-mono font-medium text-slate-200 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-rose-400" />
            {title}
          </span>

          <span className="hidden sm:inline-block text-[11px] px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-900/40 font-mono">
            {lineCount} lines • Executor (UNC)
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Quick AI Refinements */}
          {onDebugCode && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onDebugCode(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-md border border-transparent hover:border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer active:scale-95"
              title="Send to AI to find bugs and fix crashes"
            >
              <Bug className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Fix Bug</span>
            </button>
          )}

          {onOptimizeCode && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOptimizeCode(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 rounded-md border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Send to AI to optimize memory and speed"
            >
              <Zap className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Optimize</span>
            </button>
          )}

          {onExplainCode && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onExplainCode(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-violet-300 hover:bg-violet-500/10 rounded-md border border-transparent hover:border-violet-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Explain line-by-line architecture"
            >
              <HelpCircle className="w-3.5 h-3.5 text-violet-400" />
              <span className="hidden md:inline">Explain</span>
            </button>
          )}

          {onCompleteScript && (
            <button
              onClick={() => {
                soundEffects.playGenerate();
                onCompleteScript(cleanCode);
              }}
              className="px-2 py-1 text-xs text-rose-300 hover:text-white bg-rose-600/20 hover:bg-rose-600/35 border border-rose-500/40 rounded-md transition-all flex items-center gap-1 cursor-pointer font-medium"
              title="Ensure all features are 100% completed without cutoffs"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Complete Script</span>
            </button>
          )}

          {onAuditCode && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onAuditCode(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 rounded-md border border-transparent hover:border-emerald-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Audit script for security and anti-cheat risks"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Audit</span>
            </button>
          )}

          {onMinifyCode && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onMinifyCode(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 rounded-md border border-transparent hover:border-amber-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Minify script or generate loadstring"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Minify</span>
            </button>
          )}

          {onCompareDiff && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onCompareDiff(cleanCode);
              }}
              className="px-2 py-1 text-xs text-slate-300 hover:text-rose-300 hover:bg-rose-500/10 rounded-md border border-transparent hover:border-rose-500/30 transition-all flex items-center gap-1 cursor-pointer"
              title="Compare code versions side-by-side"
            >
              <GitCompare className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden md:inline">Diff</span>
            </button>
          )}

          {/* Bookmark / Stash */}
          {onSaveScript && (
            <button
              onClick={handleSaveToStash}
              className={`px-2 py-1 text-xs rounded-md border transition-all flex items-center gap-1 cursor-pointer ${
                isSaved
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 border-transparent'
              }`}
              title="Save to My Stash"
            >
              {isSaved ? <Check className="w-3.5 h-3.5 text-amber-400" /> : <Bookmark className="w-3.5 h-3.5 text-amber-400" />}
              <span className="hidden md:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>
          )}

          <span className="h-4 w-px bg-slate-800 mx-0.5"></span>

          {/* Test / Run in Lua VM */}
          <button
            onClick={handleExecute}
            disabled={isRunning}
            className="px-2.5 py-1 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 rounded-md transition-all flex items-center gap-1.5 cursor-pointer font-medium hover:shadow-sm hover:shadow-emerald-500/20"
            title="Execute script in in-browser Lua VM"
          >
            <Play className={`w-3 h-3 fill-current ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running...' : 'Run in Lua'}</span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={`px-2.5 py-1 text-xs rounded-md border transition-all duration-200 active:scale-95 hover:scale-[1.03] flex items-center gap-1.5 cursor-pointer font-medium ${
              copied
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300 shadow-sm'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title="Copy Lua code to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400 animate-avatar-pop" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="p-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-md transition-all duration-200 active:scale-95 hover:scale-105 cursor-pointer"
            title="Download .lua script file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Target Placement Badge Banner */}
      <div className="px-4 py-1.5 bg-[#09060e] border-b border-rose-950/40 flex items-center justify-between text-xs text-slate-400 font-mono">
        <span className="flex items-center gap-1.5 text-rose-400">
          <Sparkles className="w-3 h-3" />
          Ready for Synapse, Wave, Krnl, Fluxus, Delta, Codex
        </span>
        <span className="text-[11px] text-slate-400">Lua 5.1 - 5.4 / Luau Strict</span>
      </div>

      {/* Truncation / Incomplete Warning Banner */}
      {appearsTruncated && (
        <div className="px-4 py-2 bg-amber-950/50 border-b border-amber-800/60 flex items-center justify-between gap-2 text-xs text-amber-200 animate-code-reveal">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
            <span>Script may be incomplete or cut off.</span>
          </div>
          {onCompleteScript && (
            <button
              onClick={() => {
                soundEffects.playGenerate();
                onCompleteScript(cleanCode);
              }}
              className="px-2.5 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white font-semibold text-[11px] shadow-sm flex items-center gap-1 cursor-pointer transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-3 h-3" />
              <span>Auto-Complete Full Script</span>
            </button>
          )}
        </div>
      )}

      {/* Code Editor Body with Line Numbers */}
      <div className="relative max-h-[540px] overflow-y-auto overflow-x-auto p-4 font-mono text-[13px] leading-relaxed select-text bg-[#07050a]">
        <pre className="flex">
          {/* Line Numbers */}
          <div className="select-none pr-4 text-right text-slate-600 font-mono border-r border-rose-950/50 mr-4 shrink-0">
            {Array.from({ length: lineCount }).map((_, i) => (
              <div key={i} className="leading-relaxed">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Syntax Code Content */}
          <div
            className="flex-1 whitespace-pre outline-none text-slate-200 overflow-x-auto font-mono"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        </pre>
      </div>

      {/* Embedded Terminal Output Drawer */}
      {showConsole && (
        <div className="border-t border-rose-950/50 bg-[#07040a]/95 p-3.5 font-mono text-xs animate-code-reveal">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-rose-950/40 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-200 font-semibold">Lua 5.3 Virtual Machine Console</span>
              {execResult && (
                <span className={`px-1.5 py-0.2 rounded text-[10px] ${execResult.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {execResult.success ? `Done in ${execResult.durationMs}ms` : 'Failed'}
                </span>
              )}
            </div>

            <button
              onClick={() => setShowConsole(false)}
              className="text-slate-400 hover:text-slate-200 cursor-pointer p-0.5"
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>

          {/* Console logs */}
          <div className="max-h-44 overflow-y-auto space-y-1">
            {execResult ? (
              <>
                {execResult.output && (
                  <pre className="text-emerald-300/90 whitespace-pre-wrap leading-relaxed">
                    {execResult.output}
                  </pre>
                )}
                {execResult.error && (
                  <div className="mt-1 p-2 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 whitespace-pre-wrap leading-relaxed">
                    {execResult.error}
                  </div>
                )}
                {cleanCode.includes('game:GetService') && (
                  <div className="mt-2 p-2 rounded bg-violet-950/30 border border-violet-800/40 text-violet-300 text-[11px]">
                    ℹ️ Note: This script invokes Roblox engine services. For in-game execution, paste directly into your executor.
                  </div>
                )}
              </>
            ) : (
              <div className="text-slate-400 italic">Click "Run in Lua" to execute this script in the sandbox.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
