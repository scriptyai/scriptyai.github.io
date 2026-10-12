import { User, Sparkles, Terminal, Play, ShieldAlert, Cpu, ArrowRight, RefreshCw, Zap } from 'lucide-react';
import { ChatMessage, LuaTarget } from '../types';
import { CodeViewer } from './CodeViewer';
import { soundEffects } from '../utils/audioEffects';

interface ConversationViewProps {
  messages: ChatMessage[];
  streamingText: string;
  isGenerating: boolean;
  currentTarget: LuaTarget;
  onDebugCode: (code: string) => void;
  onOptimizeCode: (code: string) => void;
  onExplainCode: (code: string) => void;
  onSaveScript?: (title: string, code: string) => void;
  onQuickPrompt: (prompt: string) => void;
  onAuditCode?: (code: string) => void;
  onMinifyCode?: (code: string) => void;
  onCompareDiff?: (code: string) => void;
  onCompleteScript?: (code: string) => void;
}

export function ConversationView({
  messages,
  streamingText,
  isGenerating,
  currentTarget,
  onDebugCode,
  onOptimizeCode,
  onExplainCode,
  onSaveScript,
  onQuickPrompt,
  onAuditCode,
  onMinifyCode,
  onCompareDiff,
  onCompleteScript,
}: ConversationViewProps) {
  // Parse markdown code blocks vs text (with seamless support for streaming unclosed blocks)
  const parseMessageContent = (content: string) => {
    const parts: { type: 'text' | 'code'; content: string; language?: string }[] = [];
    const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, match.index),
        });
      }

      parts.push({
        type: 'code',
        language: match[1] || 'lua',
        content: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < content.length) {
      const remaining = content.slice(lastIndex);
      // Check if there is an unclosed code block currently streaming: ```[language]?\n[code]
      const unclosedMatch = remaining.match(/```([a-zA-Z0-9_-]*)\n([\s\S]*)$/);
      if (unclosedMatch && unclosedMatch.index !== undefined) {
        if (unclosedMatch.index > 0) {
          parts.push({
            type: 'text',
            content: remaining.slice(0, unclosedMatch.index),
          });
        }
        parts.push({
          type: 'code',
          language: unclosedMatch[1] || 'lua',
          content: unclosedMatch[2],
        });
      } else {
        parts.push({
          type: 'text',
          content: remaining,
        });
      }
    }

    return parts;
  };

  const starterCards = [
    {
      title: 'Universal Draggable GUI',
      desc: 'Pure Luau draggable menu with smooth TweenService & zero dependencies',
      prompt: 'Write a complete, self-contained draggable Executor GUI in Roblox Lua with toggle buttons, speed slider, and close button, safely parented to (gethui and gethui()) or CoreGui with getgenv re-execution cleanup.',
      icon: Terminal,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      title: 'Rayfield UI Dashboard',
      desc: 'Multi-tab UI with toggles, sliders, keybinds, and notifications',
      prompt: 'Write a complete Rayfield UI Library script for an executor with a Main tab, Player tab (WalkSpeed & JumpPower sliders), and Settings tab with keybind toggle and config saving.',
      icon: Play,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
    {
      title: 'In-Game CFrame & Position Grabber',
      desc: 'HUD displaying XYZ & LookVector with instant clipboard hotkey (C)',
      prompt: 'Create a standalone executor utility HUD that displays the player exact Vector3 position and CFrame, with a button and hotkey (C) that copies the formatted CFrame to clipboard via setclipboard.',
      icon: Cpu,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
    },
    {
      title: 'FPS & Performance Booster',
      desc: 'Disables 3D shadows, terrain water reflections & heavy textures',
      prompt: 'Write an executor script to maximize FPS on low-end PCs by disabling terrain water, lighting shadows, particle emitters, and simplifying materials with a toggle switch.',
      icon: Sparkles,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    },
    {
      title: 'Drawing API 2D Box ESP',
      desc: 'High performance 2D bounding boxes and tracers using Drawing.new()',
      prompt: 'Write a complete Drawing API 2D box ESP and tracers script using Drawing.new("Square") and Drawing.new("Line") with getgenv cleanup and RenderStepped loop.',
      icon: ShieldAlert,
      color: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
    },
    {
      title: 'Auto-Farm / CFrame Tween Loop',
      desc: 'Safe tween teleporting to waypoints with anti-fall and toggle guard',
      prompt: 'Write a safe Executor script that uses TweenService to smoothly move the player HumanoidRootPart through a list of target CFrames without triggering physics fall damage, with a start/stop toggle and cleanup.',
      icon: RefreshCw,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    },
  ];

  return (
    <div className="space-y-5 pb-6">
      {/* If messages are empty, show quick prompt cards */}
      {messages.length === 0 && !streamingText && (
        <div className="py-2 px-1 max-w-4xl mx-auto space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {starterCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <div
                  key={idx}
                  onClick={() => {
                    soundEffects.playClick();
                    onQuickPrompt(card.prompt);
                  }}
                  className="p-4 rounded-xl bg-[#0e0914]/80 border border-rose-950/50 hover:border-rose-500/50 hover:bg-[#140d1c] hover-card-anim cursor-pointer group shadow-sm flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center border ${card.color} transform group-hover:scale-110 transition-transform duration-200`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <h3 className="text-xs font-semibold text-slate-100 group-hover:text-rose-300 transition-colors">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 pl-9 leading-relaxed">
                        {card.desc}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-rose-400 group-hover:translate-x-1 transition-all shrink-0 mt-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Render all messages with smooth entrance animations */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        const parts = parseMessageContent(msg.content);

        return (
          <div
            key={msg.id}
            className={`flex gap-3 ${isUser ? 'justify-end animate-user-message' : 'justify-start animate-assistant-message'}`}
          >
            {!isUser && (
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-rose-600/20 animate-avatar-pop">
                <Terminal className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`max-w-[95%] sm:max-w-[88%] space-y-3 ${isUser ? 'text-right' : 'text-left'}`}>
              {isUser ? (
                <div className="inline-block p-3.5 rounded-2xl user-bubble-glow border border-rose-500/40 text-slate-100 text-xs text-left leading-relaxed shadow-lg shadow-rose-950/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none transform -skew-x-12 opacity-60" />
                  {msg.content}
                </div>
              ) : (
                <div className="space-y-3">
                  {parts.map((part, pIdx) => {
                    if (part.type === 'code') {
                      return (
                        <div key={pIdx} className="my-2 animate-code-reveal">
                          <CodeViewer
                            code={part.content}
                            target={msg.target || currentTarget}
                            title="Generated Script"
                            onDebugCode={onDebugCode}
                            onOptimizeCode={onOptimizeCode}
                            onExplainCode={onExplainCode}
                            onCompleteScript={onCompleteScript}
                            onSaveScript={onSaveScript}
                            onAuditCode={onAuditCode}
                            onMinifyCode={onMinifyCode}
                            onCompareDiff={onCompareDiff}
                          />
                        </div>
                      );
                    }

                    return (
                      <div
                        key={pIdx}
                        className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-[#0e0914]/90 p-3.5 rounded-xl border border-rose-950/50 shadow-md animate-code-reveal"
                      >
                        {part.content}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {isUser && (
              <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0 mt-1 animate-avatar-pop shadow-md shadow-slate-900/50">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        );
      })}

      {/* Immediate Thinking / Initialization State */}
      {isGenerating && !streamingText && (
        <div className="flex gap-3 justify-start items-start animate-assistant-message">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-rose-600/20 animate-avatar-pop">
            <Terminal className="w-3.5 h-3.5 animate-pulse" />
          </div>

          <div className="bg-[#0e0914]/95 border border-rose-950/70 rounded-2xl p-4 max-w-md space-y-2 shadow-2xl relative overflow-hidden">
            {/* Top scanning laser */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-rose-500 via-amber-400 to-rose-500 animate-pulse" />
            
            <div className="flex items-center justify-between gap-3 text-rose-300 text-xs font-medium">
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 cyber-dot-1" />
                  <span className="w-2 h-2 rounded-full bg-amber-400 cyber-dot-2" />
                  <span className="w-2 h-2 rounded-full bg-rose-400 cyber-dot-3" />
                </div>
                <span className="font-semibold tracking-wide">Mujtaba Scripty AI is architecting solution...</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
              Evaluating UNC requirements, configuring bytecode shims, and composing Luau syntax...
            </p>
          </div>
        </div>
      )}

      {/* Real-time Streaming Output Indicator */}
      {streamingText && (
        <div className="flex gap-3 justify-start animate-assistant-message">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-600 flex items-center justify-center text-white shrink-0 mt-1 shadow-md shadow-rose-600/20 animate-avatar-pop">
            <Terminal className="w-3.5 h-3.5" />
          </div>

          <div className="max-w-[95%] sm:max-w-[88%] flex-1 space-y-3">
            {parseMessageContent(streamingText).map((part, pIdx) => {
              if (part.type === 'code') {
                const lineCount = part.content.split('\n').length;
                return (
                  <div key={pIdx} className="my-2 rounded-2xl laser-perimeter-active bg-[#0d0914] overflow-hidden shadow-2xl transition-all animate-code-reveal">
                    {/* Streaming Code Header */}
                    <div className="flex items-center justify-between px-4 py-2.5 bg-[#08050c]/90 border-b border-rose-950/50">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                        <span className="text-xs font-mono font-medium text-slate-200">
                          Streaming Executor Script ({lineCount} lines)
                        </span>
                      </div>
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-900/40">
                        UNC Luau
                      </span>
                    </div>

                    {/* Pre-formatted Streaming Code View with Blinking Cyber Cursor */}
                    <div className="p-4 font-mono text-[13px] leading-relaxed bg-[#07050a] text-slate-200 overflow-x-auto max-h-[520px]">
                      <pre className="whitespace-pre font-mono">
                        {part.content}
                        <span className="cyber-cursor" />
                      </pre>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={pIdx}
                  className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap bg-[#0e0914]/90 p-3.5 rounded-xl border border-rose-950/50 animate-code-reveal"
                >
                  {part.content}
                  <span className="cyber-cursor" />
                </div>
              );
            })}
            <div className="flex items-center gap-2 text-rose-400 text-xs font-mono bg-rose-950/30 px-3 py-1.5 rounded-lg border border-rose-900/40 w-fit">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping"></span>
              <span>Synthesizing Lua bytecode stream...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
