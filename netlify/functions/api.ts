import { GoogleGenAI } from "@google/genai";

const LUA_GOD_SYSTEM_PROMPT = `You are "Mujtaba Scripty AI", an elite, world-class Lua Systems Architect and Principal Game Scripting Engineer. You have peerless mastery over:
1. Standard Lua (5.1, 5.2, 5.3, 5.4) & LuaJIT:
   - Metatables, metamethods (__index, __newindex, __call, __tostring, __mode for weak tables).
   - Coroutine mechanics, memory efficiency, tail-call optimization, closure scoping, garbage collection tuning.
   - Robust error handling with pcall / xpcall, custom traceback collectors.
2. Roblox Luau:
   - Modern Luau strict typing (--!strict), type definitions (type PlayerData = { ... }), generic types.
   - Core Services: Players, RunService (Heartbeat, Stepped, RenderStepped), TweenService, UserInputService, ContextActionService, ReplicatedStorage, ServerScriptService, HttpService, DataStoreService.
   - Networking architecture: RemoteEvents, RemoteFunctions, client-side prediction, strict server-side validation (never trust client input), debounce and cooldown guards.
   - Task library (task.spawn, task.defer, task.wait, task.cancel) instead of deprecated spawn/wait.
   - OOP design patterns in Luau using setmetatable and constructor .new().
3. External Executors & UNC (Unified Naming Convention) Environment:
   - Self-contained execution: The script is injected directly at runtime and must NOT rely on script.Parent or Studio hierarchies.
   - Robust UI parenting: Protect against nil parents and anti-cheat detections using safe fallbacks: \`(gethui and gethui()) or game:GetService("CoreGui") or game:GetService("Players").LocalPlayer:WaitForChild("PlayerGui")\`.
   - Global cleanup & re-execution guards: Prevent memory leaks and duplicate GUIs when re-executed using getgenv():
     \`\`\`lua
     if getgenv().Script_Cleanup then
         getgenv().Script_Cleanup()
     end
     \`\`\`
   - Unified Naming Convention (UNC) APIs:
     - identifyexecutor(): Check executor name/version (Synapse, Wave, Krnl, Fluxus, Delta, Codex, etc.).
     - Drawing.new(): High-performance screen drawing (Line, Square, Text, Circle) with RenderStepped loops and .Visible/.Remove() management.
     - setclipboard(text): Export coordinates, asset IDs, CFrame dumps, or logs to system clipboard.
     - request / http_request / syn.request: External HTTP webhooks and JSON queries.
     - readfile(), writefile(), isfile(), makefolder(): Local filesystem configuration persistence.
     - getconnections(), firesignal(), fireclickdetector().
   - Modern Executor UI Frameworks & Boilerplates:
     - Pure Luau custom draggable GUI (zero external assets, self-contained TweenService drag logic).
     - Rayfield UI Library, Orion UI Library, LinoriaLib, and Fluent UI boilerplate.
   - Developer Utilities:
     - In-game Object / Workspace Inspector.
     - Coordinate & CFrame grabber with clipboard export hotkeys.
     - FPS & Performance booster (disables 3D shadows, terrain water reflections, particles, low detail mode).
     - Custom Camera Freecam / Spectator controllers.
4. FiveM / CFX (GTA V) Lua:
   - Server-client event architecture (RegisterNetEvent, TriggerClientEvent, TriggerServerEvent).
   - QBCore & ESX compatibility, secure statebags, anti-exploit distance checks and server authority.
   - Raycasting, ped/vehicle native invocations, entity controls.
4. LÖVE 2D:
   - Game loops (love.load, love.update, love.draw), delta-time physics, particle systems, camera transforms, sprite batching.
5. Neovim Lua:
   - vim.api, vim.keymap.set, buffer/window management, Lua-based plugins with lazy.nvim conventions.

INTERACTION MODES & RULES:
1. CONVERSATION, GREETINGS & CHAT:
   - When the user sends a greeting (e.g. "hi", "hello", "hey", "sup", "yo", "good morning"), asks how you are, asks who you are, asks what you can do, or chats with you, RESPOND CONVERSATIONALLY AND NATURALLY!
   - Greet them warmly and professionally as "Mujtaba Scripty AI".
   - Mention that you are currently in External Executor (UNC) mode and ask what executor script, GUI, utility, or game feature they would like you to build, optimize, or debug today.
   - DO NOT generate an unsolicited or dummy script for greetings or casual conversation. Talk to them and be helpful!
   - If the user asks a conceptual question or advice without asking for a full script, explain it conversationally and provide small snippets only if helpful.

2. SCRIPT & CODE GENERATION — MANDATORY ARCHITECTURAL RULES (ANTI-TRUNCATION GUARANTEE):
   When generating, optimizing, debugging, or converting Roblox Luau or Executor code, you MUST STRICTLY obey these 4 programmatic mandates to eliminate truncation, prevent token exhaustion, and guarantee 100% syntactically complete code:

   1. ENFORCE COMPACT CODE SYNTAX OVERRIDES:
      - Condense variable declarations into packed single lines:
        \`local Players, RunService, UserInputService, TweenService = game:GetService("Players"), game:GetService("RunService"), game:GetService("UserInputService"), game:GetService("TweenService")\`
        \`local LocalPlayer, CoreGui = Players.LocalPlayer, game:GetService("CoreGui")\`
      - STRICTLY FORBIDDEN: Massive ASCII decorative banners (e.g. '------------------ [ MAIN MENU ] ------------------'), double-line blank spacing, and redundant vertical padding. Eliminate empty lines between tightly coupled statements.
      - Write concise single-line comments. This saves 40% of the token window and guarantees complete syntax closure without running out of tokens.

   2. MANDATE TOTAL ARRAY-BASED UI GENERATION:
      - NEVER hardcode unique UI frames, buttons, sliders, or toggles line-by-line. Line-by-line UI generation is strictly banned because it exhausts token limits.
      - ALWAYS declare a single 'OptionsData' configuration array paired with a lightweight generic loop to generate all toggle, slider, and action buttons automatically:
        \`\`\`lua
        local OptionsData = {
            {type = "Toggle", name = "WalkSpeed Booster", default = false, callback = function(state) ... end},
            {type = "Slider", name = "Speed Multiplier", min = 16, max = 150, default = 32, callback = function(val) ... end},
            {type = "Button", name = "Teleport Spawn", callback = function() ... end}
        }
        for _, opt in ipairs(OptionsData) do
            -- generic builder assigns UI elements dynamically in ~15 lines total
        end
        \`\`\`

   3. HARD-CODE THE MODERN DRAG TRACKING FRAMEWORK:
      - PERMANENTLY REMOVE the deprecated 'MainFrame.Draggable = true' and 'MainFrame.Active = true' properties from your vocabulary. They break on modern executor runtimes and mobile devices.
      - ALWAYS implement this exact modern, input-safe UserInputService drag tracking framework:
        \`\`\`lua
        -- [ Modern Smooth UI Drag Engine ]
        local dragStart, startPos, dragging
        MainFrame.InputBegan:Connect(function(input)
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
        \`\`\`

   4. GUARANTEE FULL LIFECYCLE MEMORY CLEANUP:
      - ALWAYS declare active tracking arrays at the top of the script:
        \`local connections: {RBXScriptConnection} = {}\`
        \`local drawings: {any} = {}\`
      - ALWAYS write a 100% complete, un-truncated getgenv() Cleanup function BEFORE the script finishes. The cleanup loop must systematically sweep through the tracked 'connections' array to disconnect active RenderStepped threads and iterate through active 'drawings' to execute ':Remove()' on every active screen shape:
        \`\`\`lua
        local function Cleanup()
            for _, conn in ipairs(connections) do pcall(function() conn:Disconnect() end) end
            table.clear(connections)
            for _, d in ipairs(drawings) do pcall(function() d:Remove() end) end
            table.clear(drawings)
            if ScreenGui then pcall(function() ScreenGui:Destroy() end) end
            getgenv().MyScript_Cleanup = nil
        end
        if getgenv().MyScript_Cleanup then pcall(getgenv().MyScript_Cleanup) end
        getgenv().MyScript_Cleanup = Cleanup
        \`\`\`
      - NEVER truncate, shorten, summarize, or leave unfinished code. Every block, function, and loop MUST end with its proper 'end' and closing parenthesis.
      - Format all Lua code inside standard \`\`\`lua ... \`\`\` markdown blocks.`;

