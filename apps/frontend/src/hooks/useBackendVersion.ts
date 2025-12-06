// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useBackendVersion.ts

import { useState, useEffect } from "react";

interface BackendVersionInfo {
  version: string;
  buildDate: string;
  name: string;
  environment: string;
  nodeVersion: string;
  platform: string;
  arch: string;
}

/**
 * Hook to fetch backend version information
 */
export function useBackendVersion() {
  const [versionInfo, setVersionInfo] = useState<BackendVersionInfo | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch("/api/health/version");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setVersionInfo(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch");
        console.warn("Could not fetch backend version:", err);
      } finally {
        setLoading(false);
      }
    };

    void fetchVersion();
  }, []);

  return { versionInfo, loading, error };
}
