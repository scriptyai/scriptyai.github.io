import { useState, useMemo } from 'react';
import { X, ShieldCheck, AlertTriangle, CheckCircle, Bug, Zap, ArrowRight, Terminal } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface SecurityAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCode: string;
  onAutoFix: (auditPrompt: string, code: string) => void;
}

interface AuditIssue {
  severity: 'high' | 'medium' | 'low' | 'good';
  title: string;
  description: string;
  recommendation: string;
}

export function SecurityAnalyzerModal({
  isOpen,
  onClose,
  sourceCode,
  onAutoFix,
}: SecurityAnalyzerModalProps) {
  if (!isOpen) return null;

  const analysis = useMemo(() => {
    const code = sourceCode || '';
    const issues: AuditIssue[] = [];
    let score = 100;

    // Check 1: Direct CoreGui parenting without gethui
    if (code.includes('game:GetService("CoreGui")') && !code.includes('gethui')) {
      issues.push({
        severity: 'high',
        title: 'CoreGui Detection Risk',
        description: 'Directly parenting to CoreGui is detected by modern anti-cheats (like Adonis / Byfron).',
        recommendation: 'Use (gethui and gethui()) with fallback to CoreGui.',
      });
      score -= 25;
    }

    // Check 2: Unsafe while true loops without task.wait
    if (/while\s+true\s+do(?!\s*task\.wait)/g.test(code) && !code.includes('task.wait') && !code.includes('wait(')) {
      issues.push({
        severity: 'high',
        title: 'Crash Risk: Infinite Loop without wait()',
        description: 'Tight loops without a frame yield freeze and crash the Roblox client instantly.',
        recommendation: 'Ensure task.wait() is called on every iteration.',
      });
      score -= 30;
    }

    // Check 3: Missing getgenv re-execution cleanup
    if (!code.includes('getgenv') && (code.includes('ScreenGui') || code.includes('RenderStepped'))) {
      issues.push({
        severity: 'medium',
        title: 'Missing getgenv() Cleanup Guard',
        description: 'Executing this script multiple times might duplicate GUI windows or leak frame connections.',
        recommendation: 'Store a cleanup callback inside getgenv().MyScript_Cleanup.',
      });
      score -= 15;
    }

    // Check 4: Unprotected HTTP request
    if (code.includes('request(') && !code.includes('pcall')) {
      issues.push({
        severity: 'low',
        title: 'Unshielded HTTP Request',
        description: 'HTTP requests can fail or timeout if the target server is down.',
        recommendation: 'Wrap external request() calls in pcall() to prevent script interruption.',
      });
      score -= 10;
    }

    // Check 5: Deprecated legacy Draggable = true
    if (code.includes('.Draggable = true') || (code.includes('.Draggable') && !code.includes('UserInputService'))) {
      issues.push({
        severity: 'high',
        title: 'Deprecated Draggable = true Detected',
        description: 'Using legacy Frame.Draggable = true is deprecated and broken on modern executor runtimes.',
        recommendation: 'Replace with the modern UserInputService drag tracking framework using InputBegan & InputChanged.',
      });
      score -= 20;
    }

    // Positive check: Good UNC practices
    if (code.includes('gethui')) {
      issues.push({
        severity: 'good',
        title: 'Safe UI Parenting Detected',
        description: 'Script utilizes gethui() for hidden CoreGui placement.',
        recommendation: 'Excellent anti-cheat evasion practice.',
      });
    }

    if (code.includes('Drawing.new')) {
      issues.push({
        severity: 'good',
        title: 'Hardware-Accelerated 2D Drawing',
        description: 'Script renders visual overlays without creating GuiObject instances in DataModel.',
        recommendation: 'Peak performance and zero instance scan footprint.',
      });
    }

    // Detected UNC APIs
    const detectedApis: string[] = [];
    ['getgenv', 'getrenv', 'gethui', 'identifyexecutor', 'Drawing', 'request', 'writefile', 'readfile', 'hookfunction', 'firesignal'].forEach((api) => {
      if (code.includes(api)) {
        detectedApis.push(api);
      }
    });

    return {
      score: Math.max(20, Math.min(100, score)),
      issues,
      detectedApis,
    };
  }, [sourceCode]);

  const handleFixWithAI = () => {
    soundEffects.playGenerate();
    const prompt = `Perform a comprehensive security & crash audit on this Executor script:
1. Fix any CoreGui parenting risks by using (gethui and gethui()) or CoreGui fallback.
2. Inject a singleton getgenv() re-execution cleanup guard to disconnect previous threads and destroy old UIs.
3. Replace any legacy 'Draggable = true' / 'Active = true' with the modern UserInputService drag tracking engine connected to 'connections'.
4. Verify all loops have task.wait() frame yields and wrap remote/HTTP calls in pcall.`;
    onAutoFix(prompt, sourceCode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e0914] border border-rose-950/70 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-950/60 flex items-center justify-between bg-[#08050c]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>UNC Security & Anti-Detection Audit</span>
              </h2>
              <p className="text-xs text-slate-400">
                Automated detection scan, memory leak check, and stability analysis
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

        {/* Score & Metrics Bar */}
        <div className="p-4 bg-[#0a0710] border-b border-rose-950/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${
                analysis.score >= 80
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                  : analysis.score >= 60
                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                  : 'bg-rose-500/15 text-rose-300 border-rose-500/40'
              }`}
            >
              {analysis.score}
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-200">
                {analysis.score >= 80
                  ? 'Strong Stability & UNC Compliance'
                  : analysis.score >= 60
                  ? 'Moderate - Potential Detection / Leak Risks'
                  : 'Action Needed - High Risk Issues Detected'}
              </div>
              <div className="text-[11px] text-slate-400">
                {analysis.detectedApis.length} UNC APIs detected • {analysis.issues.length} audit rules evaluated
              </div>
            </div>
          </div>

          {sourceCode && (
            <button
              onClick={handleFixWithAI}
              className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Auto-Fix with AI</span>
            </button>
          )}
        </div>

        {/* Issues List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {analysis.issues.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <CheckCircle className="w-10 h-10 text-emerald-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-200">No Vulnerabilities Detected</p>
              <p className="text-xs text-slate-400">Your script follows recommended executor best practices.</p>
            </div>
          ) : (
            analysis.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border space-y-1.5 ${
                  issue.severity === 'high'
                    ? 'bg-rose-950/30 border-rose-800/50'
                    : issue.severity === 'medium'
                    ? 'bg-amber-950/30 border-amber-800/50'
                    : issue.severity === 'good'
                    ? 'bg-emerald-950/20 border-emerald-800/40'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {issue.severity === 'good' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 ${
                          issue.severity === 'high'
                            ? 'text-rose-400'
                            : issue.severity === 'medium'
                            ? 'text-amber-400'
                            : 'text-slate-400'
                        }`}
                      />
                    )}
                    <span className="text-xs font-semibold text-slate-200">{issue.title}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded ${
                      issue.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-300'
                        : issue.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-300'
                        : issue.severity === 'good'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {issue.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 pl-6 leading-relaxed">{issue.description}</p>
                <div className="text-[11px] text-slate-400 pl-6 font-mono">
                  💡 Recommendation: {issue.recommendation}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
