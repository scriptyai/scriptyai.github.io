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

export async function generateClientSideFallback(
  prompt: string,
  target: string,
  action: string,
  existingCode?: string,
  history: any[] = []
): Promise<string> {
  const clientKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
  if (!clientKey || clientKey === 'MY_GEMINI_API_KEY') {
    throw new Error('VITE_GEMINI_API_KEY is not configured in client environment.');
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
