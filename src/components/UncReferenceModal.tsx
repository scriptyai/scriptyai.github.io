import { useState } from 'react';
import { X, Search, Terminal, Copy, Check, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface UncReferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCodeSnippet?: (snippet: string) => void;
}

interface UncFunctionDoc {
  name: string;
  category: 'Environment' | 'UI & Rendering' | 'Filesystem' | 'Networking' | 'Memory & Hooking';
  signature: string;
  description: string;
  example: string;
  supportLevel: '100% UNC Standard' | 'Universal (All Executors)' | 'Modern UNC';
}

const UNC_DOCS: UncFunctionDoc[] = [
  {
    name: 'getgenv',
    category: 'Environment',
    signature: 'getgenv(): { [string]: any }',
    description: 'Returns the shared global executor environment table. Use this to persist variables, toggles, and register cleanup functions between script executions.',
    example: `if getgenv().MyScript_Active then
    print("Script already running! Cleaning up...")
    pcall(getgenv().MyScript_Cleanup)
end
getgenv().MyScript_Active = true
getgenv().MyScript_Cleanup = function()
    getgenv().MyScript_Active = false
    print("Cleaned up session.")
end`,
    supportLevel: 'Universal (All Executors)',
  },
  {
    name: 'gethui',
    category: 'UI & Rendering',
    signature: 'gethui(): Instance',
    description: 'Returns a safe, hidden CoreGui container instance that prevents game scripts and anti-cheat scanners from detecting, scanning, or destroying your UI elements.',
    example: `local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "SecretCheatHUD"
ScreenGui.ResetOnSpawn = false
-- Safe parenting with fallbacks:
ScreenGui.Parent = (gethui and gethui()) or game:GetService("CoreGui") or game:GetService("Players").LocalPlayer.PlayerGui`,
    supportLevel: 'Universal (All Executors)',
  },
  {
    name: 'identifyexecutor',
    category: 'Environment',
    signature: 'identifyexecutor(): (name: string, version: string)',
    description: 'Returns the name and version of the currently attached Roblox executor (e.g. "Synapse X", "Wave", "Krnl", "Delta", "Fluxus", "Codex").',
    example: `local name, version = identifyexecutor()
print(string.format("Running on executor: %s (v%s)", name or "Unknown", version or "1.0"))`,
    supportLevel: '100% UNC Standard',
  },
  {
    name: 'Drawing.new',
    category: 'UI & Rendering',
    signature: 'Drawing.new(drawingType: "Square" | "Line" | "Circle" | "Text"): DrawingObject',
    description: 'Creates a hardware-accelerated 2D drawing primitive rendered directly on the screen viewport above all game instances with zero Roblox Gui overhead.',
    example: `local line = Drawing.new("Line")
line.Color = Color3.fromRGB(0, 255, 200)
line.Thickness = 2
line.From = Vector2.new(100, 100)
line.To = Vector2.new(300, 300)
line.Visible = true

-- Cleanup when done
-- line:Remove()`,
    supportLevel: '100% UNC Standard',
  },
  {
    name: 'setclipboard',
    category: 'Environment',
    signature: 'setclipboard(text: string): ()',
    description: 'Copies text or formatted CFrames/asset IDs directly to the user OS system clipboard.',
    example: `local pos = game.Players.LocalPlayer.Character.HumanoidRootPart.Position
setclipboard(string.format("CFrame.new(%.2f, %.2f, %.2f)", pos.X, pos.Y, pos.Z))
print("Position copied to clipboard!")`,
    supportLevel: 'Universal (All Executors)',
  },
  {
    name: 'request / http_request',
    category: 'Networking',
    signature: 'request({ Url: string, Method: "GET" | "POST", Headers?: {}, Body?: string }): HttpResponse',
    description: 'Sends external HTTP requests bypassing Roblox HttpService restrictions. Ideal for Discord webhooks, raw GitHub raw scripts, or fetching custom JSON data.',
    example: `local http = request or http_request or (syn and syn.request)
if http then
    local response = http({
        Url = "https://httpbin.org/get",
        Method = "GET"
    })
    print("HTTP Response status:", response.StatusCode)
end`,
    supportLevel: '100% UNC Standard',
  },
  {
    name: 'writefile / readfile',
    category: 'Filesystem',
    signature: 'writefile(filename: string, content: string): ()',
    description: 'Saves and loads user preferences or custom settings directly into the executor workspace directory on the player hard drive.',
    example: `local HttpService = game:GetService("HttpService")
local config = { WalkSpeed = 32, JumpPower = 80, AutoFarm = true }

-- Save config
writefile("Mujtaba_Config.json", HttpService:JSONEncode(config))

-- Load config
if isfile("Mujtaba_Config.json") then
    local loaded = HttpService:JSONDecode(readfile("Mujtaba_Config.json"))
    print("Loaded speed setting:", loaded.WalkSpeed)
end`,
    supportLevel: '100% UNC Standard',
  },
  {
    name: 'hookfunction',
    category: 'Memory & Hooking',
    signature: 'hookfunction(targetFunc: Function, hookFunc: Function): Function',
    description: 'Hooks and intercepts calls to any Lua function or metamethod (such as __namecall or __index), allowing modification of parameters or blocking outgoing remotes.',
    example: `local oldNamecall
oldNamecall = hookmetamethod(game, "__namecall", function(self, ...)
    local method = getnamecallmethod()
    local args = {...}
    if method == "FireServer" and self.Name == "BanRemote" then
        warn("Blocked suspicious ban remote invocation!")
        return nil
    end
    return oldNamecall(self, ...)
end)`,
    supportLevel: 'Modern UNC',
  },
];

