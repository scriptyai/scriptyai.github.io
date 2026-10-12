// In-browser Lua 5.3 execution engine using Fengari
// @ts-ignore
import fengari from "fengari-web";
import { ExecutionResult } from "../types";

export function runLuaCode(code: string): ExecutionResult {
  const startTime = performance.now();
  const logs: string[] = [];

  try {
    const { lua, lauxlib, lualib, to_luastring, to_jsstring } = fengari;
    const L = lauxlib.luaL_newstate();
    lualib.luaL_openlibs(L);

    // Custom print() function
    lua.lua_pushjsfunction(L, function (L_state: any) {
      const n = lua.lua_gettop(L_state);
      const parts: string[] = [];
      for (let i = 1; i <= n; i++) {
        const val = lua.lua_tolstring(L_state, i);
        parts.push(val ? to_jsstring(val) : "nil");
      }
      logs.push(parts.join("\t"));
      return 0;
    });
    lua.lua_setglobal(L, to_luastring("print"));

    // Custom warn() function
    lua.lua_pushjsfunction(L, function (L_state: any) {
      const n = lua.lua_gettop(L_state);
      const parts: string[] = [];
      for (let i = 1; i <= n; i++) {
        const val = lua.lua_tolstring(L_state, i);
        parts.push(val ? to_jsstring(val) : "nil");
      }
      logs.push("[WARN] " + parts.join("\t"));
      return 0;
    });
    lua.lua_setglobal(L, to_luastring("warn"));

    // Inject minimal Luau shim helpers (Vector3, Color3, task) for standalone testing
    const shimScript = `
      Vector3 = {
        new = function(x, y, z)
          return { X = x or 0, Y = y or 0, Z = z or 0, __tostring = function(self) return string.format("Vector3(%s, %s, %s)", self.X, self.Y, self.Z) end }
        end,
        zero = { X = 0, Y = 0, Z = 0 }
      }
      Color3 = {
        fromRGB = function(r, g, b)
          return { R = r, G = g, B = b, __tostring = function(self) return string.format("Color3.fromRGB(%s, %s, %s)", self.R, self.G, self.B) end }
        end
      }
      task = {
        wait = function() return 0 end,
        spawn = function(f, ...) return f(...) end,
        defer = function(f, ...) return f(...) end
      }
    `;
    lauxlib.luaL_dostring(L, to_luastring(shimScript));

    // Execute user code
    const status = lauxlib.luaL_dostring(L, to_luastring(code));
    const durationMs = Math.round(performance.now() - startTime);

    if (status !== lua.LUA_OK) {
      const errStr = to_jsstring(lua.lua_tolstring(L, -1));
      return {
        success: false,
        output: logs.join("\n"),
        error: errStr || "Runtime or syntax error encountered.",
        durationMs,
      };
    }

    return {
      success: true,
      output: logs.length > 0 ? logs.join("\n") : "Script executed successfully with no output.",
      durationMs,
    };
  } catch (err: any) {
    const durationMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      output: logs.join("\n"),
      error: err?.message || String(err),
      durationMs,
    };
  }
}
