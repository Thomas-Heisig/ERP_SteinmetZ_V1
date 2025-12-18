/**
 * test-context-loading.ts
 * ---------------------------------------------------------
 * Schneller Test für das Laden der ConversationContext-Daten
 * Nutzen: node --loader ts-node/esm test-context-loading.ts
 */

import { ConversationContext } from "./conversationContext.js";
import { createLogger } from "../../../utils/logger.js";

const logger = createLogger("context-test");

async function testContextLoading(): Promise<void> {
  logger.info("=".repeat(60));
  logger.info("🧪 Testing ConversationContext Data Loading");
  logger.info("=".repeat(60));

  try {
    // Erstelle Context-Instanz
    const context = new ConversationContext();

    // Hole Diagnose-Informationen
    const diagnostics = context.getDiagnostics();

    logger.info("\n📊 Loading Statistics:");
    logger.info(
      `   Files Loaded: ${diagnostics.loading_info.loaded_files ?? "N/A"}`,
    );
    logger.info(
      `   Fallback Mode: ${diagnostics.loading_info.fallback_mode ? "❌ YES" : "✅ NO"}`,
    );
    logger.info(
      `   Load Timestamp: ${diagnostics.loading_info.load_timestamp ?? "N/A"}`,
    );

    logger.info("\n📚 Data Statistics:");
    logger.info(`   Total Rules: ${diagnostics.rules_loaded}`);
    logger.info(`   Active Rules: ${diagnostics.active_rules}`);
    logger.info(`   Disabled Rules: ${diagnostics.disabled_rules}`);
    logger.info(`   Reflections: ${diagnostics.reflections_loaded}`);
    logger.info(`   Topic Patterns: ${diagnostics.topic_patterns}`);

    logger.info("\n🔍 Context Information:");
    logger.info(`   Context Size: ${diagnostics.context_size} entries`);
    logger.info(`   Preferences: ${diagnostics.preferences_size}`);
    logger.info(`   History: ${diagnostics.history_length} messages`);

    logger.info("\n⏱️  System Status:");
    logger.info(
      `   Initialized: ${diagnostics.system_info.initialized ? "✅" : "❌"}`,
    );
    logger.info(
      `   Uptime: ${(diagnostics.system_info.uptime_ms / 1000).toFixed(2)}s`,
    );

    logger.info("\n📝 Metadata:");
    logger.info(`   Version: ${diagnostics.metadata.version ?? "N/A"}`);
    logger.info(`   Description: ${diagnostics.metadata.description ?? "N/A"}`);

    // Test einige Regel-Matches
    logger.info("\n🧪 Testing Rule Matching:");

    const testInputs = [
      "Hallo, wie geht es dir?",
      "Danke für deine Hilfe!",
      "Auf Wiedersehen!",
      "Was kannst du alles?",
      "Zeige mir alle Bestellungen",
    ];

    for (const input of testInputs) {
      const match = context.matchRules(input);
      if (match) {
        logger.info(`   ✅ "${input}"`);
        logger.info(`      → Reply: "${match.reply?.substring(0, 50)}..."`);
        logger.info(`      → Action: ${match.action ?? "none"}`);
      } else {
        logger.info(`   ⚪ "${input}" → No match`);
      }
    }

    // Vollständiger Context-Dump
    logger.info("\n🗂️  Full Context State:");
    const fullContext = context.getContext();
    logger.info(JSON.stringify(fullContext, null, 2));

    logger.info("\n" + "=".repeat(60));

    if (diagnostics.loading_info.fallback_mode) {
      logger.error("❌ TEST FAILED: Running in fallback mode!");
      logger.error("   → Check if data files exist in data/ folder");
      logger.error("   → Check file permissions");
      logger.error("   → Check JSON syntax in data files");
      process.exit(1);
    } else {
      logger.info("✅ TEST PASSED: All context data loaded successfully!");
      logger.info(`   → ${diagnostics.rules_loaded} rules loaded`);
      logger.info(`   → ${diagnostics.reflections_loaded} reflections loaded`);
      logger.info(`   → ${diagnostics.active_rules} rules active`);
    }

    logger.info("=".repeat(60));
  } catch (error) {
    logger.error("❌ TEST FAILED WITH ERROR:");
    logger.error(error);
    process.exit(1);
  }
}

// Führe Test aus
testContextLoading().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