export function UncReferenceModal({ isOpen, onClose, onInsertCodeSnippet }: UncReferenceModalProps) {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [copiedName, setCopiedName] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['all', 'Environment', 'UI & Rendering', 'Networking', 'Filesystem', 'Memory & Hooking'];

  const filtered = UNC_DOCS.filter((doc) => {
    const matchesCat = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch =
      doc.name.toLowerCase().includes(search.toLowerCase()) ||
      doc.description.toLowerCase().includes(search.toLowerCase()) ||
      doc.signature.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleCopyExample = async (example: string, name: string) => {
    await navigator.clipboard.writeText(example);
    soundEffects.playSuccess();
    setCopiedName(name);
    setTimeout(() => setCopiedName(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#090d18] border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 flex items-center gap-2">
                <span>Unified Naming Convention (UNC) API Reference</span>
              </h2>
              <p className="text-xs text-slate-400">
                Standardized APIs supported across Synapse, Wave, Krnl, Delta, Fluxus, and Codex
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

        {/* Search & Category Filter */}
        <div className="p-3.5 border-b border-slate-800 bg-[#070b14] flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search functions (e.g. getgenv, Drawing, request)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/60"
            />
          </div>

          <div className="flex flex-wrap gap-1 w-full sm:w-auto overflow-x-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  soundEffects.playClick();
                  setActiveCategory(cat);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
                }`}
              >
                {cat === 'all' ? 'All APIs' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* List of Docs */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {filtered.map((doc) => (
            <div
              key={doc.name}
              className="p-4 rounded-xl border border-slate-800 bg-slate-950/60 hover:border-amber-500/40 transition-all space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-amber-300 font-bold text-sm bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800/40">
                    {doc.name}
                  </span>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 font-mono">
                    {doc.category}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-medium">
                    ✓ {doc.supportLevel}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onInsertCodeSnippet && (
                    <button
                      onClick={() => {
                        onInsertCodeSnippet(doc.example);
                        soundEffects.playClick();
                        onClose();
                      }}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
                    >
                      Insert in Prompt
                    </button>
                  )}
                  <button
                    onClick={() => handleCopyExample(doc.example, doc.name)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800/50 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    {copiedName === doc.name ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedName === doc.name ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{doc.description}</p>

              <div className="rounded-lg bg-[#070a12] p-3 border border-slate-800/80 font-mono text-[11px] text-slate-300 overflow-x-auto">
                <pre>{doc.example}</pre>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
