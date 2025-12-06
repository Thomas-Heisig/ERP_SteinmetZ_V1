// SPDX-License-Identifier: MIT
// apps/frontend/src/version.ts

/**
 * Version information for the frontend application
 */

export const VERSION_INFO = {
  version: "0.3.0",
  buildDate: new Date().toISOString(),
  name: "ERP SteinmetZ Frontend",
  environment: import.meta.env.MODE || "development",
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
  };
}
