import { useState, useEffect } from 'react';
import { Terminal, Shield, Cpu, Sparkles, CheckCircle2, ChevronRight, Zap, Activity } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface BootLoadingScreenProps {
  onComplete: () => void;
}

interface BootStep {
  tag: string;
  text: string;
  detail: string;
  delay: number;
}

const BOOT_STEPS: BootStep[] = [
  {
    tag: 'SYS_INIT',
    text: 'Mounting Unified Naming Convention (UNC) Runtime Environment...',
    detail: 'API spec v2.4 • Metatable sandbox configured',
    delay: 200,
  },
  {
    tag: 'VM_LUAU',
    text: 'Synthesizing Lua 5.3 Virtual Machine & Luau Bytecode Shims...',
    detail: 'Memory manager active • 64-bit opcode translator ready',
    delay: 480,
  },
  {
    tag: 'SEC_GUARD',
    text: 'Verifying Singleton getgenv() Re-Execution & Anti-Leak Guards...',
    detail: 'Thread isolation validated • Zero orphan connections',
    delay: 780,
  },
  {
    tag: 'DRAW_2D',
    text: 'Initializing Hardware-Accelerated UNC Drawing API Pipeline...',
    detail: 'RenderStepped hook established • Zero DataModel footprint',
    delay: 1080,
  },
  {
    tag: 'NEURAL_CORE',
    text: 'Binding Mujtaba Scripty AI Neural Code Generation Engine...',
    detail: 'Model parameters synchronized • Studio online',
    delay: 1380,
  },
];

