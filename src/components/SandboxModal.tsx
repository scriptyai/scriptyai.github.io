import { useState } from 'react';
import { X, Play, RotateCcw, Terminal, Copy, Check, Info } from 'lucide-react';
import { runLuaCode } from '../utils/luaRunner';
import { ExecutionResult } from '../types';

interface SandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCode?: string;
}

const DEFAULT_SANDBOX_CODE = `-- Interactive Lua 5.3 Virtual Machine
-- Test algorithms, math, string formatting, and metatables in real-time

local function fibonacci(n)
    local a, b = 0, 1
    for i = 1, n do
        a, b = b, a + b
    end
    return a
end

print("=== Lua Fibonacci Test ===")
for i = 1, 10 do
    print(string.format("Fibonacci(%d) = %d", i, fibonacci(i)))
end

-- Metatable test
local Point = {}
Point.__index = Point

function Point.new(x, y)
    return setmetatable({ x = x, y = y }, Point)
end

function Point:distance(other)
    local dx = self.x - other.x
    local dy = self.y - other.y
    return math.sqrt(dx * dx + dy * dy)
end

local p1 = Point.new(0, 0)
local p2 = Point.new(3, 4)
print(string.format("Distance between p1 and p2: %.2f", p1:distance(p2)))
`;

export function SandboxModal({ isOpen, onClose, initialCode }: SandboxModalProps) {
  const [code, setCode] = useState(initialCode || DEFAULT_SANDBOX_CODE);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleRun = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = runLuaCode(code);
      setResult(res);
      setIsRunning(false);
    }, 40);
  };

  const handleReset = () => {
    setCode(DEFAULT_SANDBOX_CODE);
    setResult(null);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Play className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                Interactive Lua 5.3 VM Sandbox
              </h2>
              <p className="text-xs text-slate-400">
                Execute and test standalone Lua code directly in your browser with real-time stdout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRun}
              disabled={isRunning}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{isRunning ? 'Running...' : 'Execute Script'}</span>
            </button>

            <button
              onClick={handleReset}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              title="Reset sample code"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
              title="Copy code"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <span className="w-px h-5 bg-slate-800 mx-1"></span>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Split View (Editor on Left, Output on Right) */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden bg-slate-950">
          {/* Editor */}
          <div className="flex flex-col h-full overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span>script.lua</span>
              <span className="text-[11px] text-slate-500">Ctrl+Enter to Run</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                  e.preventDefault();
                  handleRun();
                }
              }}
              spellCheck={false}
              className="w-full flex-1 p-4 bg-[#090d16] text-slate-100 font-mono text-xs leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-cyan-500/50 selection:bg-cyan-500/30"
            />
          </div>

          {/* Console Output */}
          <div className="flex flex-col h-full bg-slate-950 overflow-hidden">
            <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 text-xs text-slate-400 font-mono flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                Console Output
              </span>
              {result && (
                <span className={`text-[11px] px-1.5 py-0.2 rounded font-mono ${result.success ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
                  {result.durationMs}ms
                </span>
              )}
            </div>

            <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-2">
              {result ? (
                <>
                  {result.output && (
                    <pre className="text-emerald-300 whitespace-pre-wrap leading-relaxed">
                      {result.output}
                    </pre>
                  )}
                  {result.error && (
                    <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 whitespace-pre-wrap leading-relaxed">
                      {result.error}
                    </div>
                  )}
                </>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center p-6">
                  <Terminal className="w-8 h-8 mb-2 opacity-30" />
                  <p>Click "Execute Script" or press Ctrl+Enter to run your Lua code.</p>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Powered by pure Lua 5.3 bytecode VM with custom print interceptor
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
