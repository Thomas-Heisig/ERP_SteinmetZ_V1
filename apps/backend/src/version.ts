// SPDX-License-Identifier: MIT
// apps/backend/src/version.ts

/**
 * Version information for the backend application
 * Note: buildDate will be replaced during the build process with the actual build timestamp
 */

export const VERSION_INFO = {
  version: "0.3.0",
  buildDate: "__BUILD_DATE__",
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
