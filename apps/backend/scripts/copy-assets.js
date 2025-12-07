#!/usr/bin/env node
// SPDX-License-Identifier: MIT
// apps/backend/scripts/copy-assets.js

/**
 * Copy non-TypeScript assets (views, migrations, SQL files, etc.) from src to dist
 * This ensures the built application has all required runtime files
 * Also updates the build date in version.js
 */

import {
  copyFileSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Directories and file patterns to copy
const assetsToCopy = [
  { from: "src/views", to: "dist/views", pattern: /\.(html|css|js)$/ },
  { from: "src/migrations", to: "dist/migrations", pattern: /\.sql$/ },
];

/**
 * Recursively copy directory
 */
function copyDirectory(src, dest, pattern) {
  // Create destination directory
  mkdirSync(dest, { recursive: true });

  const entries = readdirSync(src);

  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      // Recursively copy subdirectories
      copyDirectory(srcPath, destPath, pattern);
    } else if (stat.isFile() && pattern.test(entry)) {
      // Copy file if it matches pattern
      copyFileSync(srcPath, destPath);
      console.log(`✓ Copied: ${entry}`);
    }
  }
}

console.log("📦 Copying backend assets...");

for (const asset of assetsToCopy) {
  const srcPath = join(__dirname, "..", asset.from);
  const destPath = join(__dirname, "..", asset.to);

  try {
    console.log(`\n📁 Copying ${asset.from} → ${asset.to}`);
    copyDirectory(srcPath, destPath, asset.pattern);
  } catch (error) {
    console.error(`❌ Error copying ${asset.from}:`, error.message);
  }
}

console.log("\n✅ Asset copy complete!");

// Update build date in version.js
console.log("\n📝 Updating build date in version.js...");
try {
  const versionFilePath = join(__dirname, "..", "dist", "version.js");
  let versionContent = readFileSync(versionFilePath, "utf-8");
  const buildDate = new Date().toISOString();
  // Use regex to replace only the buildDate property value
  versionContent = versionContent.replace(
    /buildDate:\s*"__BUILD_DATE__"/,
    `buildDate: "${buildDate}"`,
  );
  writeFileSync(versionFilePath, versionContent, "utf-8");
  console.log(`✓ Build date updated: ${buildDate}`);
} catch (error) {
  console.warn("⚠️  Could not update build date:", error.message);
}

console.log("\n✅ Build process complete!");
