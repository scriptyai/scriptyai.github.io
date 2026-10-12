import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { ConversationView } from './components/ConversationView';
import { PromptConsole } from './components/PromptConsole';
import { StudioHeroBanner } from './components/StudioHeroBanner';
import { CyberBackground } from './components/CyberBackground';
import { BootLoadingScreen } from './components/BootLoadingScreen';
import { TemplateModal } from './components/TemplateModal';
import { SandboxModal } from './components/SandboxModal';
import { UncReferenceModal } from './components/UncReferenceModal';
import { SavedScriptsModal, SavedScriptItem } from './components/SavedScriptsModal';
import { SettingsModal, StudioSettings } from './components/SettingsModal';
import { DeploymentGuide } from './components/DeploymentGuide';
import { GuiBuilderModal } from './components/GuiBuilderModal';
import { DiffViewerModal } from './components/DiffViewerModal';
import { ObfuscatorModal } from './components/ObfuscatorModal';
import { SecurityAnalyzerModal } from './components/SecurityAnalyzerModal';
import { GitHubDeployModal } from './components/GitHubDeployModal';

import { ChatMessage, LuaTarget, LuaAction, ScriptTemplate } from './types';
import { soundEffects } from './utils/audioEffects';
import { 
  getClientStoredApiKey, 
  saveClientStoredApiKey, 
  streamClientSideFallback, 
  generateClientSideFallback 
} from './utils/geminiFallback';

const DEFAULT_SETTINGS: StudioSettings = {
  enableAudio: true,
  enableScanlines: true,
  enableGlowEffects: true,
  autoFormatCode: true,
  enforceCleanupGuards: true,
  strictLuauTyping: true,
  executorProfile: 'universal',
  accentTheme: 'cyan',
};

const INITIAL_WELCOME_MESSAGE: ChatMessage = {
  id: 'welcome-1',
  role: 'assistant',
  content: `### Welcome to Mujtaba Scripty AI
I am your dedicated **Luau & UNC Executor Systems Architect**.

- **UNC 100% Compliance:** Drawing API, \`getgenv\` singleton cleanup guards, \`gethui\` anti-detection UI parenting.
- **Universal Executor Engine:** Compatible with Synapse, Wave, Krnl, Delta Mobile, Fluxus, and Codex.
- **GitHub Pages Ready:** Full client-side architecture with zero white screens on \`github.io\`.

Select a preset from the top bar, use the visual **GUI Builder**, run tests inside the **Lua VM**, or type your custom executor script prompt below!`,
  timestamp: Date.now(),
  target: 'executor',
  action: 'generate',
};

