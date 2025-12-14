/**
 * fileTools.ts
 * Erweiterte Datei- und Verzeichniswerkzeuge für ERP- & KI-Systeme.
 * Unterstützt Lesen, Schreiben, Auflisten, Metadaten, Sicherheit & Analyse.
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import zlib from "node:zlib";
import os from "node:os";
import type { ToolFunction } from "./registry.js";

/**
 * Registrierung der Datei-Tools
 */
export function registerTools(toolRegistry: {
  register: (name: string, fn: ToolFunction) => void;
}) {
  /* ─────────────────────────────────────────────
   * 📖 Datei lesen
   * ───────────────────────────────────────────── */
  const readFileTool = (async ({
    filepath,
    encoding = "utf8",
  }: {
    filepath: string;
    encoding?: BufferEncoding;
  }) => {
    try {
      const resolved = path.resolve(filepath);
      const data = await fs.promises.readFile(resolved, encoding);
      const stats = await fs.promises.stat(resolved);
      return {
        success: true,
        filepath: resolved,
        encoding,
        size: stats.size,
        modified: stats.mtime,
        content: data,
      };
    } catch (err) {
      return { success: false, error: String(err), filepath };
    }
  }) as ToolFunction;

  readFileTool.description = "Liest den Inhalt einer Datei mit Metadaten.";
  readFileTool.parameters = {
    filepath: "Pfad zur Datei",
    encoding: "Dateikodierung (Standard: utf8)",
  };
  readFileTool.category = "file_operations";
  readFileTool.version = "1.1";
  toolRegistry.register("read_file", readFileTool);

  /* ─────────────────────────────────────────────
   * ✍️ Datei schreiben
   * ───────────────────────────────────────────── */
  const writeFileTool = (async ({
    filepath,
    content,
    encoding = "utf8",
    append = false,
  }: {
    filepath: string;
    content: string | Buffer;
    encoding?: BufferEncoding;
    append?: boolean;
  }) => {
    try {
      const resolved = path.resolve(filepath);
      await fs.promises.mkdir(path.dirname(resolved), { recursive: true });

      if (append) {
        await fs.promises.appendFile(resolved, content, encoding);
      } else {
        await fs.promises.writeFile(resolved, content, encoding);
      }

      const stats = await fs.promises.stat(resolved);
      return {
        success: true,
        filepath: resolved,
        mode: append ? "append" : "write",
        size: stats.size,
        modified: stats.mtime,
      };
    } catch (err) {
      return { success: false, error: String(err), filepath };
    }
  }) as ToolFunction;

  writeFileTool.description =
    "Schreibt Text oder Binärdaten in eine Datei (optional anhängen).";
  writeFileTool.parameters = {
    filepath: "Zieldatei",
    content: "Inhalt (Text oder Buffer)",
    encoding: "Zeichencodierung (Standard: utf8)",
    append: "Falls true, wird angehängt statt überschrieben",
  };
  writeFileTool.category = "file_operations";
  toolRegistry.register("write_file", writeFileTool);

  /* ─────────────────────────────────────────────
   * 📂 Dateien im Verzeichnis auflisten
   * ───────────────────────────────────────────── */
  const listFilesTool = (async ({
    directory,
    recursive = false,
    pattern,
    includeHidden = false,
  }: {
    directory: string;
    recursive?: boolean;
    pattern?: string;
    includeHidden?: boolean;
  }) => {
    try {
      const baseDir = path.resolve(directory);

      async function walk(dir: string): Promise<string[]> {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const files: string[] = [];

        for (const entry of entries) {
          if (!includeHidden && entry.name.startsWith(".")) continue;
          const fullPath = path.join(dir, entry.name);
          if (entry.isDirectory() && recursive) {
            files.push(...(await walk(fullPath)));
          } else if (entry.isFile()) {
            if (!pattern || new RegExp(pattern, "i").test(entry.name)) {
              files.push(fullPath);
            }
          }
        }
        return files;
      }

      const files = await walk(baseDir);
      return {
        success: true,
        directory: baseDir,
        count: files.length,
        files,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  listFilesTool.description =
    "Listet Dateien in einem Verzeichnis (rekursiv, mit Filteroptionen).";
  listFilesTool.parameters = {
    directory: "Startverzeichnis",
    recursive: "Rekursiv durchsuchen",
    pattern: "Regex-Filter für Dateinamen",
    includeHidden: "Versteckte Dateien einbeziehen",
  };
  listFilesTool.category = "file_operations";
  toolRegistry.register("list_files", listFilesTool);

  /* ─────────────────────────────────────────────
   * 🧾 Datei-Infos & Checksummen
   * ───────────────────────────────────────────── */
  const fileInfoTool = (async ({
    filepath,
    hash = false,
  }: {
    filepath: string;
    hash?: boolean;
  }) => {
    try {
      const resolved = path.resolve(filepath);
      const stats = await fs.promises.stat(resolved);
      let checksum: string | undefined;

      if (hash && stats.isFile()) {
        const data = await fs.promises.readFile(resolved);
        checksum = crypto.createHash("sha256").update(data).digest("hex");
      }

      return {
        success: true,
        filepath: resolved,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime,
        isDirectory: stats.isDirectory(),
        isFile: stats.isFile(),
        checksum,
      };
    } catch (err) {
      return { success: false, error: String(err), filepath };
    }
  }) as ToolFunction;

  fileInfoTool.description =
    "Liefert Metadaten zu einer Datei, optional mit SHA-256-Checksumme.";
  fileInfoTool.parameters = {
    filepath: "Pfad zur Datei",
    hash: "Falls true, berechnet SHA-256-Hash",
  };
  fileInfoTool.category = "file_operations";
  toolRegistry.register("file_info", fileInfoTool);

  /* ─────────────────────────────────────────────
   * 🧹 Datei löschen
   * ───────────────────────────────────────────── */
  const deleteFileTool = (async ({ filepath }: { filepath: string }) => {
    try {
      const resolved = path.resolve(filepath);
      await fs.promises.unlink(resolved);
      return { success: true, filepath: resolved, message: "Datei gelöscht" };
    } catch (err) {
      return { success: false, error: String(err), filepath };
    }
  }) as ToolFunction;

  deleteFileTool.description = "Löscht eine angegebene Datei sicher.";
  deleteFileTool.parameters = { filepath: "Pfad zur Datei" };
  deleteFileTool.category = "file_operations";
  toolRegistry.register("delete_file", deleteFileTool);

  /* ─────────────────────────────────────────────
   * 🧩 Dateiinhalt analysieren (Format-Erkennung)
   * ───────────────────────────────────────────── */
  const parseFileTool = (async ({ filepath }: { filepath: string }) => {
    try {
      const resolved = path.resolve(filepath);
      const content = await fs.promises.readFile(resolved, "utf8");

      let data: any = content;
      let type = "text";
      if (
        /^\s*\{[\s\S]*\}\s*$/.test(content) ||
        /^\s*\[[\s\S]*\]\s*$/.test(content)
      ) {
        try {
          data = JSON.parse(content);
          type = "json";
        } catch {
          // Not JSON, will check other formats
        }
      } else if (/,|;/.test(content.split("\n")[0])) {
        type = "csv_like";
      }

      return { success: true, filepath: resolved, type, data };
    } catch (err) {
      return { success: false, error: String(err), filepath };
    }
  }) as ToolFunction;

  parseFileTool.description =
    "Erkennt automatisch Dateiinhalt (JSON, CSV, Text) und parst ihn.";
  parseFileTool.parameters = { filepath: "Pfad zur Datei" };
  parseFileTool.category = "file_operations";
  toolRegistry.register("parse_file", parseFileTool);

  /* ─────────────────────────────────────────────
   * 🗜️ Datei komprimieren
   * ───────────────────────────────────────────── */
  const compressFileTool = (async ({ filepath }: { filepath: string }) => {
    try {
      const resolved = path.resolve(filepath);
      const buffer = await fs.promises.readFile(resolved);
      const compressed = zlib.gzipSync(buffer);
      const gzPath = resolved + ".gz";
      await fs.promises.writeFile(gzPath, compressed);
      return {
        success: true,
        filepath: gzPath,
        original: resolved,
        ratio: (compressed.length / buffer.length).toFixed(2),
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  compressFileTool.description = "Komprimiert eine Datei mit Gzip.";
  compressFileTool.parameters = { filepath: "Pfad zur Quelldatei" };
  compressFileTool.category = "file_operations";
  toolRegistry.register("compress_file", compressFileTool);

  /* ─────────────────────────────────────────────
   * 🔓 Datei-Berechtigungen anzeigen
   * ───────────────────────────────────────────── */
  const filePermissionsTool = (async ({ filepath }: { filepath: string }) => {
    try {
      const resolved = path.resolve(filepath);
      const stats = await fs.promises.stat(resolved);
      const mode = (stats.mode & 0o777).toString(8);
      return {
        success: true,
        filepath: resolved,
        permissions: mode,
        owner: os.userInfo().username,
        readable:
          fs.existsSync(resolved) &&
          fs.accessSync(resolved, fs.constants.R_OK) === undefined,
        writable:
          fs.existsSync(resolved) &&
          fs.accessSync(resolved, fs.constants.W_OK) === undefined,
      };
    } catch (err) {
      return { success: false, error: String(err) };
    }
  }) as ToolFunction;

  filePermissionsTool.description =
    "Zeigt Datei-Berechtigungen und Eigentümer an.";
  filePermissionsTool.parameters = { filepath: "Pfad zur Datei" };
  filePermissionsTool.category = "file_operations";
  toolRegistry.register("file_permissions", filePermissionsTool);
}