export function BootLoadingScreen({ onComplete }: BootLoadingScreenProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState(12);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Keyboard listener for Space or Escape to skip immediately
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    const timers: NodeJS.Timeout[] = [];

    BOOT_STEPS.forEach((step, idx) => {
      const timer = setTimeout(() => {
        setCurrentStepIndex(idx);
        setProgress(Math.round(((idx + 1) / BOOT_STEPS.length) * 100));
        soundEffects.playClick();
      }, step.delay);
      timers.push(timer);
    });

    const completionTimer = setTimeout(() => {
      soundEffects.playSuccess();
      setIsFadingOut(true);
      setTimeout(() => {
        onComplete();
      }, 450);
    }, 1850);

    timers.push(completionTimer);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      timers.forEach((t) => clearTimeout(t));
    };
  }, [onComplete]);

  const handleSkip = () => {
    soundEffects.playClick();
    setIsFadingOut(true);
    setTimeout(() => {
      onComplete();
    }, 180);
  };

  return (
    <div
      className={`fixed inset-0 z-50 bg-[#060309] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 transition-all duration-500 selection:bg-rose-500/30 overflow-hidden ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Dynamic Background Matrix with Warm Amber/Rose Atmospheric Glows */}
      <div className="absolute inset-0 cyber-grid-bg opacity-40 pointer-events-none" />
      <div className="absolute inset-0 scanlines-overlay opacity-30 pointer-events-none" />

      {/* Luminous Atmospheric Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-rose-600/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-amber-500/20 blur-3xl pointer-events-none animate-pulse" style={{ animationDelay: '1.5s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-gradient-to-tr from-rose-500/10 via-amber-500/10 to-violet-600/10 blur-[90px] pointer-events-none" />

      <div className="relative w-full max-w-xl space-y-6 text-center z-10">
        {/* Futuristic Orbital Cyber Reactor */}
        <div className="relative mx-auto w-28 h-28 flex items-center justify-center">
          {/* Outer Clockwise Orbital Ring with Glowing Dashes */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-amber-500/40 animate-orbit-cw pointer-events-none" />

          {/* Inner Counter-Clockwise Orbital Ring with Dotted Accents */}
          <div className="absolute inset-2 rounded-full border border-dotted border-rose-500/60 animate-orbit-ccw pointer-events-none" />

          {/* Glowing Radial Core Aura */}
          <div className="absolute inset-3 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-violet-600 blur-md opacity-75 animate-core-pulsar" />

          {/* Central Shielded Core */}
          <div className="relative w-18 h-18 rounded-2xl bg-[#0e0716] border border-rose-500/60 flex flex-col items-center justify-center shadow-2xl shadow-rose-950/80">
            <Terminal className="w-8 h-8 text-rose-400 drop-shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
            <div className="flex items-center gap-0.5 mt-1">
              <span className="w-1 h-1 rounded-full bg-rose-400 animate-ping" />
              <span className="w-1 h-1 rounded-full bg-amber-400 animate-ping" style={{ animationDelay: '0.2s' }} />
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
        </div>

        {/* Title & Brand Header */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-950/80 via-amber-950/60 to-rose-950/80 border border-rose-500/40 text-rose-300 text-xs font-mono shadow-lg shadow-rose-950/50">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="font-semibold tracking-wider">MUJTABA SCRIPTY AI</span>
            <span className="text-slate-500">•</span>
            <span className="text-amber-300 font-bold">NEURAL v2.4</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="brand-holo-text">System Boot & UNC Link</span>
          </h1>

          <p className="text-xs text-slate-400 font-mono flex items-center justify-center gap-2">
            <span>High-Performance Roblox Luau Architecture</span>
            <span className="inline-block w-1 h-1 rounded-full bg-slate-600" />
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              UNC Sandbox Ready
            </span>
          </p>
        </div>

        {/* Console Boot Logs Window with Glowing Edge */}
        <div className="rounded-2xl border border-rose-950/80 bg-[#0d0716]/95 backdrop-blur-xl p-4 sm:p-5 text-left font-mono text-xs space-y-3 shadow-2xl relative overflow-hidden">
          {/* Top Running Laser Sheen */}
          <div className="absolute top-0 left-0 right-0 h-0.5 rainbow-gradient-bar" />

          {/* Window Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-rose-950/60 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-slate-600">|</span>
              <span className="flex items-center gap-1.5 text-rose-300 font-semibold">
                <Cpu className="w-3.5 h-3.5 text-rose-400" />
                <span>KERNEL_INITIALIZATION</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Real-time 4-bar equalizer */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 bg-rose-400 rounded-full animate-eq-1" />
                <span className="w-0.5 bg-amber-400 rounded-full animate-eq-2" />
                <span className="w-0.5 bg-emerald-400 rounded-full animate-eq-3" />
                <span className="w-0.5 bg-cyan-400 rounded-full animate-eq-4" />
              </div>
              <span className="text-amber-300 font-bold font-mono">{progress}%</span>
            </div>
          </div>

          {/* Telemetry Step Rows */}
          <div className="space-y-2 min-h-[140px] pt-1">
            {BOOT_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => {
              const isLatest = idx === currentStepIndex;
              return (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-[11px] animate-telemetry-item transition-all"
                >
                  <CheckCircle2
                    className={`w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors ${
                      isLatest ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                    }`}
                  />
                  <div className="flex-1 space-y-0.5 leading-snug">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-1.5 py-0.2 rounded bg-rose-950/60 text-rose-300 text-[10px] font-mono border border-rose-900/40">
                        {step.tag}
                      </span>
                      <span
                        className={
                          isLatest
                            ? 'text-white font-semibold'
                            : 'text-slate-300'
                        }
                      >
                        {step.text}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 pl-0.5 font-mono">
                      ↳ {step.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Glowing Rainbow Progress Bar */}
          <div className="pt-2 space-y-1.5">
            <div className="w-full bg-[#08040d] rounded-full h-2 overflow-hidden border border-rose-950/80 p-0.5 shadow-inner">
              <div
                className="rainbow-gradient-bar h-full transition-all duration-300 rounded-full shadow-lg shadow-rose-500/50 relative"
                style={{ width: `${progress}%` }}
              >
                {/* Glowing Leading Head Light */}
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full blur-[1px] shadow-sm shadow-white" />
              </div>
            </div>

            {/* Diagnostic Metrics Under Bar */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono px-0.5">
              <span className="flex items-center gap-1 text-slate-400">
                <Activity className="w-3 h-3 text-rose-400" />
                <span>LINK: STABLE</span>
              </span>
              <span>UNC COMPLIANCE: 100%</span>
              <span className="text-amber-400/90">LATENCY: 14ms</span>
            </div>
          </div>
        </div>

        {/* Skip button with Hotkey badge */}
        <div className="pt-1 flex items-center justify-center">
          <button
            onClick={handleSkip}
            className="group px-4 py-1.5 rounded-full text-xs font-mono text-slate-400 hover:text-rose-200 bg-[#0e0717]/80 hover:bg-[#160c24] border border-rose-950/60 hover:border-rose-500/40 transition-all duration-200 cursor-pointer inline-flex items-center gap-2 shadow-lg hover:scale-105 active:scale-95"
          >
            <span>Skip Initialization</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 group-hover:border-rose-500/40 group-hover:text-rose-300">
              ESC
            </span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform text-rose-400" />
          </button>
        </div>
      </div>
    </div>
  );
}