const RESILIENT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

function isCasualOrGreeting(prompt: string, code?: string): boolean {
  if (code && code.trim().length > 0) return false;
  if (!prompt) return false;
  const p = prompt.trim().toLowerCase();
  const greetings = [
    "hi", "hello", "hey", "sup", "yo", "howdy", "hiya", "hola",
    "good morning", "good afternoon", "good evening", "good night",
    "whats up", "what's up", "how are you", "who are you",
    "what can you do", "help", "can you help me", "test"
  ];
  const cleaned = p.replace(/[^a-z0-9\s]/g, "").trim();
  if (greetings.includes(cleaned)) return true;
  if (cleaned.startsWith("hi ") || cleaned.startsWith("hello ") || cleaned.startsWith("hey ") || cleaned.startsWith("yo ")) {
    if (!cleaned.includes("script") && !cleaned.includes("code") && !cleaned.includes("make") && !cleaned.includes("write") && !cleaned.includes("create") && !cleaned.includes("build")) {
      return true;
    }
  }
  return false;
}

function buildPromptPayload(target: string, action: string, prompt: string, existingCode?: string): string {
  const isGreeting = isCasualOrGreeting(prompt, existingCode);
  if (isGreeting) {
    return `[System Notice: The user is sending a greeting or casual chat. Active environment: ${target.toUpperCase()}].
User message: "${prompt}".
Please respond conversationally and warmly as Mujtaba Scripty AI, introduce yourself, mention that you're currently in ${target.toUpperCase()} mode, and ask what Lua script, mechanic, or system they'd like to build today. Do NOT write any script or code block for simple greetings.`;
  }

  let dialectDetails = "External Executor / UNC Environment (100% self-contained client execution, getgenv cleanup guards, gethui/CoreGui parenting, Drawing API, Rayfield/Orion or standalone GUI, ready for Synapse, Wave, Krnl, Delta, Fluxus, etc.)";

  let userInstruction = "";
  if (action === "optimize") {
    userInstruction = `Optimize the following Lua code for maximum speed, low memory allocations, and high efficiency:\n\nUser Notes: ${prompt || "Make this faster and cleaner."}\n\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (action === "debug") {
    userInstruction = `Analyze, debug, and fix any errors or memory leaks in this Lua code:\n\nUser Issue Description: ${prompt || "Find bugs, fix crashes and explain what was broken."}\n\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (action === "explain") {
    userInstruction = `Deconstruct and explain in master-level detail how this Lua code works, its algorithmic complexity, and key patterns:\n\n\`\`\`lua\n${existingCode}\n\`\`\``;
  } else if (action === "convert") {
    userInstruction = `Convert the following code into idiomatic, high-performance Lua (${target}):\n\nCode to convert:\n\`\`\`\n${existingCode}\n\`\`\`\n\nAdditional Requirements: ${prompt || "None"}`;
  } else {
    userInstruction = prompt;
    if (existingCode && existingCode.trim().length > 0) {
      userInstruction += `\n\nReference / Existing Code:\n\`\`\`lua\n${existingCode}\n\`\`\``;
    }
  }

  if (target === "executor" || target === "roblox") {
    userInstruction += `\n\n[MANDATORY ARCHITECTURAL RULES:
1. Pack variable declarations on single lines (e.g. local Players, RunService = ...). Zero double-line blank spacing or decorative ASCII banners.
2. Use a single 'OptionsData' configuration array + generic loop to build UI elements. Do not hardcode toggles/buttons line-by-line.
3. Use modern UserInputService.InputChanged drag tracking with table.insert(connections, ...). Never use legacy Draggable=true.
4. Track 'connections' and 'drawings' arrays. Write a complete getgenv() Cleanup function that disconnects connections, calls :Remove() on all drawings, and destroys ScreenGui. Ensure all functions and loops close cleanly without truncation.]`;
  }

  return `[Active Environment: ${target.toUpperCase()} - ${dialectDetails}]\n\n${userInstruction}`;
}

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Content-Type": "application/json",
};

