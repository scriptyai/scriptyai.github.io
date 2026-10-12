import { GoogleGenAI } from '@google/genai';

const LUA_GOD_SYSTEM_PROMPT = `You are "Mujtaba Scripty AI", an elite, world-class Lua Systems Architect and Principal Game Scripting Engineer specializing in Roblox Luau and UNC (Unified Naming Convention) Executor scripts (Synapse, Wave, Krnl, Fluxus, Delta, Codex).
Always provide production-grade, highly optimized, 100% self-contained Lua code with proper cleanup guards (getgenv) and safe UI parenting (gethui/CoreGui). Format code in \`\`\`lua ... \`\`\` blocks. For casual greetings, respond warmly and conversationally as Mujtaba Scripty AI without code.

ARCHITECTURAL CODING RULES (PREVENTING TRUNCATION & BROKEN SYNTAX):
1. FORCE COMPACT CODE PATTERNS: Use compressed Luau syntax. Stop using huge double-line spacing and long decorative comment headers. Chain services and keep comments concise.
2. IMPLEMENT DYNAMIC UI GENERATION: Do NOT hardcode UI elements line-by-line for every toggle. Write a single dynamic loop that reads a configuration table and auto-generates menu buttons/toggles, or load a lightweight library (Rayfield/Orion) to save 70% token space.
3. GUARANTEE COMPLETE SYNTAX CLOSURE: Implement core math logic (CFrame tracking, 2D Drawing API rendering, RenderStepped) FIRST. Always include the complete executor garbage-collection 'Cleanup' function. Every single parenthesis, bracket, and 'end' statement MUST cleanly close.`;

const RESILIENT_MODELS = [
  'gemini-3.5-flash-lite',
  'gemini-3.6-flash',
  'gemini-3.8-flash',
];

export function getClientStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('scripty_gemini_key');
    if (stored && stored.trim().length > 0) return stored.trim();
  }
  const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.GEMINI_API_KEY;
  if (envKey && envKey !== 'MY_GEMINI_API_KEY') {
    return envKey;
  }
  return '';
}

export function saveClientStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('scripty_gemini_key', key);
  }
}

