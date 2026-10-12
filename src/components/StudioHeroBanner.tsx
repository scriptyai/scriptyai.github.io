import { useState } from 'react';
import { Sparkles, Terminal, ChevronDown, ChevronUp, Cpu, ShieldCheck, Zap, Play } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface StudioHeroBannerProps {
  onQuickPrompt: (prompt: string) => void;
  onOpenSandbox: () => void;
}

export function StudioHeroBanner({ onQuickPrompt, onOpenSandbox }: StudioHeroBannerProps) {
  // Collapsed by default so new visitors immediately see the chat & command deck above the fold!
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative rounded-2xl border border-rose-950/60 bg-[#0d0912]/90 backdrop-blur-md overflow-hidden shadow-2xl transition-all">
      {/* Top Banner Control Bar */}
      <div className="px-4 py-2.5 bg-[#09060e]/80 border-b border-rose-950/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-xs font-mono font-semibold text-slate-200">
            Mujtaba Scripty AI • Next-Gen Executor & Luau Studio
          </span>
          <span className="hidden sm:inline-block text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 border border-rose-500/25 font-mono">
            UNC v2.4 Verified
          </span>
        </div>

        <button
          onClick={() => {
            soundEffects.playClick();
            setIsExpanded(!isExpanded);
          }}
          className="text-xs text-rose-400 hover:text-rose-200 flex items-center gap-1 cursor-pointer transition-colors font-medium"
        >
          <span>{isExpanded ? 'Hide Showcase' : 'Show Studio Preview'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center border-t border-rose-950/40">
          {/* Left Hero Overview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Architected for Synapse, Wave, Krnl, Delta & Codex</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Elite Executor Scripting <br />
              <span className="bg-gradient-to-r from-rose-400 via-amber-300 to-violet-300 bg-clip-text text-transparent">
                Engine & UNC Sandbox
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-xl">
              Write, debug, and optimize self-contained Roblox Luau executor scripts with built-in getgenv singleton cleanup guards, CoreGui/gethui safe parenting, Drawing API overlays, and draggable pure-Luau interfaces.
            </p>

            {/* Quick Feature Grid Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 font-mono text-[11px]">
              <div className="p-2 rounded-lg bg-[#110c18] border border-rose-900/30 text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Singleton getgenv</span>
              </div>
              <div className="p-2 rounded-lg bg-[#110c18] border border-rose-900/30 text-slate-300 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Zero-Asset GUIs</span>
              </div>
              <div className="p-2 rounded-lg bg-[#110c18] border border-rose-900/30 text-slate-300 flex items-center gap-2">
                <Cpu className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>UNC Drawing.new</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              <button
                onClick={() => {
                  soundEffects.playGenerate();
                  onQuickPrompt("Write a complete, self-contained draggable Executor GUI in Roblox Lua with toggle buttons, speed slider, and close button, safely parented to (gethui and gethui()) or CoreGui with getgenv re-execution cleanup.");
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Terminal className="w-3.5 h-3.5" />
                <span>Generate Draggable Hub</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  onOpenSandbox();
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400 fill-current" />
                <span>Launch Lua 5.3 VM</span>
              </button>
            </div>
          </div>

          {/* Right Hero Artwork Showcase */}
          <div className="lg:col-span-5 relative group">
            <div className="relative rounded-xl overflow-hidden border border-rose-500/40 shadow-2xl bg-slate-950">
              <img
                src="/preview.jpg"
                alt="Mujtaba Scripty AI Studio Workstation"
                referrerPolicy="no-referrer"
                className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d0912] via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-rose-300 bg-slate-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-rose-500/30">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Mujtaba AI Engine Online
                </span>
                <span className="text-slate-400">Neural Engine v2.4</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
