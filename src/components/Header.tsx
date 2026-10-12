import { Terminal, BookOpen, Play, Trash2, HelpCircle, Settings, Bookmark, Zap, Palette, Sliders, GitCompare, Github } from 'lucide-react';
import { LuaTarget } from '../types';
import { soundEffects } from '../utils/audioEffects';

interface HeaderProps {
  currentTarget: LuaTarget;
  onSelectTarget: (t: LuaTarget) => void;
  onOpenTemplates: () => void;
  onOpenSandbox: () => void;
  onOpenDocs: () => void;
  onOpenUncDocs: () => void;
  onOpenSavedScripts: () => void;
  onOpenSettings: () => void;
  onOpenGitHubDeploy?: () => void;
  onReplayBoot: () => void;
  onClearChat: () => void;
  hasApiKey: boolean;
  messageCount: number;
  savedCount: number;
  currentTheme?: 'crimson' | 'emerald' | 'sunset' | 'silver';
  onCycleTheme?: () => void;
  onOpenGuiBuilder?: () => void;
  onOpenDiffViewer?: () => void;
}

export function Header({
  currentTarget,
  onOpenTemplates,
  onOpenSandbox,
  onOpenDocs,
  onOpenUncDocs,
  onOpenSavedScripts,
  onOpenSettings,
  onOpenGitHubDeploy,
  onReplayBoot,
  onClearChat,
  hasApiKey,
  messageCount,
  savedCount,
  currentTheme = 'crimson',
  onCycleTheme,
  onOpenGuiBuilder,
  onOpenDiffViewer,
}: HeaderProps) {
  const themeLabels = {
    crimson: { name: 'Crimson Protocol', badge: 'bg-rose-500/10 text-rose-300 border-rose-500/25', iconColor: 'text-rose-400' },
    emerald: { name: 'Emerald Matrix', badge: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25', iconColor: 'text-emerald-400' },
    sunset: { name: 'Cyber Sunset', badge: 'bg-orange-500/10 text-orange-300 border-orange-500/25', iconColor: 'text-orange-400' },
    silver: { name: 'Onyx Platinum', badge: 'bg-slate-500/10 text-slate-300 border-slate-500/25', iconColor: 'text-slate-200' },
  }[currentTheme];

  return (
    <header className="border-b border-slate-800/80 bg-[#07060a]/90 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-8 py-2.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative group cursor-pointer" onClick={onReplayBoot} title="Replay system boot sequence">
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-rose-500 via-amber-500 to-violet-600 opacity-80 blur-xs group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative w-9 h-9 rounded-xl bg-[#0e0a12] border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg">
                <Terminal className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-base tracking-tight flex items-center gap-1.5 group cursor-pointer" onClick={onReplayBoot}>
                  <span className="brand-holo-text font-extrabold">Mujtaba Scripty AI</span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${themeLabels.badge} transition-transform group-hover:scale-105`}>
                    {themeLabels.name}
                  </span>
                </h1>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Roblox Luau & UNC Executor Engine</span>
                <span className="inline-block w-1 h-1 rounded-full bg-slate-600"></span>
                <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald-400 font-medium">
                  {/* Realtime 4-bar neural equalizer animation */}
                  <div className="flex items-end gap-0.5 h-3" title="Neural Core Active">
                    <span className="w-0.5 bg-rose-400 rounded-full animate-eq-1" />
                    <span className="w-0.5 bg-amber-400 rounded-full animate-eq-2" />
                    <span className="w-0.5 bg-emerald-400 rounded-full animate-eq-3" />
                    <span className="w-0.5 bg-cyan-400 rounded-full animate-eq-4" />
                  </div>
                  <span>AI Online</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar Buttons */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-1.5 sm:gap-2">
          {/* Theme Quick Switcher */}
          {onCycleTheme && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onCycleTheme();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Cycle color theme"
            >
              <Palette className={`w-3.5 h-3.5 ${themeLabels.iconColor}`} />
              <span className="hidden sm:inline">Theme</span>
            </button>
          )}

          {/* Visual GUI Builder */}
          {onOpenGuiBuilder && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenGuiBuilder();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-600/15 hover:bg-rose-600/25 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              title="Visual Luau Draggable GUI Builder"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-400" />
              <span>GUI Builder</span>
            </button>
          )}

          {/* UNC Reference Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenUncDocs();
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="UNC (Unified Naming Convention) Functions cheat sheet"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>UNC Reference</span>
          </button>

          {/* Presets Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenTemplates();
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Browse production-ready executor script presets"
          >
            <BookOpen className="w-3.5 h-3.5 text-rose-400" />
            <span>Presets</span>
          </button>

          {/* Interactive Lua 5.3 Sandbox */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSandbox();
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            title="Open in-browser Lua 5.3 VM Sandbox"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>Lua VM</span>
          </button>

          {/* Saved Stash */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSavedScripts();
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors flex items-center gap-1.5 cursor-pointer relative"
            title="View saved scripts stash"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>My Stash</span>
            {savedCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {savedCount}
              </span>
            )}
          </button>

          {/* Code Diff Tool */}
          {onOpenDiffViewer && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenDiffViewer();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Compare Code Versions (Diff)"
            >
              <GitCompare className="w-4 h-4" />
            </button>
          )}

          {/* GitHub Pages Deploy */}
          {onOpenGitHubDeploy && (
            <button
              onClick={() => {
                soundEffects.playClick();
                onOpenGitHubDeploy();
              }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-rose-600/25 to-violet-600/25 hover:from-rose-600/40 hover:to-violet-600/40 text-rose-300 border border-rose-500/40 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm shadow-rose-900/20"
              title="Deploy to GitHub.com & github.io (White Screen Fix)"
            >
              <Github className="w-3.5 h-3.5 text-rose-400" />
              <span className="hidden sm:inline">Deploy github.io</span>
              <span className="sm:hidden">Deploy</span>
            </button>
          )}

          {/* Deployment Guide */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenDocs();
            }}
            className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors flex items-center gap-1 cursor-pointer"
            title="Architecture & deployment guide"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSettings();
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
            title="Studio Settings"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Clear Chat */}
          {messageCount > 0 && (
            <button
              onClick={() => {
                soundEffects.playError();
                onClearChat();
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-800/40 transition-colors cursor-pointer"
              title="Clear conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