// Built-in intelligent offline responses for GitHub Pages when running without an API key
function getSmartOfflineResponse(prompt: string, action: string, existingCode?: string): string | null {
  const p = (prompt || '').toLowerCase().trim();

  if (p === 'hi' || p === 'hello' || p === 'hey' || p === 'sup' || p === 'yo') {
    return `Hello! I am **Mujtaba Scripty AI**, your elite Roblox Luau and UNC Executor Systems Architect.

I am running directly in your browser. What executor script, custom GUI, ESP tracer, flight controller, or game utility would you like me to create or analyze today?`;
  }

  if (p.includes('esp') || p.includes('tracer') || p.includes('box')) {
    return `Here is a production-grade, 100% self-contained **UNC 2D Drawing API Box & Tracer ESP** script with singleton cleanup guards:

\`\`\`lua
-- [ Mujtaba Scripty AI • Universal UNC ESP & Tracers ]
-- Compatible with Synapse, Wave, Krnl, Delta, Fluxus, Codex

if getgenv().Mujtaba_ESP_Active then
    pcall(getgenv().Mujtaba_ESP_Cleanup)
end
getgenv().Mujtaba_ESP_Active = true

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Camera = workspace.CurrentCamera
local LocalPlayer = Players.LocalPlayer

local drawings = {}

local function createESP(player)
    if player == LocalPlayer then return end
    
    local box = Drawing.new("Square")
    box.Visible = false
    box.Color = Color3.fromRGB(244, 63, 94)
    box.Thickness = 1.5
    box.Filled = false
    
    local tracer = Drawing.new("Line")
    tracer.Visible = false
    tracer.Color = Color3.fromRGB(251, 146, 60)
    tracer.Thickness = 1.2
    
    table.insert(drawings, box)
    table.insert(drawings, tracer)
    
    local connection
    connection = RunService.RenderStepped:Connect(function()
        if not getgenv().Mujtaba_ESP_Active then
            connection:Disconnect()
            pcall(function() box:Remove() tracer:Remove() end)
            return
        end
        
        local character = player.Character
        local rootPart = character and character:FindFirstChild("HumanoidRootPart")
        local humanoid = character and character:FindFirstChild("Humanoid")
        
        if rootPart and humanoid and humanoid.Health > 0 then
            local pos, onScreen = Camera:WorldToViewportPoint(rootPart.Position)
            if onScreen then
                local size = (Camera:WorldToViewportPoint(rootPart.Position - Vector3.new(0, 3, 0)).Y - Camera:WorldToViewportPoint(rootPart.Position + Vector3.new(0, 2.6, 0)).Y)
                box.Size = Vector2.new(math.abs(size * 0.6), math.abs(size))
                box.Position = Vector2.new(pos.X - box.Size.X / 2, pos.Y - box.Size.Y / 2)
                box.Visible = true
                
                tracer.From = Vector2.new(Camera.ViewportSize.X / 2, Camera.ViewportSize.Y)
                tracer.To = Vector2.new(pos.X, pos.Y + box.Size.Y / 2)
                tracer.Visible = true
                return
            end
        end
        box.Visible = false
        tracer.Visible = false
    end)
end

for _, player in ipairs(Players:GetPlayers()) do
    task.spawn(createESP, player)
end
Players.PlayerAdded:Connect(createESP)

getgenv().Mujtaba_ESP_Cleanup = function()
    getgenv().Mujtaba_ESP_Active = false
    for _, drawing in ipairs(drawings) do
        pcall(function() drawing:Remove() end)
    end
    table.clear(drawings)
    print("[Mujtaba Scripty AI] ESP cleaned up successfully.")
end
\`\`\``;
  }

  if (p.includes('fly') || p.includes('flight')) {
    return `Here is a smooth **Universal BodyVelocity CFrame Flight Controller** with safe cleanup:

\`\`\`lua
-- [ Mujtaba Scripty AI • Universal Flight Controller ]
if getgenv().Flight_Active then
    pcall(getgenv().Flight_Cleanup)
end
getgenv().Flight_Active = true

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local UserInputService = game:GetService("UserInputService")

local LocalPlayer = Players.LocalPlayer
local Camera = workspace.CurrentCamera
local SPEED = 55

local character = LocalPlayer.Character or LocalPlayer.CharacterAdded:Wait()
local root = character:WaitForChild("HumanoidRootPart")

local bv = Instance.new("BodyVelocity")
bv.Name = "MujtabaFlightBV"
bv.Velocity = Vector3.zero
bv.MaxForce = Vector3.new(1e5, 1e5, 1e5)
bv.Parent = root

local bg = Instance.new("BodyGyro")
bg.Name = "MujtabaFlightBG"
bg.MaxTorque = Vector3.new(1e5, 1e5, 1e5)
bg.CFrame = root.CFrame
bg.Parent = root

local keysDown = {}
local c1 = UserInputService.InputBegan:Connect(function(input, gpe)
    if not gpe and input.UserInputType == Enum.UserInputType.Keyboard then
        keysDown[input.KeyCode] = true
    end
end)

local c2 = UserInputService.InputEnded:Connect(function(input)
    if input.UserInputType == Enum.UserInputType.Keyboard then
        keysDown[input.KeyCode] = false
    end
end)

local c3 = RunService.RenderStepped:Connect(function()
    if not getgenv().Flight_Active or not bv.Parent then return end
    bg.CFrame = Camera.CFrame
    local dir = Vector3.zero
    if keysDown[Enum.KeyCode.W] then dir = dir + Camera.CFrame.LookVector end
    if keysDown[Enum.KeyCode.S] then dir = dir - Camera.CFrame.LookVector end
    if keysDown[Enum.KeyCode.A] then dir = dir - Camera.CFrame.RightVector end
    if keysDown[Enum.KeyCode.D] then dir = dir + Camera.CFrame.RightVector end
    if keysDown[Enum.KeyCode.Space] then dir = dir + Vector3.new(0, 1, 0) end
    if keysDown[Enum.KeyCode.LeftShift] then dir = dir - Vector3.new(0, 1, 0) end
    
    bv.Velocity = dir.Unit * SPEED
    if dir.Magnitude == 0 then bv.Velocity = Vector3.zero end
end)

getgenv().Flight_Cleanup = function()
    getgenv().Flight_Active = false
    c1:Disconnect(); c2:Disconnect(); c3:Disconnect()
    pcall(function() bv:Destroy() bg:Destroy() end)
    print("[Mujtaba Scripty AI] Flight disabled.")
end
\`\`\``;
  }

  return null;
}

