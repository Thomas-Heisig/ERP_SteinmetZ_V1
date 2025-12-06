// SPDX-License-Identifier: MIT
// apps/backend/src/version.ts

/**
 * Version information for the backend application
 * This file is automatically updated during the build process
 */

export const VERSION_INFO = {
  version: "0.3.0",
  buildDate: new Date().toISOString(),
  name: "ERP SteinmetZ Backend",
  environment: process.env.NODE_ENV || "development",
} as const;

/**
 * Get formatted version string
 */
export function getVersionString(): string {
  return `${VERSION_INFO.name} v${VERSION_INFO.version} (${VERSION_INFO.environment})`;
}

/**
 * Get version info object
 */
export function getVersionInfo() {
  return {
    ...VERSION_INFO,
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
  };
}
