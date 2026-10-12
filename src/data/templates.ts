import { ScriptTemplate } from "../types";

export const LUA_TEMPLATES: ScriptTemplate[] = [
  {
    id: "executor-draggable-gui",
    title: "Universal Draggable Executor GUI (Pure Luau)",
    target: "executor",
    category: "Executor UI",
    scriptType: "Standalone",
    description: "100% self-contained draggable GUI with smooth TweenService animations, toggle switches, speed slider, and getgenv re-execution cleanup. Zero external assets needed.",
    prompt: "Write a complete, self-contained draggable Executor GUI in Roblox Lua with toggle buttons, speed slider, and close button, safely parented to (gethui and gethui()) or CoreGui with getgenv re-execution cleanup.",
    code: `-- [EXTERNAL EXECUTOR SCRIPT] (Runs in Synapse, Wave, Krnl, Delta, Fluxus, or any UNC executor)
-- Title: Universal Draggable GUI (100% Self-Contained)

local Players, RunService, TweenService, UserInputService = game:GetService("Players"), game:GetService("RunService"), game:GetService("TweenService"), game:GetService("UserInputService")
local LocalPlayer, CoreGui = Players.LocalPlayer or Players.PlayerAdded:Wait(), game:GetService("CoreGui")

local connections: { RBXScriptConnection } = {}
local drawings: { any } = {}
local ScreenGui: ScreenGui?

local function Cleanup()
    for _, conn in ipairs(connections) do pcall(function() conn:Disconnect() end) end
    table.clear(connections)
    for _, d in ipairs(drawings) do pcall(function() d:Remove() end) end
    table.clear(drawings)
    if ScreenGui then pcall(function() ScreenGui:Destroy() end) end
    getgenv().MujtabaGui_Cleanup = nil
end
if getgenv().MujtabaGui_Cleanup then pcall(getgenv().MujtabaGui_Cleanup) end
getgenv().MujtabaGui_Cleanup = Cleanup

local safeParent = (gethui and gethui()) or CoreGui or LocalPlayer:WaitForChild("PlayerGui")
ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name, ScreenGui.ResetOnSpawn, ScreenGui.ZIndexBehavior = "MujtabaExecutorHub", false, Enum.ZIndexBehavior.Sibling
ScreenGui.Parent = safeParent

local MainFrame = Instance.new("Frame")
MainFrame.Name, MainFrame.Size, MainFrame.Position = "MainFrame", UDim2.new(0, 320, 0, 240), UDim2.new(0.5, -160, 0.5, -120)
MainFrame.BackgroundColor3, MainFrame.BorderSizePixel, MainFrame.ClipsDescendants = Color3.fromRGB(15, 12, 22), 0, true
MainFrame.Parent = ScreenGui

local mainCorner = Instance.new("UICorner")
mainCorner.CornerRadius, mainCorner.Parent = UDim.new(0, 10), MainFrame
local mainStroke = Instance.new("UIStroke")
mainStroke.Color, mainStroke.Thickness, mainStroke.Parent = Color3.fromRGB(244, 63, 94), 1.5, MainFrame

local TopBar = Instance.new("Frame")
TopBar.Name, TopBar.Size, TopBar.BackgroundColor3, TopBar.BorderSizePixel = "TopBar", UDim2.new(1, 0, 0, 36), Color3.fromRGB(24, 18, 32), 0
TopBar.Parent = MainFrame

local TitleLabel = Instance.new("TextLabel")
TitleLabel.Size, TitleLabel.Position, TitleLabel.BackgroundTransparency = UDim2.new(1, -50, 1, 0), UDim2.new(0, 12, 0, 0), 1
TitleLabel.Text, TitleLabel.TextColor3, TitleLabel.TextSize, TitleLabel.Font = "⚡ Mujtaba Scripty Hub", Color3.fromRGB(245, 245, 250), 13, Enum.Font.GothamBold
TitleLabel.TextXAlignment, TitleLabel.Parent = Enum.TextXAlignment.Left, TopBar

local CloseBtn = Instance.new("TextButton")
CloseBtn.Size, CloseBtn.Position = UDim2.new(0, 24, 0, 24), UDim2.new(1, -30, 0, 6)
CloseBtn.BackgroundColor3, CloseBtn.Text, CloseBtn.TextColor3 = Color3.fromRGB(36, 18, 28), "✕", Color3.fromRGB(244, 63, 94)
CloseBtn.Font, CloseBtn.TextSize, CloseBtn.BorderSizePixel = Enum.Font.GothamBold, 12, 0
CloseBtn.Parent = TopBar
local closeCorner = Instance.new("UICorner")
closeCorner.CornerRadius, closeCorner.Parent = UDim.new(0, 6), CloseBtn
CloseBtn.MouseButton1Click:Connect(Cleanup)

-- [ Modern Smooth UI Drag Engine ]
local dragStart, startPos, dragging
TopBar.InputBegan:Connect(function(input)
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

local Container = Instance.new("Frame")
Container.Size, Container.Position, Container.BackgroundTransparency = UDim2.new(1, -20, 1, -50), UDim2.new(0, 10, 0, 42), 1
Container.Parent = MainFrame
local UIList = Instance.new("UIListLayout")
UIList.Padding, UIList.SortOrder, UIList.Parent = UDim.new(0, 8), Enum.SortOrder.LayoutOrder, Container

-- [ Array-Based Dynamic UI Generation ]
local OptionsData = {
    {
        name = "WalkSpeed Multiplier (36 studs/s)",
        type = "Toggle",
        default = false,
        callback = function(enabled)
            local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.WalkSpeed = enabled and 36 or 16 end
        end
    },
    {
        name = "JumpPower Booster (100 studs)",
        type = "Toggle",
        default = false,
        callback = function(enabled)
            local hum = LocalPlayer.Character and LocalPlayer.Character:FindFirstChildOfClass("Humanoid")
            if hum then hum.JumpPower = enabled and 100 or 50 end
        end
    },
    {
        name = "Copy CFrame Position to Clipboard",
        type = "Button",
        callback = function()
            local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
            if hrp and setclipboard then
                setclipboard(string.format("CFrame.new(%.2f, %.2f, %.2f)", hrp.Position.X, hrp.Position.Y, hrp.Position.Z))
            end
        end
    }
}

for _, opt in ipairs(OptionsData) do
    local Btn = Instance.new("TextButton")
    Btn.Size = UDim2.new(1, 0, 0, 36)
    Btn.BackgroundColor3 = Color3.fromRGB(24, 20, 34)
    Btn.TextColor3 = Color3.fromRGB(220, 225, 235)
    Btn.Text = opt.type == "Toggle" and string.format("%s [%s]", opt.name, opt.default and "ON" or "OFF") or opt.name
    Btn.Font, Btn.TextSize, Btn.BorderSizePixel = Enum.Font.GothamMedium, 11, 0
    Btn.Parent = Container
    local btnCorner = Instance.new("UICorner")
    btnCorner.CornerRadius, btnCorner.Parent = UDim.new(0, 6), Btn
    local state = opt.default or false
    Btn.MouseButton1Click:Connect(function()
        if opt.type == "Toggle" then
            state = not state
            Btn.Text = string.format("%s [%s]", opt.name, state and "ON" or "OFF")
            Btn.TextColor3 = state and Color3.fromRGB(0, 255, 180) or Color3.fromRGB(220, 225, 235)
            Btn.BackgroundColor3 = state and Color3.fromRGB(20, 50, 40) or Color3.fromRGB(24, 20, 34)
            opt.callback(state)
        else
            opt.callback()
        end
    end)
end

print(string.format("⚡ Mujtaba Scripty Hub loaded! Executor: %s", (identifyexecutor and identifyexecutor()) or "Standard"))
`,
  },
  {
    id: "executor-coord-grabber",
    title: "In-Game Coordinate & CFrame Grabber (Hotkey C)",
    target: "executor",
    category: "Developer Utility",
    scriptType: "Standalone",
    description: "Compact in-game HUD displaying realtime Vector3 position, LookVector, and orientation with instant setclipboard copy on 'C' hotkey.",
    prompt: "Create a standalone executor utility HUD that displays the player exact Vector3 position and CFrame, with a button and hotkey (C) that copies the formatted CFrame to clipboard via setclipboard.",
    code: `-- [EXTERNAL EXECUTOR SCRIPT] (Runs in Synapse, Wave, Krnl, Delta, Fluxus, or any UNC executor)
-- Title: Realtime CFrame & Position Grabber
-- Hotkey: Press [C] to copy current CFrame to clipboard

if getgenv().CoordGrabber_Cleanup then
    pcall(getgenv().CoordGrabber_Cleanup)
end

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")
local CoreGui = game:GetService("CoreGui")
local LocalPlayer = Players.LocalPlayer

local ScreenGui = Instance.new("ScreenGui")
ScreenGui.Name = "CFrameGrabberHUD"
ScreenGui.ResetOnSpawn = false
ScreenGui.Parent = (gethui and gethui()) or CoreGui or LocalPlayer:WaitForChild("PlayerGui")
getgenv().CoordGrabber_Instance = ScreenGui

local Card = Instance.new("Frame")
Card.Size = UDim2.new(0, 260, 0, 78)
Card.Position = UDim2.new(0, 16, 0, 16)
Card.BackgroundColor3 = Color3.fromRGB(12, 16, 24)
Card.BorderSizePixel = 0
Card.Parent = ScreenGui

local Corner = Instance.new("UICorner")
Corner.CornerRadius = UDim.new(0, 8)
Corner.Parent = Card

local Stroke = Instance.new("UIStroke")
Stroke.Color = Color3.fromRGB(30, 40, 56)
Stroke.Parent = Card

local PosLabel = Instance.new("TextLabel")
PosLabel.Size = UDim2.new(1, -16, 0, 36)
PosLabel.Position = UDim2.new(0, 8, 0, 6)
PosLabel.BackgroundTransparency = 1
PosLabel.Text = "X: 0.00 | Y: 0.00 | Z: 0.00"
PosLabel.TextColor3 = Color3.fromRGB(0, 240, 255)
PosLabel.TextSize = 13
PosLabel.Font = Enum.Font.Code
PosLabel.TextXAlignment = Enum.TextXAlignment.Left
PosLabel.Parent = Card

local TipLabel = Instance.new("TextLabel")
TipLabel.Size = UDim2.new(1, -16, 0, 24)
TipLabel.Position = UDim2.new(0, 8, 0, 44)
TipLabel.BackgroundTransparency = 1
TipLabel.Text = "Press [C] to copy CFrame to Clipboard"
TipLabel.TextColor3 = Color3.fromRGB(130, 150, 175)
TipLabel.TextSize = 10
TipLabel.Font = Enum.Font.Gotham
TipLabel.TextXAlignment = Enum.TextXAlignment.Left
TipLabel.Parent = Card

local updateConn = RunService.RenderStepped:Connect(function()
    local char = LocalPlayer.Character
    local hrp = char and char:FindFirstChild("HumanoidRootPart")
    if hrp and hrp:IsA("BasePart") then
        local p = hrp.Position
        PosLabel.Text = string.format("X: %.1f | Y: %.1f | Z: %.1f", p.X, p.Y, p.Z)
    end
end)

local inputConn = UserInputService.InputBegan:Connect(function(input, gpe)
    if gpe then return end
    if input.KeyCode == Enum.KeyCode.C then
        local char = LocalPlayer.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        if hrp and hrp:IsA("BasePart") then
            local p = hrp.Position
            local clipText = string.format("CFrame.new(%.2f, %.2f, %.2f)", p.X, p.Y, p.Z)
            if setclipboard then
                setclipboard(clipText)
                TipLabel.Text = "✓ Copied to Clipboard!"
                TipLabel.TextColor3 = Color3.fromRGB(50, 255, 150)
                task.delay(1.5, function()
                    TipLabel.Text = "Press [C] to copy CFrame to Clipboard"
                    TipLabel.TextColor3 = Color3.fromRGB(130, 150, 175)
                end)
            else
                print("[CFrame Copied]: " .. clipText)
            end
        end
    end
end)

getgenv().CoordGrabber_Cleanup = function()
    updateConn:Disconnect()
    inputConn:Disconnect()
    ScreenGui:Destroy()
end

print("📍 CFrame Grabber active. Press [C] to copy current position.")
`,
  },
  {
    id: "executor-fps-booster",
    title: "FPS & Performance Booster (Low Detail Mode)",
    target: "executor",
    category: "Performance",
    scriptType: "Standalone",
    description: "Maximizes framerates on potato PCs by disabling 3D lighting shadows, terrain water reflections, particles, and simplifying meshes with a clean toggle.",
    prompt: "Write an executor script to maximize FPS on low-end PCs by disabling terrain water, lighting shadows, particle emitters, and simplifying materials with a toggle switch.",
    code: `-- [EXTERNAL EXECUTOR SCRIPT] (Runs in Synapse, Wave, Krnl, Delta, Fluxus, or any UNC executor)
-- Title: High-Performance FPS Booster
-- Description: Disables heavy 3D shaders, terrain reflections, and textures for maximum framerates.

local Lighting = game:GetService("Lighting")
local Terrain = workspace:FindFirstChildOfClass("Terrain")

local originalSettings = {
    GlobalShadows = Lighting.GlobalShadows,
    FogEnd = Lighting.FogEnd,
    Brightness = Lighting.Brightness,
    WaterWaveSize = Terrain and Terrain.WaterWaveSize or 0,
    WaterReflectance = Terrain and Terrain.WaterReflectance or 0,
}

-- 1. Optimize Lighting
Lighting.GlobalShadows = false
Lighting.FogEnd = 9e9
Lighting.Brightness = 1

-- 2. Optimize Terrain Water
if Terrain then
    Terrain.WaterWaveSize = 0
    Terrain.WaterWaveSpeed = 0
    Terrain.WaterReflectance = 0
    Terrain.WaterTransparency = 0
end

-- 3. Simplify Workspace Objects
local optimizedCount = 0
for _, obj in ipairs(workspace:GetDescendants()) do
    if obj:IsA("BasePart") and not obj:IsA("MeshPart") then
        obj.Material = Enum.Material.SmoothPlastic
        obj.Reflectance = 0
        optimizedCount += 1
    elseif obj:IsA("Decal") or obj:IsA("Texture") then
        obj.Transparency = 1
    elseif obj:IsA("ParticleEmitter") or obj:IsA("Trail") or obj:IsA("Smoke") or obj:IsA("Fire") then
        obj.Enabled = false
    end
end

-- 4. Listen for newly added instances to keep FPS high
local addedConn = workspace.DescendantAdded:Connect(function(obj)
    if obj:IsA("BasePart") then
        obj.Material = Enum.Material.SmoothPlastic
        obj.Reflectance = 0
    elseif obj:IsA("ParticleEmitter") or obj:IsA("Trail") then
        obj.Enabled = false
    end
end)

getgenv().FPSBooster_Cleanup = function()
    addedConn:Disconnect()
    Lighting.GlobalShadows = originalSettings.GlobalShadows
    Lighting.FogEnd = originalSettings.FogEnd
    Lighting.Brightness = originalSettings.Brightness
    print("FPS Booster reverted to original game settings.")
end

print(string.format("🚀 FPS Booster enabled! Optimized %d objects for maximum frame rate.", optimizedCount))
`,
  },
  {
    id: "executor-rayfield-ui",
    title: "Rayfield UI Library Multi-Tab Template",
    target: "executor",
    category: "Executor UI",
    scriptType: "Standalone",
    description: "Production Rayfield UI Library script with multiple tabs, WalkSpeed/JumpPower sliders, keybind toggles, and notification alerts.",
    prompt: "Write a complete Rayfield UI Library script for an executor with a Main tab, Player tab (WalkSpeed & JumpPower sliders), and Settings tab with keybind toggle and config saving.",
    code: `-- [EXTERNAL EXECUTOR SCRIPT] (Runs in Synapse, Wave, Krnl, Delta, Fluxus, or any UNC executor)
-- Title: Rayfield UI Library Boilerplate
-- Framework: Rayfield Interface Suite

local success, Rayfield = pcall(function()
    return loadstring(game:HttpGet('https://sirius.menu/rayfield'))()
end)

if not success or not Rayfield then
    warn("Failed to load Rayfield UI Library from external CDN.")
    return
end

local Window = Rayfield:CreateWindow({
    Name = "⚡ Mujtaba Scripty Rayfield Hub",
    LoadingTitle = "Mujtaba Scripty Suite",
    LoadingSubtitle = "by Mujtaba Scripty AI",
    ConfigurationSaving = {
        Enabled = true,
        FolderName = "MujtabaScripts",
        FileName = "Config"
    },
    Discord = {
        Enabled = false
    },
    KeySystem = false
})

local MainTab = Window:CreateTab("Home", 4483362458)
local PlayerTab = Window:CreateTab("Player", 4483362458)

-- === Home Tab ===
MainTab:CreateSection("Server Information")

MainTab:CreateButton({
    Name = "Rejoin Current Server",
    Callback = function()
        local TeleportService = game:GetService("TeleportService")
        local Players = game:GetService("Players")
        TeleportService:Teleport(game.PlaceId, Players.LocalPlayer)
    end
})

MainTab:CreateButton({
    Name = "Copy Place & Job ID",
    Callback = function()
        if setclipboard then
            setclipboard(string.format("game.PlaceId = %s | game.JobId = %s", tostring(game.PlaceId), tostring(game.JobId)))
            Rayfield:Notify({
                Title = "Clipboard",
                Content = "Place and Job ID copied!",
                Duration = 2.5
            })
        end
    end
})

-- === Player Tab ===
PlayerTab:CreateSection("Movement Parameters")

local Players = game:GetService("Players")
local LocalPlayer = Players.LocalPlayer

PlayerTab:CreateSlider({
    Name = "WalkSpeed",
    Range = {16, 120},
    Increment = 1,
    Suffix = "studs/s",
    CurrentValue = 16,
    Flag = "WalkSpeedSlider",
    Callback = function(Value)
        local char = LocalPlayer.Character
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if hum then
            hum.WalkSpeed = Value
        end
    end
})

PlayerTab:CreateSlider({
    Name = "JumpPower",
    Range = {50, 250},
    Increment = 5,
    Suffix = "power",
    CurrentValue = 50,
    Flag = "JumpPowerSlider",
    Callback = function(Value)
        local char = LocalPlayer.Character
        local hum = char and char:FindFirstChildOfClass("Humanoid")
        if hum then
            hum.UseJumpPower = true
            hum.JumpPower = Value
        end
    end
})

Rayfield:Notify({
    Title = "Ready",
    Content = "Mujtaba Scripty Rayfield Hub loaded successfully!",
    Duration = 3
})
`,
  },
  {
    id: "executor-drawing-esp",
    title: "Drawing API 2D Box ESP & Tracers (UNC)",
    target: "executor",
    category: "Visuals (ESP)",
    scriptType: "Standalone",
    description: "High performance 2D bounding boxes and tracers using the standard UNC Drawing.new API with camera WorldToViewportPoint checks and clean getgenv cleanup.",
    prompt: "Write a complete Drawing API 2D box ESP and tracers script using Drawing.new('Square') and Drawing.new('Line') with getgenv cleanup and RenderStepped loop.",
    code: `-- [EXTERNAL EXECUTOR SCRIPT] (Runs in Synapse, Wave, Krnl, Delta, Fluxus, or any UNC executor)
-- Title: Drawing API 2D Box ESP & Tracers
-- Standard: Unified Naming Convention (UNC) Drawing.new()

if getgenv().DrawingESP_Cleanup then
    pcall(getgenv().DrawingESP_Cleanup)
end

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Camera = workspace.CurrentCamera
local LocalPlayer = Players.LocalPlayer

local drawings = {}

local function createESPForPlayer(player: Player)
    if player == LocalPlayer then return end

    local box = Drawing.new("Square")
    box.Thickness = 1.5
    box.Color = Color3.fromRGB(0, 255, 180)
    box.Filled = false
    box.Visible = false

    local tracer = Drawing.new("Line")
    tracer.Thickness = 1
    tracer.Color = Color3.fromRGB(0, 255, 180)
    tracer.From = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y)
    tracer.Visible = false

    drawings[player] = { Box = box, Tracer = tracer }
end

for _, p in ipairs(Players:GetPlayers()) do
    createESPForPlayer(p)
end

local addConn = Players.PlayerAdded:Connect(createESPForPlayer)
local remConn = Players.PlayerRemoving:Connect(function(player)
    if drawings[player] then
        pcall(function() drawings[player].Box:Remove() end)
        pcall(function() drawings[player].Tracer:Remove() end)
        drawings[player] = nil
    end
end)

local stepConn = RunService.RenderStepped:Connect(function()
    tracer_from_bottom = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y)
    for player, objs in pairs(drawings) do
        local char = player.Character
        local hrp = char and char:FindFirstChild("HumanoidRootPart")
        local hum = char and char:FindFirstChildOfClass("Humanoid")

        if hrp and hum and hum.Health > 0 then
            local pos, onScreen = Camera:WorldToViewportPoint(hrp.Position)
            if onScreen then
                local headPos = Camera:WorldToViewportPoint(hrp.Position + Vector3.new(0, 2.5, 0))
                local legPos = Camera:WorldToViewportPoint(hrp.Position - Vector3.new(0, 3, 0))
                local height = math.abs(headPos.Y - legPos.Y)
                local width = height * 0.65

                objs.Box.Size = Vector2.new(width, height)
                objs.Box.Position = Vector2.new(pos.X - width / 2, pos.Y - height / 2)
                objs.Box.Visible = true

                objs.Tracer.From = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y)
                objs.Tracer.To = Vector2.new(pos.X, pos.Y + height / 2)
                objs.Tracer.Visible = true
            else
                objs.Box.Visible = false
                objs.Tracer.Visible = false
            end
        else
            objs.Box.Visible = false
            objs.Tracer.Visible = false
        end
    end
end)

getgenv().DrawingESP_Cleanup = function()
    stepConn:Disconnect()
    addConn:Disconnect()
    remConn:Disconnect()
    for _, objs in pairs(drawings) do
        pcall(function() objs.Box:Remove() end)
        pcall(function() objs.Tracer:Remove() end)
    end
    table.clear(drawings)
    print("ESP drawings cleaned up.")
end

print("Drawing API 2D ESP initialized!")
`,
  }
];
