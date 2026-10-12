import { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Eye, Shield, Cpu, RefreshCw, Sparkles, Check } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

export interface StudioSettings {
  enableAudio: boolean;
  enableScanlines: boolean;
  enableGlowEffects: boolean;
  autoFormatCode: boolean;
  enforceCleanupGuards: boolean;
  strictLuauTyping: boolean;
  executorProfile: 'universal' | 'synapse' | 'wave' | 'krnl' | 'delta_mobile';
  accentTheme: 'cyan' | 'purple' | 'emerald' | 'amber';
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StudioSettings;
  onUpdateSettings: (newSettings: StudioSettings) => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  const toggle = (key: keyof StudioSettings) => {
    soundEffects.playClick();
    const updated = { ...settings, [key]: !settings[key] };
    if (key === 'enableAudio') {
      soundEffects.enabled = Boolean(updated.enableAudio);
    }
    onUpdateSettings(updated);
  };

  const setOption = <K extends keyof StudioSettings>(key: K, value: StudioSettings[K]) => {
    soundEffects.playClick();
    onUpdateSettings({ ...settings, [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090d18] border border-slate-800 rounded-2xl w-full max-w-xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Studio & Executor Settings</h2>
              <p className="text-xs text-slate-400">Customize visual appearance, executor target profile, and AI generation rules</p>
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

        {/* Settings Body */}
        <div className="p-5 overflow-y-auto space-y-5 max-h-[75vh]">
          {/* Target Executor Profile */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              Target Executor Optimization Profile
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'universal', label: 'Universal UNC (All Executors)', desc: 'Synapse, Wave, Krnl, Fluxus, Delta' },
                { id: 'wave', label: 'Wave / Electron Level 8', desc: 'Modern PC executor bytecode hooks' },
                { id: 'delta_mobile', label: 'Delta / Codex (Mobile / Android)', desc: 'Touch controls & mobile screen scaling' },
                { id: 'synapse', label: 'Synapse X / V3 Standard', desc: 'Synapse-native API backward compatibility' },
              ].map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setOption('executorProfile', prof.id as any)}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    settings.executorProfile === prof.id
                      ? 'bg-cyan-500/15 border-cyan-500/40 text-cyan-200'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-semibold flex items-center justify-between">
                    <span>{prof.label}</span>
                    {settings.executorProfile === prof.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{prof.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Visual & Audio Options */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              Visuals & Sensory Feedback
            </label>

            {/* Futuristic Sound Effects */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200 flex items-center gap-2">
                  {settings.enableAudio ? <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> : <VolumeX className="w-3.5 h-3.5 text-slate-500" />}
                  <span>Web Audio Synthesizer Feedback</span>
                </div>
                <div className="text-[11px] text-slate-400">Plays subtle cybernetic audio feedback on clicks, code generation, and execution</div>
              </div>
              <button
                onClick={() => toggle('enableAudio')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.enableAudio ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enableAudio ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Cyber Scanlines Overlay */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200">CRT Monitor Scanline Overlay</div>
                <div className="text-[11px] text-slate-400">Adds an atmospheric retro-futuristic CRT scanline filter to the interface</div>
              </div>
              <button
                onClick={() => toggle('enableScanlines')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.enableScanlines ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enableScanlines ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Glowing Aura & Grid */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200">Neon Ambient Glow & Animated Grid</div>
                <div className="text-[11px] text-slate-400">Displays animated holographic cyber grid and radial gradient pulses</div>
              </div>
              <button
                onClick={() => toggle('enableGlowEffects')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.enableGlowEffects ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enableGlowEffects ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Script Generation Guard Rules */}
          <div className="space-y-3 pt-2 border-t border-slate-800/80">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              Code Generation Rules
            </label>

            {/* Enforce getgenv Cleanup */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200">Auto-inject getgenv() Cleanup Guards</div>
                <div className="text-[11px] text-slate-400">Prevents memory leaks and duplicate UI frames upon script re-execution</div>
              </div>
              <button
                onClick={() => toggle('enforceCleanupGuards')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.enforceCleanupGuards ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.enforceCleanupGuards ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Strict Luau Typing */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <div className="space-y-0.5">
                <div className="text-xs font-medium text-slate-200">Strict Luau (--!strict) Mode</div>
                <div className="text-[11px] text-slate-400">Forces complete static type annotations on all generated Lua functions</div>
              </div>
              <button
                onClick={() => toggle('strictLuauTyping')}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  settings.strictLuauTyping ? 'bg-cyan-500' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.strictLuauTyping ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <button
            onClick={() => {
              soundEffects.playClick();
              onUpdateSettings({
                enableAudio: true,
                enableScanlines: false,
                enableGlowEffects: true,
                autoFormatCode: true,
                enforceCleanupGuards: true,
                strictLuauTyping: true,
                executorProfile: 'universal',
                accentTheme: 'cyan',
              });
            }}
            className="text-xs text-slate-400 hover:text-slate-200 underline cursor-pointer"
          >
            Reset Defaults
          </button>
          <button
            onClick={() => {
              soundEffects.playSuccess();
              onClose();
            }}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white shadow-md transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
