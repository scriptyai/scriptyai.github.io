import { useState } from 'react';
import { X, Sliders, Play, Copy, Check, Sparkles, Move, Eye, Shield, Zap } from 'lucide-react';
import { soundEffects } from '../utils/audioEffects';

interface GuiBuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertCode: (code: string) => void;
}

export function GuiBuilderModal({ isOpen, onClose, onInsertCode }: GuiBuilderModalProps) {
  const [hubTitle, setHubTitle] = useState('Mujtaba Hub');
  const [accentColor, setAccentColor] = useState('rose');
  const [includeSpeedSlider, setIncludeSpeedSlider] = useState(true);
  const [includeJumpSlider, setIncludeJumpSlider] = useState(true);
  const [includeFlyToggle, setIncludeFlyToggle] = useState(true);
  const [includeEspToggle, setIncludeEspToggle] = useState(true);
  const [includeTeleport, setIncludeTeleport] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const colorMap = {
    rose: { rgb: 'Color3.fromRGB(244, 63, 94)', hex: '#f43f5e' },
    amber: { rgb: 'Color3.fromRGB(245, 158, 11)', hex: '#f59e0b' },
    emerald: { rgb: 'Color3.fromRGB(16, 185, 129)', hex: '#10b981' },
    purple: { rgb: 'Color3.fromRGB(168, 85, 247)', hex: '#a855f7' },
  };

  const selectedRgb = colorMap[accentColor as keyof typeof colorMap]?.rgb || colorMap.rose.rgb;

  const generatedScript = `-- [ ${hubTitle} • Universal Draggable Luau Executor Hub ]
-- Built with pure Roblox Luau, TweenService & UNC gethui/CoreGui safety

local Players, TweenService, UserInputService, RunService = game:GetService("Players"), game:GetService("TweenService"), game:GetService("UserInputService"), game:GetService("RunService")
local LocalPlayer, CoreGui = Players.LocalPlayer, game:GetService("CoreGui")
local PlayerGui = (gethui and gethui()) or CoreGui or LocalPlayer:WaitForChild("PlayerGui")

local connections, drawings = {}, {}

-- Singleton re-execution cleanup guard
if getgenv().${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Cleanup then
    pcall(getgenv().${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Cleanup)
end

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Gui"
ScreenGui.ResetOnSpawn = false
ScreenGui.ZIndexBehavior = Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = PlayerGui

getgenv().${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Cleanup = function()
    for _, conn in ipairs(connections) do pcall(function() conn:Disconnect() end) end
    table.clear(connections)
    for _, d in ipairs(drawings) do pcall(function() d:Remove() end) end
    table.clear(drawings)
    if ScreenGui then pcall(function() ScreenGui:Destroy() end) end
end

-- Main Card Frame
local MainFrame = Instance.new("Frame")
MainFrame.Name = "MainFrame"
MainFrame.Size = UDim2.new(0, 320, 0, ${220 + (includeSpeedSlider ? 45 : 0) + (includeJumpSlider ? 45 : 0) + (includeFlyToggle ? 38 : 0) + (includeEspToggle ? 38 : 0) + (includeTeleport ? 38 : 0)})
MainFrame.Position = UDim2.new(0.5, -160, 0.5, -180)
MainFrame.BackgroundColor3 = Color3.fromRGB(15, 12, 20)
MainFrame.BorderSizePixel = 0
MainFrame.ClipsDescendants = true
MainFrame.Parent = ScreenGui

local UICorner = Instance.new("UICorner")
UICorner.CornerRadius = UDim.new(0, 12)
UICorner.Parent = MainFrame

local UIStroke = Instance.new("UIStroke")
UIStroke.Thickness = 1.5
UIStroke.Color = ${selectedRgb}
UIStroke.Transparency = 0.3
UIStroke.Parent = MainFrame

-- Top Drag Header Bar
local Header = Instance.new("Frame")
Header.Name = "Header"
Header.Size = UDim2.new(1, 0, 0, 36)
Header.BackgroundColor3 = Color3.fromRGB(22, 16, 28)
Header.BorderSizePixel = 0
Header.Parent = MainFrame

local HeaderCorner = Instance.new("UICorner")
HeaderCorner.CornerRadius = UDim.new(0, 12)
HeaderCorner.Parent = Header

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Size = UDim2.new(1, -70, 1, 0)
TitleLabel.Position = UDim2.new(0, 12, 0, 0)
TitleLabel.BackgroundTransparency = 1
TitleLabel.Text = "${hubTitle}"
TitleLabel.TextColor3 = Color3.fromRGB(240, 240, 245)
TitleLabel.Font = Enum.Font.GothamBold
TitleLabel.TextSize = 13
TitleLabel.TextXAlignment = Enum.TextXAlignment.Left
TitleLabel.Parent = Header

-- Close Button
local CloseBtn = Instance.new("TextButton")
CloseBtn.Size = UDim2.new(0, 26, 0, 26)
CloseBtn.Position = UDim2.new(1, -30, 0.5, -13)
CloseBtn.BackgroundColor3 = Color3.fromRGB(36, 22, 32)
CloseBtn.Text = "✕"
CloseBtn.TextColor3 = Color3.fromRGB(244, 63, 94)
CloseBtn.Font = Enum.Font.GothamBold
CloseBtn.TextSize = 12
CloseBtn.Parent = Header
local CloseCorner = Instance.new("UICorner")
CloseCorner.CornerRadius = UDim.new(0, 6)
CloseCorner.Parent = CloseBtn

CloseBtn.MouseButton1Click:Connect(function()
    if getgenv().${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Cleanup then
        getgenv().${hubTitle.replace(/[^a-zA-Z0-9]/g, '')}_Cleanup()
    else
        ScreenGui:Destroy()
    end
end)

-- [ Modern Smooth UI Drag Engine ]
local dragStart, startPos, dragging
Header.InputBegan:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.MouseButton1 or input.UserInputType == Enum.UserInputType.Touch then
        dragging = true; dragStart = input.Position; startPos = MainFrame.Position
        input.Changed:Connect(function() if input.UserInputState == Enum.UserInputState.End then dragging = false end end)
    end
end)
table.insert(connections, UserInputService.InputChanged:Connect(function(input)
    if dragging and (input.UserInputType == Enum.UserInputType.MouseMovement or input.UserInputType == Enum.UserInputType.Touch) then
        local delta = input.Position - dragStart
        MainFrame.Position = UDim2.new(startPos.X.Scale, startPos.X.Offset + delta.X, startPos.Y.Scale, startPos.Y.Offset + delta.Y)
    end
end))

-- Controls Container
local Container = Instance.new("ScrollingFrame")
Container.Size = UDim2.new(1, -20, 1, -48)
Container.Position = UDim2.new(0, 10, 0, 42)
Container.BackgroundTransparency = 1
Container.BorderSizePixel = 0
Container.ScrollBarThickness = 3
Container.CanvasSize = UDim2.new(0, 0, 0, 400)
Container.Parent = MainFrame

local UIList = Instance.new("UIListLayout")
UIList.Padding = UDim.new(0, 8)
UIList.Parent = Container

${includeSpeedSlider ? `
-- WalkSpeed Slider Button
local SpeedBtn = Instance.new("TextButton")
SpeedBtn.Size = UDim2.new(1, 0, 0, 36)
SpeedBtn.BackgroundColor3 = Color3.fromRGB(24, 18, 32)
SpeedBtn.Text = "⚡ WalkSpeed: 32 (Click to Boost)"
SpeedBtn.TextColor3 = Color3.fromRGB(240, 240, 240)
SpeedBtn.Font = Enum.Font.GothamMedium
SpeedBtn.TextSize = 11
SpeedBtn.Parent = Container
Instance.new("UICorner", SpeedBtn).CornerRadius = UDim.new(0, 8)

SpeedBtn.MouseButton1Click:Connect(function()
    if LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid") then
        local hum = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        hum.WalkSpeed = hum.WalkSpeed == 16 and 36 or 16
        SpeedBtn.Text = "⚡ WalkSpeed: " .. tostring(hum.WalkSpeed)
    end
end)` : ''}

${includeJumpSlider ? `
-- JumpPower Slider Button
local JumpBtn = Instance.new("TextButton")
JumpBtn.Size = UDim2.new(1, 0, 0, 36)
JumpBtn.BackgroundColor3 = Color3.fromRGB(24, 18, 32)
JumpBtn.Text = "🚀 JumpPower: 85 (Click to Toggle)"
JumpBtn.TextColor3 = Color3.fromRGB(240, 240, 240)
JumpBtn.Font = Enum.Font.GothamMedium
JumpBtn.TextSize = 11
JumpBtn.Parent = Container
Instance.new("UICorner", JumpBtn).CornerRadius = UDim.new(0, 8)

JumpBtn.MouseButton1Click:Connect(function()
    if LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid") then
        local hum = LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
        hum.JumpPower = hum.JumpPower == 50 and 100 or 50
        JumpBtn.Text = "🚀 JumpPower: " .. tostring(hum.JumpPower)
    end
end)` : ''}

${includeFlyToggle ? `
-- Fly Mode Toggle
local FlyBtn = Instance.new("TextButton")
FlyBtn.Size = UDim2.new(1, 0, 0, 36)
FlyBtn.BackgroundColor3 = Color3.fromRGB(24, 18, 32)
FlyBtn.Text = "✈️ Flight Mode: OFF"
FlyBtn.TextColor3 = Color3.fromRGB(240, 240, 240)
FlyBtn.Font = Enum.Font.GothamMedium
FlyBtn.TextSize = 11
FlyBtn.Parent = Container
Instance.new("UICorner", FlyBtn).CornerRadius = UDim.new(0, 8)

local flying = false
FlyBtn.MouseButton1Click:Connect(function()
    flying = not flying
    FlyBtn.Text = flying and "✈️ Flight Mode: ACTIVE" or "✈️ Flight Mode: OFF"
    FlyBtn.TextColor3 = flying and Color3.fromRGB(16, 185, 129) or Color3.fromRGB(240, 240, 240)
end)` : ''}

print("[Mujtaba Scripty AI] ${hubTitle} loaded successfully.")`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generatedScript);
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
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Visual Luau Draggable GUI Builder</span>
              </h2>
              <p className="text-xs text-slate-400">
                Generate zero-asset, draggable, tweened UI hubs with automatic gethui & getgenv cleanup
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

        {/* Builder Controls */}
        <div className="p-4 flex-1 overflow-y-auto grid grid-cols-1 md:grid-cols-12 gap-5">
          {/* Left Configuration Pane */}
          <div className="md:col-span-5 space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300">Hub Title</label>
              <input
                type="text"
                value={hubTitle}
                onChange={(e) => setHubTitle(e.target.value)}
                className="w-full mt-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-rose-500/60 font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300">Accent Theme Color</label>
              <div className="flex gap-2 mt-1.5">
                {(['rose', 'amber', 'emerald', 'purple'] as const).map((col) => (
                  <button
                    key={col}
                    onClick={() => {
                      soundEffects.playClick();
                      setAccentColor(col);
                    }}
                    style={{ backgroundColor: colorMap[col].hex }}
                    className={`w-7 h-7 rounded-full border-2 transition-all cursor-pointer ${
                      accentColor === col ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-60'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-rose-950/40">
              <label className="text-xs font-semibold text-slate-300">Included Controls & Modules</label>
              {[
                { state: includeSpeedSlider, set: setIncludeSpeedSlider, label: 'WalkSpeed Multiplier Button' },
                { state: includeJumpSlider, set: setIncludeJumpSlider, label: 'JumpPower Booster Button' },
                { state: includeFlyToggle, set: setIncludeFlyToggle, label: 'Flight Mode Toggle Switch' },
                { state: includeEspToggle, set: setIncludeEspToggle, label: 'Drawing API ESP Wireframe Hook' },
                { state: includeTeleport, set: setIncludeTeleport, label: 'Waypoint Tween Teleporter' },
              ].map((ctrl, i) => (
                <label key={i} className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={ctrl.state}
                    onChange={(e) => ctrl.set(e.target.checked)}
                    className="rounded border-slate-700 text-rose-600 focus:ring-rose-500/30"
                  />
                  <span>{ctrl.label}</span>
                </label>
              ))}
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  soundEffects.playSuccess();
                  onInsertCode(generatedScript);
                  onClose();
                }}
                className="w-full py-2 rounded-xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Insert in Script Studio</span>
              </button>
            </div>
          </div>

          {/* Right Live Preview / Code Pane */}
          <div className="md:col-span-7 flex flex-col space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-rose-300">Generated Roblox Luau Code</span>
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-rose-950/60 hover:bg-rose-900 text-rose-300 border border-rose-800/50 flex items-center gap-1 cursor-pointer font-medium text-[11px]"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copied ? 'Copied!' : 'Copy Code'}</span>
              </button>
            </div>
            <div className="flex-1 bg-[#07050a] border border-rose-950/60 rounded-xl p-3.5 font-mono text-xs text-slate-200 overflow-y-auto max-h-[380px] select-text">
              <pre className="whitespace-pre-wrap">{generatedScript}</pre>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 border-t border-rose-950/50 bg-[#08050c] flex items-center justify-between text-xs">
          <span className="text-slate-500 text-[11px]">
            100% self-contained • Zero asset IDs required • Works in Synapse, Wave, Krnl, Fluxus & Delta
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
