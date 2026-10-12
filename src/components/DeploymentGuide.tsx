import { X, Layers, ShieldCheck, Terminal, Lightbulb, BookOpen } from 'lucide-react';
import { LuaTarget } from '../types';

interface DeploymentGuideProps {
  target: LuaTarget;
  isOpen: boolean;
  onClose: () => void;
}

export function DeploymentGuide({ target, isOpen, onClose }: DeploymentGuideProps) {
  if (!isOpen) return null;

  const guideContent: Record<
    LuaTarget,
    {
      title: string;
      hierarchy: { place: string; type: string; purpose: string }[];
      tips: string[];
      securityNote: string;
    }
  > = {
    executor: {
      title: 'External Executor & UNC Script Architecture',
      hierarchy: [
        {
          place: 'Execution Context',
          type: 'Injected Client Runtime (Level 7/8)',
          purpose: 'Runs in client memory via Synapse, Wave, Krnl, Delta, Fluxus, or UNC executors. Does not require Roblox Studio or server access.',
        },
        {
          place: 'Safe UI Container',
          type: 'gethui() / CoreGui / PlayerGui',
          purpose: 'Parent your ScreenGui to gethui() or CoreGui to prevent game scripts or anti-cheats from detecting or modifying your UI.',
        },
        {
          place: 'Global State (getgenv)',
          type: 'Global Environment Table',
          purpose: 'Store persistent states, toggle booleans, and cleanup callbacks across multiple executions of your script.',
        },
        {
          place: 'Drawing API Overlay',
          type: 'UNC Drawing.new Canvas',
          purpose: 'Directly render 2D bounding boxes, tracers, and text labels on screen with high FPS using RenderStepped loops.',
        },
      ],
      tips: [
        'Always write a re-execution cleanup guard (getgenv().MyScript_Cleanup) to disconnect old loops and destroy previous GUIs.',
        'Never assume script.Parent exists—always use game:GetService("Players").LocalPlayer directly.',
        'Use pcall() around executor-specific UNC functions (setclipboard, identifyexecutor, request) for universal compatibility.',
        'Use loadstring(game:HttpGet(...))() to distribute updates to users automatically without re-pasting.',
      ],
      securityNote: 'Always wrap remote invocations or raw UI manipulations in pcall to prevent unhandled script crashes if instances are renamed or deleted by game updates.',
    },
  };

  const current = guideContent[target];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-cyan-400" />
              {current.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Target-specific file placement rules, Explorer hierarchy, and performance practices
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* File Placement Hierarchy */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" />
              Directory & File Placement
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {current.hierarchy.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-cyan-300 font-semibold text-xs">{item.place}</span>
                    <span className="text-[10px] px-1.5 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                      {item.type}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{item.purpose}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Directives */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              Best Practices & Performance
            </h3>
            <ul className="space-y-1.5 text-slate-400 text-xs list-disc list-inside bg-slate-950/50 p-3 rounded-xl border border-slate-800/80">
              {current.tips.map((tip, idx) => (
                <li key={idx} className="leading-relaxed">
                  {tip}
                </li>
              ))}
            </ul>
          </div>

          {/* Security Note */}
          <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-800/50 flex items-start gap-2.5 text-indigo-300 text-xs">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-indigo-400" />
            <div>
              <span className="font-semibold text-indigo-200">Anti-Exploit Security Note: </span>
              {current.securityNote}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