export default function App() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('scripty_chat_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [INITIAL_WELCOME_MESSAGE];
  });

  const [currentTarget, setCurrentTarget] = useState<LuaTarget>('executor');
  const [currentAction, setCurrentAction] = useState<LuaAction>('generate');
  const [currentTheme, setCurrentTheme] = useState<'crimson' | 'emerald' | 'sunset' | 'silver'>('crimson');

  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [presetCode, setPresetCode] = useState('');

  // Modals state
  const [showBootScreen, setShowBootScreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);
  const [showDocs, setShowDocs] = useState(false);
  const [showUncDocs, setShowUncDocs] = useState(false);
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGuiBuilder, setShowGuiBuilder] = useState(false);
  const [showDiffViewer, setShowDiffViewer] = useState(false);
  const [showObfuscator, setShowObfuscator] = useState(false);
  const [showSecurityAudit, setShowSecurityAudit] = useState(false);
  const [showGitHubDeploy, setShowGitHubDeploy] = useState(false);

  // Modal payload buffers
  const [sandboxCode, setSandboxCode] = useState('');
  const [auditSourceCode, setAuditSourceCode] = useState('');
  const [obfuscateSourceCode, setObfuscateSourceCode] = useState('');
  const [diffOriginal, setDiffOriginal] = useState('');
  const [diffModified, setDiffModified] = useState('');

  // Settings & Saved scripts
  const [settings, setSettings] = useState<StudioSettings>(DEFAULT_SETTINGS);
  const [savedScripts, setSavedScripts] = useState<SavedScriptItem[]>(() => {
    try {
      const stored = localStorage.getItem('scripty_saved_scripts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [apiKey, setApiKey] = useState<string>(() => getClientStoredApiKey());
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync chat to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scripty_chat_history', JSON.stringify(messages.slice(-20)));
    } catch {}
  }, [messages]);

  // Sync saved scripts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('scripty_saved_scripts', JSON.stringify(savedScripts));
    } catch {}
  }, [savedScripts]);

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    saveClientStoredApiKey(key);
  };

  const handleCycleTheme = () => {
    const themes: ('crimson' | 'emerald' | 'sunset' | 'silver')[] = ['crimson', 'emerald', 'sunset', 'silver'];
    const nextIdx = (themes.indexOf(currentTheme) + 1) % themes.length;
    setCurrentTheme(themes[nextIdx]);
  };

  // Extract Lua code from markdown for quick actions
  const extractCodeFromText = (text: string): string => {
    const match = /```(?:lua)?\n([\s\S]*?)```/i.exec(text);
    return match ? match[1].trim() : text;
  };

  // Main prompt dispatch with backend SSE streaming & client-side fallback
  const handleSubmitPrompt = async (promptText: string, existingCode?: string) => {
    if (isGenerating) return;
    if (!promptText.trim() && !existingCode?.trim()) return;

    soundEffects.playGenerate();

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: promptText,
      timestamp: Date.now(),
      target: currentTarget,
      action: currentAction,
      extractedCode: existingCode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsGenerating(true);
    setStreamingText('');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    let fullGeneratedContent = '';

    try {
      let backendSuccess = false;

      // Try Backend SSE streaming first (if running with server.ts)
      try {
        const historyPayload = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/stream-lua', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            target: currentTarget,
            action: currentAction,
            existingCode,
            history: historyPayload,
          }),
          signal: abortController.signal,
        });

        if (response.ok && response.body) {
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let done = false;
          let buffer = '';

          while (!done) {
            const { value, done: readerDone } = await reader.read();
            done = readerDone;
            if (value) {
              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() || '';

              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const dataStr = line.replace('data: ', '').trim();
                  if (dataStr === '[DONE]') {
                    backendSuccess = true;
                    break;
                  }
                  try {
                    const parsed = JSON.parse(dataStr);
                    if (parsed.text) {
                      fullGeneratedContent += parsed.text;
                      setStreamingText(fullGeneratedContent);
                      backendSuccess = true;
                    } else if (parsed.error && !fullGeneratedContent) {
                      throw new Error(parsed.error);
                    }
                  } catch {
                    // Raw string chunk fallback
                    if (dataStr && dataStr !== '[DONE]') {
                      fullGeneratedContent += dataStr;
                      setStreamingText(fullGeneratedContent);
                      backendSuccess = true;
                    }
                  }
                }
              }
            }
          }
        }
      } catch (backendErr: any) {
        if (backendErr.name === 'AbortError') throw backendErr;
        console.warn('Backend stream unavailable or static host, falling back to client-side engine:', backendErr);
      }

      // If backend was unavailable (e.g. running on GitHub Pages github.io static hosting):
      if (!backendSuccess || !fullGeneratedContent.trim()) {
        const historyPayload = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }));

        try {
          // Client-side streaming with @google/genai or smart offline knowledge
          const streamGen = streamClientSideFallback(
            promptText,
            currentTarget,
            currentAction,
            existingCode,
            historyPayload
          );

          for await (const chunk of streamGen) {
            if (abortController.signal.aborted) break;
            fullGeneratedContent += chunk;
            setStreamingText(fullGeneratedContent);
          }
        } catch (clientStreamErr: any) {
          console.warn('Client streaming fallback failed, attempting unary generation...', clientStreamErr);
          // Unary client fallback
          fullGeneratedContent = await generateClientSideFallback(
            promptText,
            currentTarget,
            currentAction,
            existingCode,
            historyPayload
          );
        }
      }

      if (fullGeneratedContent.trim()) {
        soundEffects.playSuccess();
        const assistantMsg: ChatMessage = {
          id: `ast-${Date.now()}`,
          role: 'assistant',
          content: fullGeneratedContent,
          timestamp: Date.now(),
          target: currentTarget,
          action: currentAction,
          extractedCode: extractCodeFromText(fullGeneratedContent),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        soundEffects.playClick();
        if (fullGeneratedContent) {
          setMessages((prev) => [
            ...prev,
            {
              id: `ast-${Date.now()}`,
              role: 'assistant',
              content: fullGeneratedContent + '\n\n*(Generation stopped by user)*',
              timestamp: Date.now(),
              target: currentTarget,
              action: currentAction,
            },
          ]);
        }
      } else {
        soundEffects.playError();
        setMessages((prev) => [
          ...prev,
          {
            id: `err-${Date.now()}`,
            role: 'assistant',
            content: `**Generation Notice:**\n${err.message || 'Unable to complete request.'}\n\n*Tip: If running on GitHub Pages (github.io), click "Deploy github.io" in the top bar to verify your API key or use our pre-built script presets.*`,
            timestamp: Date.now(),
            target: currentTarget,
            action: currentAction,
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      setStreamingText('');
      abortControllerRef.current = null;
    }
  };

  const handleCancelGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleClearChat = () => {
    setMessages([INITIAL_WELCOME_MESSAGE]);
    localStorage.removeItem('scripty_chat_history');
    soundEffects.playClick();
  };

  // Quick Action Handlers from CodeViewer
  const handleDebugCode = (code: string) => {
    setCurrentAction('debug');
    setPresetCode(code);
  };

  const handleOptimizeCode = (code: string) => {
    setCurrentAction('optimize');
    setPresetCode(code);
  };

  const handleExplainCode = (code: string) => {
    setCurrentAction('explain');
    setPresetCode(code);
  };

  const handleSaveScript = (title: string, code: string) => {
    const newItem: SavedScriptItem = {
      id: `script-${Date.now()}`,
      title: title || 'Custom Executor Script',
      code,
      timestamp: Date.now(),
      category: 'Saved',
    };
    setSavedScripts((prev) => [newItem, ...prev]);
    soundEffects.playSuccess();
  };

  const handleDeleteSavedScript = (id: string) => {
    setSavedScripts((prev) => prev.filter((s) => s.id !== id));
    soundEffects.playClick();
  };

  const handleLoadSavedScript = (script: SavedScriptItem) => {
    setShowSavedScripts(false);
    setPresetCode(script.code);
    setCurrentAction('optimize');
  };

  const handleExportAllSaved = () => {
    const dataStr = JSON.stringify(savedScripts, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mujtaba-scripty-stash-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    soundEffects.playSuccess();
  };

  const handleSelectTemplate = (tmpl: ScriptTemplate) => {
    setShowTemplates(false);
    soundEffects.playClick();
    handleSubmitPrompt(tmpl.prompt, tmpl.code);
  };

  const handleOpenSandboxWithCode = (code?: string) => {
    setSandboxCode(code || '');
    setShowSandbox(true);
  };

  const handleOpenAuditWithCode = (code: string) => {
    setAuditSourceCode(code);
    setShowSecurityAudit(true);
  };

  const handleOpenObfuscateWithCode = (code: string) => {
    setObfuscateSourceCode(code);
    setShowObfuscator(true);
  };

  const handleOpenDiffCompare = (code: string) => {
    setDiffOriginal(presetCode || '-- Original Base Code');
    setDiffModified(code);
    setShowDiffViewer(true);
  };

  return (
    <div className="min-h-screen bg-[#07060a] text-slate-100 flex flex-col font-sans selection:bg-rose-500/30 selection:text-rose-200 relative overflow-x-hidden">
      {/* Dynamic Cyber Background */}
      <CyberBackground glowEnabled={settings.enableGlowEffects} theme={currentTheme} />

      {/* Boot sequence loading screen */}
      {showBootScreen && (
        <BootLoadingScreen onComplete={() => setShowBootScreen(false)} />
      )}

      {/* Application Top Bar */}
      <Header
        currentTarget={currentTarget}
        onSelectTarget={setCurrentTarget}
        onOpenTemplates={() => setShowTemplates(true)}
        onOpenSandbox={() => handleOpenSandboxWithCode()}
        onOpenDocs={() => setShowDocs(true)}
        onOpenUncDocs={() => setShowUncDocs(true)}
        onOpenSavedScripts={() => setShowSavedScripts(true)}
        onOpenSettings={() => setShowSettings(true)}
        onOpenGitHubDeploy={() => setShowGitHubDeploy(true)}
        onReplayBoot={() => setShowBootScreen(true)}
        onClearChat={handleClearChat}
        hasApiKey={Boolean(apiKey)}
        messageCount={messages.length}
        savedCount={savedScripts.length}
        currentTheme={currentTheme}
        onCycleTheme={handleCycleTheme}
        onOpenGuiBuilder={() => setShowGuiBuilder(true)}
        onOpenDiffViewer={() => setShowDiffViewer(true)}
      />

      {/* Main Workspace Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 flex flex-col gap-4 relative z-10">
        {/* Studio Showcase & Hero Banner */}
        <StudioHeroBanner
          onQuickPrompt={(p) => handleSubmitPrompt(p)}
          onOpenSandbox={() => handleOpenSandboxWithCode()}
        />

        {/* Conversation & Script Generation Stream */}
        <div className="flex-1 flex flex-col min-h-[420px]">
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
            onAuditCode={handleOpenAuditWithCode}
            onMinifyCode={handleOpenObfuscateWithCode}
            onCompareDiff={handleOpenDiffCompare}
            onCompleteScript={(code) => handleSubmitPrompt('Complete and finish this script logic', code)}
          />
        </div>

        {/* Interactive Prompt & Code Dispatch Deck */}
        <div className="sticky bottom-2 z-20">
          <PromptConsole
            currentTarget={currentTarget}
            currentAction={currentAction}
            onSelectAction={setCurrentAction}
            onSubmit={handleSubmitPrompt}
            isGenerating={isGenerating}
            onCancel={handleCancelGeneration}
            presetCode={presetCode}
            onClearPresetCode={() => setPresetCode('')}
            onOpenObfuscator={() => setShowObfuscator(true)}
            onOpenSecurityAudit={() => setShowSecurityAudit(true)}
          />
        </div>
      </main>

      {/* Modals & Dialogs */}
      <TemplateModal
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        onSelectTemplate={handleSelectTemplate}
        currentTarget={currentTarget}
      />

      <SandboxModal
        isOpen={showSandbox}
        onClose={() => setShowSandbox(false)}
        initialCode={sandboxCode}
      />

      <UncReferenceModal
        isOpen={showUncDocs}
        onClose={() => setShowUncDocs(false)}
        onInsertCodeSnippet={(snippet) => setPresetCode(snippet)}
      />

      <SavedScriptsModal
        isOpen={showSavedScripts}
        onClose={() => setShowSavedScripts(false)}
        savedScripts={savedScripts}
        onDeleteScript={handleDeleteSavedScript}
        onLoadScript={handleLoadSavedScript}
        onExportAll={handleExportAllSaved}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
      />

      <DeploymentGuide
        target={currentTarget}
        isOpen={showDocs}
        onClose={() => setShowDocs(false)}
      />

      <GuiBuilderModal
        isOpen={showGuiBuilder}
        onClose={() => setShowGuiBuilder(false)}
        onInsertCode={(code) => {
          setShowGuiBuilder(false);
          setPresetCode(code);
          soundEffects.playSuccess();
        }}
      />

      <DiffViewerModal
        isOpen={showDiffViewer}
        onClose={() => setShowDiffViewer(false)}
        originalCode={diffOriginal}
        modifiedCode={diffModified}
        onApplyModified={(code) => {
          setPresetCode(code);
          setShowDiffViewer(false);
        }}
      />

      <ObfuscatorModal
        isOpen={showObfuscator}
        onClose={() => setShowObfuscator(false)}
        sourceCode={obfuscateSourceCode || presetCode}
      />

      <SecurityAnalyzerModal
        isOpen={showSecurityAudit}
        onClose={() => setShowSecurityAudit(false)}
        sourceCode={auditSourceCode || presetCode}
        onAutoFix={(prompt, code) => {
          setShowSecurityAudit(false);
          handleSubmitPrompt(prompt, code);
        }}
      />

      <GitHubDeployModal
        isOpen={showGitHubDeploy}
        onClose={() => setShowGitHubDeploy(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />
    </div>
  );
}
