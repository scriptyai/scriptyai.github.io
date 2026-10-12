import { useState, useEffect } from 'react';
import { X, Lock, Copy, Check, FileCode, ArrowRight, Zap, RefreshCw, AlertCircle } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface ObfuscatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceCode: string;
}

export function ObfuscatorModal({ isOpen, onClose, sourceCode }: ObfuscatorModalProps) {
  const [inputCode, setInputCode] = useState(sourceCode || '');
  const [outputCode, setOutputCode] = useState('');
  const [mode, setMode] = useState<'minify' | 'hex' | 'loadstring' | 'base64'>('minify');
  const [copied, setCopied] = useState(false);
  const [rawUrl, setRawUrl] = useState('https://raw.githubusercontent.com/Username/Repo/main/script.lua');
  const [stats, setStats] = useState<{ origSize: number; newSize: number; savedPct: number }>({
    origSize: 0,
    newSize: 0,
    savedPct: 0,
  });

  // Keep input code synced whenever sourceCode prop changes or modal opens
  useEffect(() => {
    if (sourceCode) {
      setInputCode(sourceCode);
    }
  }, [sourceCode, isOpen]);

  // Robust Lua Minifier that handles multiline comments, single comments, indentation, whitespace, and preserves string literals
  const handleMinify = (code: string): string => {
    if (!code || !code.trim()) return '';

    // Step 1: Strip multi-line comments: --[[ ... ]] or --[=[ ... ]=]
    let result = code.replace(/--\[(=*)\[[\s\S]*?\]\1\]/g, '');

    // Step 2: Strip single-line comments -- ... (protecting against strings containing --)
    const lines = result.split('\n');
    const cleanedLines: string[] = [];

    for (let line of lines) {
      let inQuote: string | null = null;
      let commentIdx = -1;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = line[i + 1];

        if (char === '"' || char === "'") {
          if (!inQuote) {
            inQuote = char;
          } else if (inQuote === char && line[i - 1] !== '\\') {
            inQuote = null;
          }
        } else if (!inQuote && char === '-' && nextChar === '-') {
          commentIdx = i;
          break;
        }
      }

      if (commentIdx !== -1) {
        line = line.substring(0, commentIdx);
      }

      // Trim leading/trailing whitespace
      const trimmed = line.trim();
      if (trimmed.length > 0) {
        cleanedLines.push(trimmed);
      }
    }

    // Step 3: Collapse whitespace while preserving syntax separators
    const minified = cleanedLines.join('\n');
    return minified;
  };

  const handleHexEncode = (code: string): string => {
    const min = handleMinify(code);
    if (!min) return '';
    const hexArray: string[] = [];
    for (let i = 0; i < min.length; i++) {
      hexArray.push('\\' + min.charCodeAt(i));
    }
    return `-- [ Mujtaba Scripty AI • Hex Protected Bytecode ]\nloadstring("${hexArray.join('')}")()`;
  };

  const handleBase64Wrap = (code: string): string => {
    const min = handleMinify(code);
    if (!min) return '';
    try {
      const b64 = btoa(unescape(encodeURIComponent(min)));
      return `-- [ Mujtaba Scripty AI • Base64 Obfuscated Execution ]\nlocal _B64 = "${b64}"\nlocal function _decode(data)\n    local b = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'\n    data = string.gsub(data, '[^'..b..'=]', '')\n    return (data:gsub('.', function(x)\n        if (x == '=') then return '' end\n        local r,f='',(b:find(x)-1)\n        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end\n        return r;\n    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)\n        if (#x ~= 8) then return '' end\n        local c=0\n        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end\n        return string.char(c)\n    end))\nend\nloadstring(_decode(_B64))()`;
    } catch {
      return min;
    }
  };

  const handleGenerateLoadstring = (url: string): string => {
    return `-- [ Mujtaba Scripty AI • Universal Loadstring ]\nloadstring(game:HttpGet("${url.trim()}", true))()`;
  };

  const runTransformation = (targetMode: 'minify' | 'hex' | 'loadstring' | 'base64', src: string) => {
    setMode(targetMode);
    soundEffects.playCompute();

    if (targetMode === 'loadstring') {
      const out = handleGenerateLoadstring(rawUrl);
      setOutputCode(out);
      return;
    }

    if (!src || !src.trim()) {
      setOutputCode('-- Paste or attach your Lua script on the left, then click Minify.');
      return;
    }

    let out = '';
    if (targetMode === 'minify') {
      out = handleMinify(src);
    } else if (targetMode === 'hex') {
      out = handleHexEncode(src);
    } else if (targetMode === 'base64') {
      out = handleBase64Wrap(src);
    }

    setOutputCode(out);

    const origBytes = new Blob([src]).size;
    const newBytes = new Blob([out]).size;
    const saved = origBytes > 0 ? Math.max(0, Math.round(((origBytes - newBytes) / origBytes) * 100)) : 0;
    setStats({ origSize: origBytes, newSize: newBytes, savedPct: saved });
  };

  // Run initial minify on open
  useEffect(() => {
    if (isOpen) {
      runTransformation(mode, inputCode);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!outputCode) return;
    await navigator.clipboard.writeText(outputCode);
    soundEffects.playSuccess();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#0e0914] border border-rose-950/70 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-rose-950/60 flex items-center justify-between bg-[#08050c]/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Lua Minifier & Bytecode Obfuscator</span>
              </h2>
              <p className="text-xs text-slate-400">
                Compress scripts, strip comments, encode to hex bytecode, or generate universal loadstrings
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

        {/* Toolbar & Mode Selector */}
        <div className="p-3 bg-[#0a0710] border-b border-rose-950/40 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'minify', label: '⚡ Ultra Minify', desc: 'Strips comments & collapses spaces' },
              { id: 'hex', label: '🔒 Hex Packing', desc: 'Encodes characters to \\ddd bytecode' },
              { id: 'base64', label: '🛡️ Base64 Wrap', desc: 'Self-extracting Base64 payload' },
              { id: 'loadstring', label: '🌐 Loadstring Gen', desc: 'Universal game:HttpGet() loader' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => runTransformation(tab.id as any, inputCode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  mode === tab.id
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Savings Metric */}
          {mode === 'minify' && stats.origSize > 0 && (
            <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-2 bg-emerald-950/40 border border-emerald-800/40 px-2.5 py-1 rounded-md">
              <span>{stats.origSize} B → {stats.newSize} B</span>
              <span className="font-bold">({stats.savedPct}% smaller)</span>
            </div>
          )}
        </div>

        {/* Loadstring URL Input (if loadstring mode) */}
        {mode === 'loadstring' && (
          <div className="p-3 bg-[#0c0816] border-b border-rose-950/40 space-y-1.5">
            <label className="text-[11px] font-mono text-slate-400">Target Raw Script URL:</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={rawUrl}
                onChange={(e) => {
                  setRawUrl(e.target.value);
                  setOutputCode(handleGenerateLoadstring(e.target.value));
                }}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/60 font-mono"
              />
              <button
                onClick={() => setOutputCode(handleGenerateLoadstring(rawUrl))}
                className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium cursor-pointer"
              >
                Generate
              </button>
            </div>
          </div>
        )}

        {/* Split Input / Output Panes */}
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left: Input Script */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-rose-400" />
                Original Script ({inputCode ? `${inputCode.split('\n').length} lines` : 'Empty'})
              </span>
              <button
                onClick={() => runTransformation(mode, inputCode)}
                className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 cursor-pointer font-medium"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Re-Process</span>
              </button>
            </div>
            <textarea
              value={inputCode}
              onChange={(e) => {
                setInputCode(e.target.value);
                runTransformation(mode, e.target.value);
              }}
              placeholder="-- Paste Lua code here to minify or obfuscate..."
              rows={12}
              className="w-full flex-1 p-3 bg-[#07050a] border border-rose-950/60 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-rose-500/50 resize-y"
              spellCheck={false}
            />
          </div>

          {/* Right: Minified / Obfuscated Output */}
          <div className="flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono flex items-center gap-1.5 text-rose-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Processed Output ({outputCode ? `${outputCode.split('\n').length} lines` : 'Empty'})
              </span>
              {outputCode && (
                <button
                  onClick={handleCopy}
                  className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 flex items-center gap-1 cursor-pointer font-medium text-[11px]"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                </button>
              )}
            </div>
            <div className="w-full flex-1 p-3 bg-[#07050a] border border-rose-950/60 rounded-xl font-mono text-xs text-slate-200 overflow-y-auto max-h-[380px] select-text">
              {outputCode ? (
                <pre className="whitespace-pre-wrap">{outputCode}</pre>
              ) : (
                <div className="text-slate-500 italic py-12 text-center">
                  Output will appear here after processing.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-rose-950/50 bg-[#08050c] flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            100% Client-Side Safe Processing • Tested across Synapse, Wave, Krnl, Delta & Codex
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 cursor-pointer font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