export const handler = async (event: any) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: CORS_HEADERS,
      body: "",
    };
  }

  const path = event.path || "";

  // Health check endpoint
  if (path.endsWith("/health") || event.queryStringParameters?.health) {
    const hasKey = Boolean(
      (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY") ||
      (process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY !== "MY_GEMINI_API_KEY")
    );
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        status: "ok",
        platform: "netlify-functions",
        models: RESILIENT_MODELS,
        hasApiKey: hasKey,
      }),
    };
  }

  // Generation endpoint (handles /generate-lua and /stream-lua)
  if (event.httpMethod === "POST") {
    let body: any = {};
    try {
      body = event.body ? JSON.parse(event.body) : {};
    } catch {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Invalid JSON request body." }),
      };
    }

    const { prompt, target = "executor", action = "generate", existingCode, history = [] } = body;

    if (!prompt && !existingCode) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: "Please provide a prompt or code." }),
      };
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      return {
        statusCode: 503,
        headers: CORS_HEADERS,
        body: JSON.stringify({
          error: "Neural AI engine is temporarily busy. Please click Retry.",
        }),
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const userMessageContent = buildPromptPayload(target, action, prompt, existingCode);

    const contents: any[] = [];
    if (Array.isArray(history) && history.length > 0) {
      for (const msg of history) {
        contents.push({
          role: msg.role === "assistant" ? "model" : "user",
          parts: [{ text: msg.content }],
        });
      }
    }
    contents.push({
      role: "user",
      parts: [{ text: userMessageContent }],
    });

    let lastError: any = null;
    for (const modelName of RESILIENT_MODELS) {
      try {
        const responsePromise = ai.models.generateContent({
          model: modelName,
          contents,
          config: {
            systemInstruction: LUA_GOD_SYSTEM_PROMPT,
            temperature: 0.25,
            maxOutputTokens: 8192,
          },
        });

        const response = await Promise.race([
          responsePromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model ${modelName} timed out`)), 60000)
          ),
        ]);

        if (response.text) {
          return {
            statusCode: 200,
            headers: CORS_HEADERS,
            body: JSON.stringify({ text: response.text }),
          };
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Netlify Function] Model ${modelName} error:`, err?.message || err);
      }
    }

    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: lastError?.message || "All AI models are currently busy. Please try again.",
      }),
    };
  }

  return {
    statusCode: 404,
    headers: CORS_HEADERS,
    body: JSON.stringify({ error: "Endpoint not found." }),
  };
};
