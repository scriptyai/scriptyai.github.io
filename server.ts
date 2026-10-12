import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI initialization
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
      throw new Error("Neural AI engine is initializing. Please try your request again.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

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

2. SCRIPT & CODE GENERATION:
   - When the user asks to build, write, create, generate, optimize, debug, or convert code:
     - ALWAYS write the FULL, COMPLETE, 100% UNTRUNCATED, EXHAUSTIVE script from start to finish.
     - NEVER truncate, shorten, summarize, or leave placeholders (such as "-- rest of code here", "-- add remaining logic", "-- insert code here", etc.). Every single function, UI component, listener, event, and table MUST be completely written out in full.
     - Write pristine, production-grade, highly optimized, idiomatic Executor Lua code.
     - Always include clear, helpful inline comments explaining complex logic.
     - Always make scripts 100% self-contained for client execution (compatible with Synapse, Wave, Krnl, Delta, Fluxus, Codex, etc.).
     - Include re-execution cleanup guards with getgenv() and safe UI parenting to \`(gethui and gethui()) or game:GetService("CoreGui")\`.
      - Format all Lua code inside standard \`\`\`lua ... \`\`\` markdown blocks so the editor can parse and display it cleanly.

ROBLOX UI ENGINE UPDATE OVERRIDE: 
You must permanently stop using the legacy 'MainFrame.Draggable = true' and 'MainFrame.Active = true' properties for handling user interface dragging. These API elements are fully deprecated and break on modern executor runtimes.

Instead, whenever you build custom Roblox GUI interfaces, implement this modern, input-safe UserInputService drag tracking framework:

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

Ensure 'connections' tracking loops seamlessly capture this 'UserInputService.InputChanged' thread so it clears fully from memory upon executor execution termination.`;

// Supported active Gemini models in priority order:
// gemini-3.5-flash-lite (ultra-fast sub-second latency)
// gemini-3.6-flash (Google recommended top-tier coding model)
// gemini-3.8-flash (complex multi-step reasoning)
const RESILIENT_MODELS = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
];

function isOverloadError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || String(err)).toLowerCase();
  const status = err.status || err.statusCode || 0;
  return (
    status === 503 ||
    status === 429 ||
    msg.includes("503") ||
    msg.includes("429") ||
    msg.includes("high demand") ||
    msg.includes("overloaded") ||
    msg.includes("unavailable") ||
    msg.includes("resource_exhausted")
  );
}

function extractCleanError(err: any): string {
  if (!err) return "Service temporarily unavailable.";
  const raw = err.message || String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed.error?.message) {
      try {
        const inner = JSON.parse(parsed.error.message);
        if (inner.error?.message) return inner.error.message;
      } catch {}
      return parsed.error.message;
    }
  } catch {}
  return raw;
}

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

  let dialectDetails = "";
  if (target === "roblox") {
    dialectDetails = "Roblox Luau (--!strict, task library, services, client-server networking, Explorer hierarchy)";
  } else if (target === "executor") {
    dialectDetails = "External Executor / UNC Environment (100% self-contained client execution, getgenv cleanup guards, gethui/CoreGui parenting, Drawing API, Rayfield/Orion or standalone GUI, ready for Synapse, Wave, Krnl, Delta, Fluxus, etc.)";
  } else if (target === "fivem") {
    dialectDetails = "FiveM CFX Lua (server-client separation, net events, security precautions)";
  } else if (target === "love2d") {
    dialectDetails = "LÖVE 2D (love.update, love.draw, delta-time game loop)";
  } else if (target === "neovim") {
    dialectDetails = "Neovim Lua API (vim.api, vim.keymap, lazy.nvim plugin specs)";
  } else {
    dialectDetails = "Standard Lua 5.1/5.4 with portable, efficient functions";
  }

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

  return `[Active Environment: ${target.toUpperCase()} - ${dialectDetails}]\n\n${userInstruction}`;
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    models: RESILIENT_MODELS,
    hasApiKey: Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY"),
  });
});

// Lua generation / assistance streaming endpoint (Server-Sent Events)
app.post("/api/stream-lua", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream; charset=utf-8");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  if (typeof (res as any).flushHeaders === "function") {
    (res as any).flushHeaders();
  }

  // Immediate SSE comment to prevent proxy buffering
  res.write(": connected\n\n");

  try {
    const { prompt, target = "executor", action = "generate", existingCode, history = [] } = req.body;

    if (!prompt && !existingCode) {
      res.write(`data: ${JSON.stringify({ error: "Please provide a prompt or code." })}\n\n`);
      res.end();
      return;
    }

    const ai = getGenAI();
    const userMessageContent = buildPromptPayload(target, action, prompt, existingCode);

    const contents: any[] = [];

    // Append prior chat history if provided
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

    let streamedSuccessfully = false;
    let lastError: any = null;

    // Try candidate models in order: gemini-3.5-flash-lite, gemini-3.6-flash, gemini-3.8-flash
    for (const modelName of RESILIENT_MODELS) {
      try {
        console.log(`[Stream] Attempting model: ${modelName}`);

        const responseStreamPromise = ai.models.generateContentStream({
          model: modelName,
          contents,
          config: {
            systemInstruction: LUA_GOD_SYSTEM_PROMPT,
            temperature: 0.25,
            maxOutputTokens: 8192,
          },
        });

        // 45-second timeout to receive stream initialization for large scripts
        const responseStream = await Promise.race([
          responseStreamPromise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`Model ${modelName} connection timed out`)), 45000)
          ),
        ]);

        for await (const chunk of responseStream) {
          if (chunk.text) {
            res.write(`data: ${JSON.stringify({ text: chunk.text })}\n\n`);
            streamedSuccessfully = true;
          }
        }

        if (streamedSuccessfully) {
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Stream] Model ${modelName} failed:`, extractCleanError(err));
        // If we already wrote partial data, do not attempt to replay another model on top
        if (streamedSuccessfully) {
          res.write(`data: ${JSON.stringify({ error: extractCleanError(err) })}\n\n`);
          res.end();
          return;
        }
      }
    }

    // If streaming had issues across models, attempt unary generateContent
    for (const modelName of RESILIENT_MODELS) {
      try {
        console.log(`[Unary Fallback] Attempting model: ${modelName}`);
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
            setTimeout(() => reject(new Error(`Model ${modelName} unary timed out`)), 60000)
          ),
        ]);

        if (response.text) {
          res.write(`data: ${JSON.stringify({ text: response.text })}\n\n`);
          res.write("data: [DONE]\n\n");
          res.end();
          return;
        }
      } catch (unaryErr: any) {
        lastError = unaryErr;
        console.warn(`[Unary Fallback] Model ${modelName} failed:`, extractCleanError(unaryErr));
      }
    }

    throw lastError || new Error("All AI models are currently busy. Please try again.");
  } catch (err: any) {
    console.error("Stream generation error:", err);
    const cleanMessage = extractCleanError(err);
    res.write(`data: ${JSON.stringify({ error: cleanMessage })}\n\n`);
    res.end();
  }
});

// Non-streaming fallback endpoint
app.post("/api/generate-lua", async (req, res) => {
  try {
    const { prompt, target = "executor", action = "generate", existingCode, history = [] } = req.body;
    const ai = getGenAI();

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
          res.json({ text: response.text });
          return;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Generate] Model ${modelName} failed:`, extractCleanError(err));
      }
    }

    throw lastError || new Error("Generation failed.");
  } catch (err: any) {
    console.error("Error generating Lua:", err);
    res.status(500).json({ error: extractCleanError(err) });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Mujtaba Scripty AI running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Server startup error:", err);
});
