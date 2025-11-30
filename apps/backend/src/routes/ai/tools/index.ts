/**
 * tools/index.ts
 * Lädt und registriert automatisch alle Tool-Module im ./tools-Verzeichnis.
 * Kompatibel mit TypeScript und Build (ESM .js/.ts).
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { toolRegistry } from './registry.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ─────────────────────────────────────────────
 * 🔍 Hilfsfunktionen
 * ───────────────────────────────────────────── */

/**
 * Prüft, ob eine Datei ein valides Toolmodul ist.
 */
function isToolModule(filename: string): boolean {
  return (
    (filename.endsWith('.ts') || filename.endsWith('.js')) &&
    !filename.includes('registry') &&
    !filename.includes('index') &&
    !filename.startsWith('.')
  );
}

/**
 * Liest rekursiv alle Tool-Dateien in einem Verzeichnis (optional tief).
 */
async function scanToolFiles(dir: string, recursive = true): Promise<string[]> {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const results: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory() && recursive) {
      results.push(...(await scanToolFiles(fullPath, recursive)));
    } else if (entry.isFile() && isToolModule(entry.name)) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Lädt ein einzelnes Toolmodul dynamisch und ruft dessen registerTools() auf.
 */
async function importToolModule(filePath: string) {
  try {
    const fileUrl = pathToFileURL(filePath).href;
    const mod = await import(fileUrl);
    const fileName = path.basename(filePath);

    if (typeof mod.registerTools === 'function') {
      await mod.registerTools(toolRegistry);
      console.log(`🧰  Toolmodul geladen: ${fileName}`);
    } else {
      console.warn(`⚠️  Modul '${fileName}' enthält keine exportierte Funktion registerTools().`);
    }
  } catch (err) {
    console.error(`❌ Fehler beim Laden von ${filePath}:`, err);
  }
}

/* ─────────────────────────────────────────────
 * 🚀 Hauptfunktion: Alle Tools laden
 * ───────────────────────────────────────────── */

/**
 * Lädt alle Tools im aktuellen Verzeichnis (und Unterordnern, falls aktiviert).
 * 
 * @param filter - optional: nur bestimmte Module laden (z. B. ['file', 'erp'])
 * @param recursive - ob Unterverzeichnisse mitgeladen werden sollen
 */
export async function loadAllTools(filter?: string[], recursive = true) {
  const dir = __dirname;
  const toolFiles = await scanToolFiles(dir, recursive);

  const candidates = toolFiles.filter(f => {
    if (!filter) return true;
    return filter.some(p => f.toLowerCase().includes(p.toLowerCase()));
  });

  console.log(`🔎 Lade ${candidates.length} Toolmodule${filter ? ` (Filter: ${filter.join(', ')})` : ''}...`);

  for (const file of candidates) {
    await importToolModule(file);
  }

  console.log(`✅ Tools geladen: ${toolRegistry.count()} registriert.`);
  return toolRegistry;
}

/* ─────────────────────────────────────────────
 * 🧠 Automatisches Laden beim Import
 * ───────────────────────────────────────────── */

/**
 * In der Produktion kann automatisches Laden durch Umgebungsvariable deaktiviert werden:
 *   AI_AUTOLOAD_TOOLS=0
 * Im Entwicklungsmodus unterstützt Hot-Reload durch setInterval().
 */
if (process.env.AI_AUTOLOAD_TOOLS !== '0') {
  await loadAllTools();

  if (process.env.NODE_ENV === 'development' && process.env.AI_HOT_RELOAD === '1') {
    const reloadInterval = Number(process.env.AI_HOT_RELOAD_INTERVAL ?? 10000);
    console.log(`♻️  Hot-Reload aktiv (alle ${reloadInterval / 1000}s).`);
    setInterval(async () => {
      toolRegistry.clear();
      await loadAllTools();
    }, reloadInterval);
  }
}

export { toolRegistry };
