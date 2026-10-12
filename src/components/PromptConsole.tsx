import { useState, useRef, useEffect, ChangeEvent } from 'react';
import { Send, Zap, Bug, Sparkles, RefreshCw, HelpCircle, Code2, ChevronDown, ChevronUp, StopCircle, X, Upload, ShieldCheck, Lock } from 'lucide-react';
import { LuaAction, LuaTarget } from '../types';
import { soundEffects } from '../utils/audioEffects';

interface PromptConsoleProps {
  currentTarget: LuaTarget;
  currentAction: LuaAction;
  onSelectAction: (a: LuaAction) => void;
  onSubmit: (prompt: string, existingCode?: string) => void;
  isGenerating: boolean;
  onCancel: () => void;
  presetCode?: string;
  onClearPresetCode?: () => void;
  onOpenObfuscator?: () => void;
  onOpenSecurityAudit?: () => void;
}

export function PromptConsole({
  currentTarget,
  currentAction,
  onSelectAction,
  onSubmit,
  isGenerating,
  onCancel,
  presetCode,
  onClearPresetCode,
  onOpenObfuscator,
  onOpenSecurityAudit,
}: PromptConsoleProps) {
  const [prompt, setPrompt] = useState('');
  const [existingCode, setExistingCode] = useState(presetCode || '');
  const [showCodeInput, setShowCodeInput] = useState(
    currentAction === 'debug' || currentAction === 'optimize' || currentAction === 'convert' || currentAction === 'explain'
  );
  const [isBursting, setIsBursting] = useState(false);
  const [modeSwitchAnim, setModeSwitchAnim] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (presetCode) {
      setExistingCode(presetCode);
      setShowCodeInput(true);
    }
  }, [presetCode]);

  useEffect(() => {
    if (
      currentAction === 'debug' ||
      currentAction === 'optimize' ||
      currentAction === 'convert' ||
      currentAction === 'explain'
    ) {
      setShowCodeInput(true);
    }
    setModeSwitchAnim(currentAction);
    const timer = setTimeout(() => setModeSwitchAnim(null), 650);
    return () => clearTimeout(timer);
  }, [currentAction]);

  const actions: { id: LuaAction; label: string; icon: any; placeholder: string; desc: string; color: string }[] = [
    {
      id: 'generate',
      label: 'New Script',
      icon: Sparkles,
      placeholder: 'Describe your Executor script (e.g. "Create a draggable GUI with speed toggle, FPS booster, or CFrame logger")...',
      desc: 'Generate production-ready Executor (UNC) script',
      color: 'from-rose-500 to-amber-500',
    },
    {
      id: 'debug',
      label: 'Fix Bug',
      icon: Bug,
      placeholder: 'Describe the executor bug, crash, or paste the error traceback message...',
      desc: 'Find root-cause bugs, nil parents, or memory leaks',
      color: 'from-amber-500 to-rose-600',
    },
    {
      id: 'optimize',
      label: 'Optimize',
      icon: Zap,
      placeholder: 'Optimization goals (e.g. "Reduce garbage collection, cache globals, speed up hot loop")...',
      desc: 'Refactor for peak speed and minimal FPS drops',
      color: 'from-emerald-500 to-amber-500',
    },
    {
      id: 'convert',
      label: 'Convert',
      icon: RefreshCw,
      placeholder: 'Conversion notes (e.g. "Convert this Studio script into a self-contained executor script with getgenv cleanup")...',
      desc: 'Convert Studio or general Lua scripts to self-contained Executor code',
      color: 'from-violet-500 to-pink-500',
    },
    {
      id: 'explain',
      label: 'Explain',
      icon: HelpCircle,
      placeholder: 'Ask questions about executor APIs, Drawing library, or script architecture...',
      desc: 'Line-by-line breakdown and executor security insights',
      color: 'from-sky-500 to-violet-500',
    },
  ];

  const currentActionObj = actions.find((a) => a.id === currentAction) || actions[0];

  const quickPills: Record<LuaTarget, string[]> = {
    executor: [
      'Universal Draggable Executor GUI (Pure Luau)',
      'Rayfield UI Library Multi-Tab Dashboard',
      'In-Game Coordinate & CFrame Grabber (Hotkey)',
      'FPS & Performance Booster (Low Detail Mode)',
      'Drawing API Distance Visualizer HUD',
      'Safe Re-execution & getgenv Cleanup Guard',
    ],
  };

  const handleActionClick = (actId: LuaAction) => {
    soundEffects.playModeSwitch(actId);
    setModeSwitchAnim(actId);
    setTimeout(() => setModeSwitchAnim(null), 600);
    onSelectAction(actId);
  };

  const handleSubmit = () => {
    if (!prompt.trim() && !existingCode.trim()) return;
    
    // Trigger epic burst animation & warp sound
    setIsBursting(true);
    soundEffects.playLaunchWarp();
    setTimeout(() => setIsBursting(false), 800);

    const p = prompt;
    const c = existingCode;
    setPrompt('');
    onSubmit(p, c);
  };

  const handleClearCode = () => {
    soundEffects.playClick();
    setExistingCode('');
    setShowCodeInput(false);
    if (onClearPresetCode) onClearPresetCode();
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setExistingCode(text);
          setShowCodeInput(true);
          soundEffects.playSuccess();
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className={`rounded-2xl border bg-[#0c0912]/95 backdrop-blur-md p-3.5 sm:p-4 shadow-2xl space-y-3 transition-all duration-300 relative overflow-hidden ${
      isBursting ? 'border-rose-400 ring-2 ring-rose-500/50 shadow-rose-500/30 scale-[1.008]' : 'border-rose-950/60'
    }`}>
      {/* Top Laser Scanner Sweep */}
      {isGenerating && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-laser rounded-t-2xl shadow-lg shadow-rose-500/50" />
      )}

      {/* Mode Switch Radiant Rainbow Burst Animation */}
      {modeSwitchAnim && (
        <div className="absolute inset-0 pointer-events-none z-30 rainbow-click-flash rounded-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-500/15 via-amber-500/20 via-emerald-500/20 via-cyan-500/20 to-violet-500/15" />
          <div className="absolute top-0 left-0 right-0 h-1 rainbow-gradient-bar shadow-md shadow-amber-400/50" />
          <div className="absolute bottom-0 left-0 right-0 h-1 rainbow-gradient-bar shadow-md shadow-cyan-400/50" />
        </div>
      )}

      {/* Mode Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 pb-2 border-b border-rose-950/50">
        <div className="flex flex-wrap items-center gap-1">
          {actions.map((act) => {
            const Icon = act.icon;
            const isActive = currentAction === act.id;
            return (
              <button
                key={act.id}
                onClick={() => handleActionClick(act.id)}
                className={`relative px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer transform active:scale-95 hover:scale-[1.03] overflow-hidden ${
                  isActive
                    ? 'text-white font-semibold shadow-md shadow-rose-950/60 rainbow-btn-active'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                {isActive && (
                  <>
                    <span className="absolute inset-0 rounded-lg bg-[#140d1e]/95" />
                    <span className="absolute bottom-0 left-1 right-1 h-0.5 rainbow-gradient-bar rounded-full" />
                  </>
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-300 animate-pulse' : ''}`} />
                  <span>{act.label}</span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Quick Utilities in Console Header */}
        <div className="flex items-center gap-1.5">
          {onOpenSecurityAudit && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenSecurityAudit();
              }}
              className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-emerald-950/30 border border-transparent hover:border-emerald-800/40 transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
              title="Audit script for anti-cheat detection risks"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Audit</span>
            </button>
          )}

          {onOpenObfuscator && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenObfuscator();
              }}
              className="px-2 py-1 text-xs rounded-lg text-slate-400 hover:text-amber-300 hover:bg-amber-950/30 border border-transparent hover:border-amber-800/40 transition-all flex items-center gap-1 cursor-pointer hover:scale-105 active:scale-95"
              title="Minify script or generate universal loadstring"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Minify</span>
            </button>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".lua,.txt"
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-1 text-slate-400 hover:text-rose-300 hover:bg-slate-900/60 rounded-lg transition-all hover:scale-110 active:scale-90 cursor-pointer"
            title="Upload .lua or .txt file"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              setShowCodeInput(!showCodeInput);
            }}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer hover:scale-[1.03] active:scale-95 ${
              showCodeInput
                ? 'bg-slate-800 text-slate-200 border border-slate-700'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
            }`}
          >
            <Code2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">
              {existingCode ? `${existingCode.split('\n').length} lines code` : 'Attach Code'}
            </span>
            {showCodeInput ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {/* Code Input Drawer */}
      {showCodeInput && (
        <div className="relative rounded-xl border border-rose-950/60 bg-[#07050a] overflow-hidden animate-code-reveal">
          <div className="px-3 py-1.5 bg-[#120d1a] border-b border-rose-950/50 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Reference / Existing Lua Code</span>
            <div className="flex items-center gap-2">
              <span>{existingCode ? `${existingCode.split('\n').length} lines` : 'Empty'}</span>
              {existingCode && (
                <button
                  onClick={handleClearCode}
                  className="text-slate-500 hover:text-rose-400 cursor-pointer p-0.5 hover:scale-110 active:scale-90 transition-transform"
                  title="Remove attached code"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <textarea
            value={existingCode}
            onChange={(e) => setExistingCode(e.target.value)}
            placeholder="-- Paste Lua or other source code here to debug, optimize, or reference..."
            rows={5}
            spellCheck={false}
            className="w-full p-3 font-mono text-xs text-slate-200 bg-transparent resize-y focus:outline-none focus:ring-1 focus:ring-rose-500/30 selection:bg-rose-500/30"
          />
        </div>
      )}

      {/* Main Prompt Input Area */}
      <div className="relative rounded-xl border border-rose-950/60 bg-[#0e0914] focus-within:border-rose-500/60 focus-within:ring-1 focus-within:ring-rose-500/30 transition-all duration-300 overflow-hidden">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder={currentActionObj.placeholder}
          rows={2}
          className="w-full p-3 text-xs text-slate-100 placeholder-slate-500 bg-transparent resize-none focus:outline-none leading-relaxed"
        />

        {/* Bottom Toolbar inside input */}
        <div className="flex items-center justify-between px-3 py-2 bg-[#09060e] border-t border-rose-950/40">
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span className="hidden sm:inline font-mono">Ctrl + Enter to run</span>
            <span className="hidden sm:inline text-slate-700">•</span>
            <span className="text-rose-400/90 font-mono">Executor (UNC) Mode</span>
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Full Script Mode
            </span>
          </div>

          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                onClick={() => {
                  soundEffects.playError();
                  onCancel();
                }}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <StopCircle className="w-3.5 h-3.5" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!prompt.trim() && !existingCode.trim()}
                className={`relative px-4 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-md shadow-rose-600/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 active:scale-95 hover:scale-[1.02] flex items-center gap-1.5 cursor-pointer font-mono group overflow-hidden ${
                  isBursting ? 'scale-105 ring-2 ring-white/60 shadow-rose-500/50' : ''
                }`}
              >
                {/* Button sweep sheen */}
                <div className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
                <Send className={`w-3.5 h-3.5 ${isBursting ? 'animate-spin' : 'group-hover:translate-x-0.5 transition-transform'}`} />
                <span>Run Scripty AI</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Suggestion Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider mr-1">Suggestions:</span>
        {quickPills[currentTarget]?.map((pill, idx) => (
          <button
            key={idx}
            onClick={() => {
              soundEffects.playClick();
              setPrompt(pill);
              if (textareaRef.current) {
                textareaRef.current.focus();
              }
            }}
            className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#110c18] hover:bg-[#1a1224] hover:text-rose-300 text-slate-400 border border-rose-950/50 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer"
          >
            {pill}
          </button>
        ))}
      </div>
    </div>
  );
}
