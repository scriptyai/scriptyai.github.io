import { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { PromptConsole } from './components/PromptConsole';
import { ConversationView } from './components/ConversationView';
import { DeploymentGuide } from './components/DeploymentGuide';
import { TemplateModal } from './components/TemplateModal';
import { SandboxModal } from './components/SandboxModal';
import { BootLoadingScreen } from './components/BootLoadingScreen';
import { StudioHeroBanner } from './components/StudioHeroBanner';
import { UncReferenceModal } from './components/UncReferenceModal';
import { SettingsModal, StudioSettings } from './components/SettingsModal';
import { SavedScriptsModal, SavedScriptItem } from './components/SavedScriptsModal';
import { CyberBackground } from './components/CyberBackground';
import { ObfuscatorModal } from './components/ObfuscatorModal';
import { SecurityAnalyzerModal } from './components/SecurityAnalyzerModal';
import { GuiBuilderModal } from './components/GuiBuilderModal';
import { DiffViewerModal } from './components/DiffViewerModal';
import { LuaAction, LuaTarget, ChatMessage, ScriptTemplate } from './types';
import { AlertCircle, RotateCcw, ArrowDown } from 'lucide-react';
import { generateClientSideFallback } from './utils/geminiFallback';
import { soundEffects } from './utils/audioEffects';

const DEFAULT_SETTINGS: StudioSettings = {
  enableAudio: false,
  enableScanlines: false,
  enableGlowEffects: true,
  autoFormatCode: true,
  enforceCleanupGuards: true,
  strictLuauTyping: true,
  executorProfile: 'universal',
  accentTheme: 'amber',
};

const INITIAL_WELCOME: ChatMessage = {
  id: 'msg-welcome-0',
  role: 'assistant',
  content: `👋 **Welcome to Mujtaba Scripty AI!** 

I am your dedicated **Roblox Luau & UNC (Unified Naming Convention)** executor systems architect. 

I can write, optimize, and debug 100% self-contained scripts for **Synapse, Wave, Krnl, Delta, Fluxus, Codex**, and any UNC executor.

**Quick Capabilities Ready to Build:**
- ⚡ **Universal Draggable GUIs** with pure Luau & smooth TweenService (zero external assets)
- 📍 **In-Game CFrame & Position Loggers** with instant clipboard hotkeys
- 🚀 **FPS Boosters** that maximize performance on low-end systems
- 🛡️ **Re-execution Singleton Cleanup Guards** using \`getgenv()\`
- 🎯 **Drawing API Overlays & Visualizers** with hardware-accelerated \`Drawing.new()\`

Select any preset below or type what you would like to create!`,
  timestamp: Date.now(),
  target: 'executor',
  action: 'generate',
};

export default function App() {
  const [currentTarget, setCurrentTarget] = useState<LuaTarget>('executor');
  const [currentAction, setCurrentAction] = useState<LuaAction>('generate');
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_WELCOME]);
  const [streamingText, setStreamingText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [presetCode, setPresetCode] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<'crimson' | 'emerald' | 'sunset' | 'silver'>('crimson');
  
  // Smart Autoscroll state to prevent aggressive scroll push-down when user is reading
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const isUserScrolledUpRef = useRef(false);

  // Modals
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [isUncModalOpen, setIsUncModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isObfuscatorOpen, setIsObfuscatorOpen] = useState(false);
  const [isSecurityAuditOpen, setIsSecurityAuditOpen] = useState(false);
  const [isGuiBuilderOpen, setIsGuiBuilderOpen] = useState(false);
  const [isDiffViewerOpen, setIsDiffViewerOpen] = useState(false);
  const [activeCodeForTool, setActiveCodeForTool] = useState<string>('');
  const [diffOriginal, setDiffOriginal] = useState<string>('');
  const [diffModified, setDiffModified] = useState<string>('');

  const handleOpenAudit = (code?: string) => {
    soundEffects.playClick();
    setActiveCodeForTool(code || presetCode);
    setIsSecurityAuditOpen(true);
  };

  const handleOpenObfuscator = (code?: string) => {
    soundEffects.playClick();
    setActiveCodeForTool(code || presetCode);
    setIsObfuscatorOpen(true);
  };

  const handleOpenGuiBuilder = () => {
    soundEffects.playClick();
    setIsGuiBuilderOpen(true);
  };

  const handleOpenDiff = (modifiedCode: string, originalCode?: string) => {
    soundEffects.playClick();
    setDiffOriginal(originalCode || presetCode || '-- Original script');
    setDiffModified(modifiedCode);
    setIsDiffViewerOpen(true);
  };

  const handleInsertSnippet = (code: string) => {
    setPresetCode(code);
    soundEffects.playSuccess();
  };

  // Boot Loading Screen
  const [showBootScreen, setShowBootScreen] = useState(true);

  // Settings & Saved Scripts
  const [settings, setSettings] = useState<StudioSettings>(() => {
    try {
      const stored = localStorage.getItem('scripty_settings');
      return stored ? JSON.parse(stored) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [savedScripts, setSavedScripts] = useState<SavedScriptItem[]>(() => {
    try {
      const stored = localStorage.getItem('scripty_saved_scripts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [hasApiKey, setHasApiKey] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastPrompt, setLastPrompt] = useState<{ prompt: string; code?: string } | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Sync sound effects configuration
  useEffect(() => {
    soundEffects.enabled = settings.enableAudio;
  }, [settings.enableAudio]);

  // Smart user scroll detection with hysteresis and user-interaction tracking
  const userIsScrollingRef = useRef(false);
  const userScrollTimeoutRef = useRef<number | null>(null);
  const scrollRafRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      const scrollBottom = window.innerHeight + window.scrollY;
      const distanceFromBottom = document.documentElement.scrollHeight - scrollBottom;

      // Hysteresis buffer (prevents oscillation):
      // If distance > 260px, user has scrolled up to read earlier content.
      // If distance < 80px, user is back at the bottom.
      if (distanceFromBottom > 260 && !isUserScrolledUpRef.current) {
        setIsUserScrolledUp(true);
        isUserScrolledUpRef.current = true;
      } else if (distanceFromBottom < 80 && isUserScrolledUpRef.current) {
        setIsUserScrolledUp(false);
        isUserScrolledUpRef.current = false;
      }
    };

    const handleUserInteraction = () => {
      userIsScrollingRef.current = true;
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
      userScrollTimeoutRef.current = window.setTimeout(() => {
        userIsScrollingRef.current = false;
      }, 600);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleUserInteraction, { passive: true });
    window.addEventListener('touchmove', handleUserInteraction, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleUserInteraction);
      window.removeEventListener('touchmove', handleUserInteraction);
      if (userScrollTimeoutRef.current) {
        window.clearTimeout(userScrollTimeoutRef.current);
      }
    };
  }, []);

  // Jitter-free, non-fighting autoscroll during streaming
  useEffect(() => {
    // If the user has scrolled up to read, or is actively touching/wheeling, DO NOT fight them!
    if (isUserScrolledUpRef.current || userIsScrollingRef.current) return;

    if (scrollRafRef.current) {
      cancelAnimationFrame(scrollRafRef.current);
    }

    scrollRafRef.current = requestAnimationFrame(() => {
      if (!isUserScrolledUpRef.current && !userIsScrollingRef.current) {
        // Direct window scrollTo to end of page without colliding with sticky footer
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'auto',
        });
      }
    });

    return () => {
      if (scrollRafRef.current) {
        cancelAnimationFrame(scrollRafRef.current);
      }
    };
  }, [messages, streamingText]);

  const handleScrollToBottom = () => {
    soundEffects.playClick();
    setIsUserScrolledUp(false);
    isUserScrolledUpRef.current = false;
    userIsScrollingRef.current = false;
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth',
    });
  };

  const handleCycleTheme = () => {
    const themes: ('crimson' | 'emerald' | 'sunset' | 'silver')[] = ['crimson', 'emerald', 'sunset', 'silver'];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    setCurrentTheme(themes[nextIdx]);
  };

  // Save settings to localStorage
  const handleUpdateSettings = (newSettings: StudioSettings) => {
    setSettings(newSettings);
    try {
      localStorage.setItem('scripty_settings', JSON.stringify(newSettings));
    } catch {}
  };

  // Save script to Stash
  const handleSaveScript = (title: string, code: string) => {
    const newItem: SavedScriptItem = {
      id: `script-${Date.now()}`,
      title: title || 'Custom Executor Script',
      code,
      timestamp: Date.now(),
    };
    const updated = [newItem, ...savedScripts];
    setSavedScripts(updated);
    try {
      localStorage.setItem('scripty_saved_scripts', JSON.stringify(updated));
    } catch {}
  };

  const handleDeleteSavedScript = (id: string) => {
    const updated = savedScripts.filter((s) => s.id !== id);
    setSavedScripts(updated);
    try {
      localStorage.setItem('scripty_saved_scripts', JSON.stringify(updated));
    } catch {}
  };

  const handleExportAllSaved = () => {
    soundEffects.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(savedScripts, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `mujtaba_scripts_backup_${Date.now()}.json`;
    a.click();
  };

  // Check backend health across Express and Netlify Functions
  useEffect(() => {
    const checkHealth = async () => {
      const endpoints = ['/api/health', '/.netlify/functions/health', '/.netlify/functions/api/health'];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep);
          if (res.ok) {
            const data = await res.json();
            if (data && typeof data.hasApiKey === 'boolean') {
              setHasApiKey(data.hasApiKey);
            }
            return;
          }
        } catch {}
      }
    };
    checkHealth();
  }, []);

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
    if (streamingText) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          role: 'assistant',
          content: streamingText + '\n\n*(Generation stopped)*',
          timestamp: Date.now(),
          target: currentTarget,
          action: currentAction,
        },
      ]);
      setStreamingText('');
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME]);
    setStreamingText('');
    setErrorMsg(null);
    setPresetCode('');
  };

  const handleSubmitPrompt = async (prompt: string, code?: string) => {
    setErrorMsg(null);
    setLastPrompt({ prompt, code });

    const userMsgContent = prompt || `[${currentAction.toUpperCase()}] Attached script`;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userMsgContent,
      timestamp: Date.now(),
      target: currentTarget,
      action: currentAction,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setStreamingText('');

    // Ensure we start at bottom when submitting a new prompt
    isUserScrolledUpRef.current = false;
    setIsUserScrolledUp(false);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

    abortControllerRef.current = new AbortController();

    try {
      // First attempt: Stream endpoint
      let accumulated = '';
      try {
        const response = await fetch('/api/stream-lua', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: abortControllerRef.current.signal,
          body: JSON.stringify({
            prompt,
            target: currentTarget,
            action: currentAction,
            existingCode: code,
            history: messages.slice(-4),
          }),
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder('utf-8');
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith(':')) continue;
              if (line.startsWith('data: ')) {
                const dataStr = line.replace('data: ', '').trim();
                if (dataStr === '[DONE]') break;

                try {
                  const parsed = JSON.parse(dataStr);
                  if (parsed.error) throw new Error(parsed.error);
                  if (parsed.text) {
                    accumulated += parsed.text;
                    setStreamingText(accumulated);
                  }
                } catch (jsonErr: any) {
                  if (jsonErr.message && !jsonErr.message.includes('JSON')) {
                    throw jsonErr;
                  }
                }
              }
            }
          }
        }
      } catch (streamErr: any) {
        if (streamErr.name === 'AbortError') return;
        console.warn('Stream failed or interrupted, evaluating fallback...', streamErr);
      }

      if (accumulated && accumulated.trim().length > 0) {
        soundEffects.playSuccess();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: accumulated,
            timestamp: Date.now(),
            target: currentTarget,
            action: currentAction,
          },
        ]);
        return;
      }

      // Fallback: If streaming didn't produce text, call unary endpoints
      const candidateEndpoints = [
        '/api/generate-lua',
        '/.netlify/functions/api/generate-lua',
        '/.netlify/functions/generate-lua',
      ];

      const requestPayload = {
        prompt,
        target: currentTarget,
        action: currentAction,
        existingCode: code,
        history: messages.slice(-4),
      };

      let generatedText = '';
      for (const endpoint of candidateEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: abortControllerRef.current?.signal,
            body: JSON.stringify(requestPayload),
          });

          if (!res.ok) continue;

          const data = await res.json();
          if (data.text) {
            generatedText = data.text;
            break;
          }
        } catch (callErr: any) {
          if (callErr.name === 'AbortError') throw callErr;
        }
      }

      // If endpoints failed, try client-side Gemini fallback
      if (!generatedText) {
        const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
        if (clientKey && clientKey !== 'MY_GEMINI_API_KEY') {
          try {
            generatedText = await generateClientSideFallback(
              prompt,
              currentTarget,
              currentAction,
              code,
              messages.slice(-4)
            );
          } catch {}
        }
      }

      if (generatedText) {
        soundEffects.playSuccess();
        setMessages((prev) => [
          ...prev,
          {
            id: `ai-${Date.now()}`,
            role: 'assistant',
            content: generatedText,
            timestamp: Date.now(),
            target: currentTarget,
            action: currentAction,
          },
        ]);
      } else {
        soundEffects.playError();
        throw new Error('Neural AI engine is temporarily busy. Please click Retry.');
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        soundEffects.playError();
        setErrorMsg(err?.message || 'Failed to communicate with Mujtaba Scripty AI server.');
      }
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  const handleRetryLast = () => {
    if (lastPrompt) {
      handleSubmitPrompt(lastPrompt.prompt, lastPrompt.code);
    }
  };

  const handleDebugCode = (code: string) => {
    setCurrentAction('debug');
    setPresetCode(code);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleOptimizeCode = (code: string) => {
    setCurrentAction('optimize');
    setPresetCode(code);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleExplainCode = (code: string) => {
    setCurrentAction('explain');
    setPresetCode(code);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  const handleCompleteScript = (code: string) => {
    setCurrentAction('generate');
    handleSubmitPrompt(
      'Please write the 100% COMPLETE, unbroken script with all requested features fully implemented from start to finish. Do not truncate, abbreviate, or leave placeholders.',
      code
    );
  };

  const handleSelectTemplate = (template: ScriptTemplate) => {
    soundEffects.playSuccess();
    setCurrentTarget(template.target);
    setCurrentAction('generate');
    setMessages((prev) => [
      ...prev,
      {
        id: `tpl-${Date.now()}`,
        role: 'user',
        content: `Loaded Preset: ${template.title}`,
        timestamp: Date.now(),
        target: template.target,
      },
      {
        id: `tpl-code-${Date.now()}`,
        role: 'assistant',
        content: `Here is the production-tested **${template.title}** (${template.category}):\n\n\`\`\`lua\n${template.code}\n\`\`\`\n\n*${template.description}*`,
        timestamp: Date.now(),
        target: template.target,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#07050a] text-slate-100 flex flex-col selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden font-sans">
      {/* Boot Animation Screen */}
      {showBootScreen && (
        <BootLoadingScreen onComplete={() => setShowBootScreen(false)} />
      )}

      {/* Unique Fluid Holographic Matrix Background */}
      <CyberBackground glowEnabled={settings.enableGlowEffects} theme={currentTheme} />

      {/* Cyber Grid Background */}
      {settings.enableGlowEffects && (
        <div className="fixed inset-0 cyber-grid-bg opacity-35 pointer-events-none" />
      )}

      {/* CRT Scanline Overlay */}
      {settings.enableScanlines && (
        <div className="fixed inset-0 scanlines-overlay pointer-events-none z-40" />
      )}

      {/* Sticky Top Header */}
      <Header
        currentTarget={currentTarget}
        onSelectTarget={setCurrentTarget}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onOpenSandbox={() => setIsSandboxOpen(true)}
        onOpenDocs={() => setIsGuideOpen(true)}
        onOpenUncDocs={() => setIsUncModalOpen(true)}
        onOpenSavedScripts={() => setIsSavedModalOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReplayBoot={() => setShowBootScreen(true)}
        onClearChat={handleClearChat}
        hasApiKey={hasApiKey}
        messageCount={messages.length}
        savedCount={savedScripts.length}
        currentTheme={currentTheme}
        onCycleTheme={handleCycleTheme}
        onOpenGuiBuilder={handleOpenGuiBuilder}
        onOpenDiffViewer={() => handleOpenDiff(presetCode || '-- Modified code', '-- Original code')}
      />

      {/* Main Workspace: Chat & Prompt deck front and center */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-4 space-y-4 flex flex-col relative z-10">
        {/* Compact Hero Showcase Banner (collapsible) */}
        <StudioHeroBanner
          onQuickPrompt={(p) => handleSubmitPrompt(p)}
          onOpenSandbox={() => setIsSandboxOpen(true)}
        />

        {/* Error Alert Banner */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-100 text-xs flex items-center justify-between shadow-2xl">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
            <div className="flex items-center gap-2">
              {lastPrompt && (
                <button
                  onClick={handleRetryLast}
                  className="px-2.5 py-1 rounded bg-rose-900 hover:bg-rose-800 text-rose-100 text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Retry</span>
                </button>
              )}
              <button
                onClick={() => setErrorMsg(null)}
                className="text-xs text-rose-400 hover:text-rose-200 underline cursor-pointer ml-1"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Conversation Stream (Immediately visible above the fold!) */}
        <div className="flex-1 min-h-[380px]">
          <ConversationView
            messages={messages}
            streamingText={streamingText}
            isGenerating={isGenerating}
            currentTarget={currentTarget}
            onDebugCode={handleDebugCode}
            onOptimizeCode={handleOptimizeCode}
            onExplainCode={handleExplainCode}
            onSaveScript={handleSaveScript}
            onQuickPrompt={(p) => handleSubmitPrompt(p)}
            onAuditCode={handleOpenAudit}
            onMinifyCode={handleOpenObfuscator}
            onCompareDiff={(code) => handleOpenDiff(code, presetCode)}
            onCompleteScript={handleCompleteScript}
          />
          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Bottom Button if user scrolled up while reading (FIXED so it takes 0 layout space!) */}
        {isUserScrolledUp && (
          <div className="fixed bottom-36 left-0 right-0 z-40 flex justify-center pointer-events-none transition-all animate-code-reveal">
            <button
              onClick={handleScrollToBottom}
              className="pointer-events-auto px-4 py-1.5 rounded-full bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold shadow-2xl border border-rose-400/50 flex items-center gap-2 transition-all transform hover:scale-105 active:scale-95 cursor-pointer animate-beacon"
            >
              <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
              <span>Scroll to Latest</span>
            </button>
          </div>
        )}

        {/* Floating Command Deck Prompt Console */}
        <div className="sticky bottom-3 z-20 pt-2">
          <PromptConsole
            currentTarget={currentTarget}
            currentAction={currentAction}
            onSelectAction={setCurrentAction}
            onSubmit={handleSubmitPrompt}
            isGenerating={isGenerating}
            onCancel={handleCancelGeneration}
            presetCode={presetCode}
            onClearPresetCode={() => setPresetCode('')}
            onOpenObfuscator={() => handleOpenObfuscator(presetCode)}
            onOpenSecurityAudit={() => handleOpenAudit(presetCode)}
          />
        </div>
      </main>

      {/* Presets Modal */}
      <TemplateModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTarget={currentTarget}
      />

      {/* In-Browser Interactive Lua 5.3 Sandbox Modal */}
      <SandboxModal
        isOpen={isSandboxOpen}
        onClose={() => setIsSandboxOpen(false)}
      />

      {/* Deployment & Architecture Guide Modal */}
      <DeploymentGuide
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        target={currentTarget}
      />

      {/* UNC API Reference Modal */}
      <UncReferenceModal
        isOpen={isUncModalOpen}
        onClose={() => setIsUncModalOpen(false)}
        onInsertCodeSnippet={(snippet) => {
          setPresetCode(snippet);
        }}
      />

      {/* Studio & Executor Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
      />

      {/* Saved Scripts Stash Modal */}
      <SavedScriptsModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedScripts={savedScripts}
        onDeleteScript={handleDeleteSavedScript}
        onLoadScript={(s) => {
          setIsSandboxOpen(true);
        }}
        onExportAll={handleExportAllSaved}
      />

      {/* Obfuscator & Minifier Modal */}
      <ObfuscatorModal
        isOpen={isObfuscatorOpen}
        onClose={() => setIsObfuscatorOpen(false)}
        sourceCode={activeCodeForTool || presetCode}
      />

      {/* Security & Anti-Cheat Audit Modal */}
      <SecurityAnalyzerModal
        isOpen={isSecurityAuditOpen}
        onClose={() => setIsSecurityAuditOpen(false)}
        sourceCode={activeCodeForTool || presetCode}
        onAutoFix={(prompt, code) => handleSubmitPrompt(prompt, code)}
      />

      {/* Visual GUI Builder Modal */}
      <GuiBuilderModal
        isOpen={isGuiBuilderOpen}
        onClose={() => setIsGuiBuilderOpen(false)}
        onInsertCode={handleInsertSnippet}
      />

      {/* Code Diff & Version Comparison Modal */}
      <DiffViewerModal
        isOpen={isDiffViewerOpen}
        onClose={() => setIsDiffViewerOpen(false)}
        originalCode={diffOriginal}
        modifiedCode={diffModified}
        onApplyModified={(c) => {
          setPresetCode(c);
          soundEffects.playSuccess();
        }}
      />
    </div>
  );
}