export async function generateClientSideFallback(
  prompt: string,
  target: string,
  action: string,
  existingCode?: string,
  history: any[] = []
): Promise<string> {
  const clientKey = getClientStoredApiKey();

  // If running without API key on static host, use offline expert knowledge
  if (!clientKey) {
    const offlineAnswer = getSmartOfflineResponse(prompt, action, existingCode);
    if (offlineAnswer) {
      return offlineAnswer;
    }
    throw new Error(
      'Static Host Mode: Please enter your Gemini API key in Settings or the GitHub Deploy panel for full dynamic generation, or select one of our Presets!'
    );
  }

  const ai = new GoogleGenAI({ apiKey: clientKey });

  let userInstruction = prompt;
  if (action === 'optimize') {
    userInstruction = `Optimize this Lua code for maximum speed and efficiency:\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (action === 'debug') {
    userInstruction = `Debug and fix this Lua code:\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (existingCode) {
    userInstruction += `\n\`\`\`lua\n${existingCode}\n\`\`\``;
  }

  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: userInstruction }],
  });

  let lastError: any = null;
  for (const model of RESILIENT_MODELS) {
    try {
      const resp = await ai.models.generateContent({
        model,
        contents,
        config: {
          systemInstruction: LUA_GOD_SYSTEM_PROMPT,
          temperature: 0.25,
        },
      });
      if (resp.text) return resp.text;
    } catch (err: any) {
      lastError = err;
    }
  }

  throw lastError || new Error('Client-side generation failed.');
}

export async function* streamClientSideFallback(
  prompt: string,
  target: string,
  action: string,
  existingCode?: string,
  history: any[] = []
): AsyncGenerator<string, void, unknown> {
  const clientKey = getClientStoredApiKey();

  if (!clientKey) {
    const offlineAnswer = getSmartOfflineResponse(prompt, action, existingCode);
    if (offlineAnswer) {
      // Simulate natural streaming for offline answers
      const words = offlineAnswer.split(' ');
      for (const word of words) {
        yield word + ' ';
        await new Promise((r) => setTimeout(r, 20));
      }
      return;
    }
    throw new Error(
      'Static Host Mode: Please enter your Gemini API key in Settings or the GitHub Deploy panel to enable live AI generation.'
    );
  }

  const ai = new GoogleGenAI({ apiKey: clientKey });

  let userInstruction = prompt;
  if (action === 'optimize') {
    userInstruction = `Optimize this Lua code for maximum speed and efficiency:\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (action === 'debug') {
    userInstruction = `Debug and fix this Lua code:\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (existingCode) {
    userInstruction += `\n\`\`\`lua\n${existingCode}\n\`\`\``;
  }

  const contents: any[] = [];
  if (Array.isArray(history) && history.length > 0) {
    for (const msg of history) {
      contents.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      });
    }
  }
  contents.push({
    role: 'user',
    parts: [{ text: userInstruction }],
  });

  for (const model of RESILIENT_MODELS) {
    try {
      const stream = await ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction: LUA_GOD_SYSTEM_PROMPT,
          temperature: 0.25,
        },
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield chunk.text;
        }
      }
      return;
    } catch (err) {
      console.warn(`[Client-Stream] Model ${model} failed, trying next...`, err);
    }
  }

  throw new Error('All client-side AI models failed to stream. Please verify your API key.');
}
