// SPDX-License-Identifier: MIT
// apps/backend/src/scripts/verifyTools.ts
import { loadAllTools, toolRegistry } from "../routes/ai/tools/index.ts";

async function main() {
  try {
    await loadAllTools();
    const info = toolRegistry.getRegistryInfo();
    console.log("Tool registry info:", info);
    toolRegistry.debugPrint();
    // Try a minimal call to a safe tool if present
    const tryTools = ["system_info", "scan_databases", "calculate"];
    for (const t of tryTools) {
      if (toolRegistry.has(t)) {
        const res = await toolRegistry.call(t, {});
        console.log(`Tool '${t}' responded:`, typeof res === "object" ? res : String(res));
      }
    }
    console.log("✅ Tools loaded successfully.");
  } catch (err) {
    console.error("❌ Tool verification failed:", err);
    process.exitCode = 1;
  }
}

main();
