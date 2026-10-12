export type LuaTarget = 'executor';

export type LuaAction = 'generate' | 'optimize' | 'debug' | 'explain' | 'convert';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  target?: LuaTarget;
  action?: LuaAction;
  extractedCode?: string;
  language?: string;
}

export interface ScriptTemplate {
  id: string;
  title: string;
  target: LuaTarget;
  category: string;
  description: string;
  prompt: string;
  scriptType: 'Server' | 'Client' | 'Module' | 'Standalone';
  code: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  durationMs: number;
}
