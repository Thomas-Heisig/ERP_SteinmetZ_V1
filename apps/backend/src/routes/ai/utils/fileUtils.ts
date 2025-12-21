/**
 * fileUtils.ts
 * ---------------------------------------------------------
 * Sichere Dateioperationen für das ERP-/KI-Backend.
 * Unterstützt:
 *  - Lesen & Schreiben von Text, JSON, YAML
 *  - Datei- & Verzeichnis-Validierung
 *  - Asynchrones Arbeiten mit Fehlerlogging
 *  - Temporärdateien & Backups
 */

import fs from "node:fs";
import fsp from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import yaml from "yaml";
import { log } from "../utils/logger.js";
import { FileSystemError } from "../utils/errors.js";

/* ========================================================================== */
/* 🧩 Basis-Utilities                                                        */
/* ========================================================================== */

/**
 * Prüft, ob ein Pfad existiert (Datei oder Ordner).
 */
export function pathExists(filePath: string): boolean {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

/**
 * Erstellt ein Verzeichnis (rekursiv, falls nötig).
 */
export function ensureDir(dirPath: string): void {
  try {
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new FileSystemError(
      dirPath,
      "Verzeichnis konnte nicht erstellt werden",
      { error: message },
    );
  }
}

/**
 * Liefert Dateigröße (in Byte), falls existent.
 */
export function getFileSize(filePath: string): number {
  try {
    if (!fs.existsSync(filePath)) return 0;
    const stats = fs.statSync(filePath);
    return stats.size;
  } catch {
    return 0;
  }
}

/* ========================================================================== */
/* 💾 Dateioperationen (sicher & robust)                                     */
/* ========================================================================== */

/**
 * Liest eine Textdatei (UTF-8).
 */
export async function readTextFile(filePath: string): Promise<string> {
  try {
    const data = await fsp.readFile(filePath, "utf8");
    return data;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", `❌ Fehler beim Lesen der Datei`, {
      filePath,
      error: message,
    });
    throw new FileSystemError(filePath, "Fehler beim Lesen", {
      error: message,
    });
  }
}

/**
 * Schreibt eine Textdatei sicher (mit Backup und atomischem Schreiben).
 */
export async function writeTextFile(
  filePath: string,
  content: string,
): Promise<void> {
  try {
    ensureDir(path.dirname(filePath));

    // Backup erstellen, falls Datei existiert
    if (fs.existsSync(filePath)) {
      const backupPath = `${filePath}.bak_${Date.now()}`;
      await fsp.copyFile(filePath, backupPath);
      log("info", `📦 Backup erstellt`, { backupPath });
    }

    // Atomisches Schreiben über temporäre Datei
    const tempPath = `${filePath}.tmp`;
    await fsp.writeFile(tempPath, content, "utf8");
    await fsp.rename(tempPath, filePath);

    log("info", `💾 Datei gespeichert`, {
      filePath,
      size: Buffer.byteLength(content),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new FileSystemError(filePath, "Fehler beim Schreiben", {
      error: message,
    });
  }
}

/**
 * Löscht eine Datei sicher.
 */
export async function deleteFile(filePath: string): Promise<boolean> {
  try {
    if (!fs.existsSync(filePath)) return false;
    await fsp.unlink(filePath);
    log("info", `🗑️ Datei gelöscht`, { filePath });
    return true;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new FileSystemError(filePath, "Fehler beim Löschen", {
      error: message,
    });
  }
}

/* ========================================================================== */
/* 📄 JSON- & YAML-Helfer                                                    */
/* ========================================================================== */

/**
 * Liest JSON-Dateien sicher mit Fallback auf leeres Objekt.
 */
export async function readJsonFile<T = Record<string, unknown>>(
  filePath: string,
): Promise<T> {
  try {
    const data = await fsp.readFile(filePath, "utf8");
    return JSON.parse(data) as T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log("warn", "⚠️ Fehler beim Lesen von JSON", {
      filePath,
      error: message,
    });
    return {} as T;
  }
}

/**
 * Schreibt ein JSON-Objekt schön formatiert.
 */
export async function writeJsonFile(
  filePath: string,
  data: unknown,
): Promise<void> {
  const json = JSON.stringify(data, null, 2);
  await writeTextFile(filePath, json);
}

/**
 * Liest YAML-Dateien sicher.
 */
export async function readYamlFile<T = Record<string, unknown>>(
  filePath: string,
): Promise<T> {
  try {
    const text = await fsp.readFile(filePath, "utf8");
    return yaml.parse(text) as T;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    log("error", "Fehler beim Lesen von YAML", {
      filePath,
      error: message,
    });
    throw new FileSystemError(filePath, "Fehler beim Lesen von YAML", {
      error: message,
    });
  }
}

/**
 * Schreibt YAML-Dateien.
 */
export async function writeYamlFile(
  filePath: string,
  data: unknown,
): Promise<void> {
  try {
    const yamlText = yaml.stringify(data);
    await writeTextFile(filePath, yamlText);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new FileSystemError(filePath, "Fehler beim Schreiben von YAML", {
      error: message,
    });
  }
}

/* ========================================================================== */
/* 🧩 Temporär- und Hilfsfunktionen                                          */
/* ========================================================================== */

/**
 * Erstellt eine temporäre Datei mit Inhalt und gibt Pfad zurück.
 */
export async function createTempFile(
  prefix = "tmp_",
  content = "",
): Promise<string> {
  const filePath = path.join(os.tmpdir(), `${prefix}${Date.now()}.tmp`);
  await fsp.writeFile(filePath, content, "utf8");
  return filePath;
}

/**
 * Liest alle Dateien eines Verzeichnisses (optional gefiltert).
 */
export function listFilesInDir(dir: string, extFilter?: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir).map((f) => path.join(dir, f));
  return extFilter ? files.filter((f) => f.endsWith(extFilter)) : files;
}

/**
 * Erzeugt einen relativen Pfad ab Projektstamm.
 */
export function relativeToRoot(filePath: string): string {
  return path.relative(process.cwd(), filePath);
}

/**
 * Prüft, ob Datei lesbar ist.
 */
export function isReadable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Prüft, ob Datei beschreibbar ist.
 */
export function isWritable(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/* ========================================================================== */
/* 🧾 Zusammenfassung / Status                                               */
/* ========================================================================== */

/**
 * Liefert eine kurze Dateiübersicht.
 */
export function getFileInfo(filePath: string) {
  try {
    const stats = fs.statSync(filePath);
    return {
      exists: true,
      size_bytes: stats.size,
      modified: stats.mtime.toISOString(),
      created: stats.birthtime.toISOString(),
      readable: isReadable(filePath),
      writable: isWritable(filePath),
    };
  } catch {
    return { exists: false };
  }
}

/* ========================================================================== */
/* ✅ Export                                                                 */
/* ========================================================================== */

export default {
  pathExists,
  ensureDir,
  getFileSize,
  readTextFile,
  writeTextFile,
  deleteFile,
  readJsonFile,
  writeJsonFile,
  readYamlFile,
  writeYamlFile,
  createTempFile,
  listFilesInDir,
  relativeToRoot,
  isReadable,
  isWritable,
  getFileInfo,
};
