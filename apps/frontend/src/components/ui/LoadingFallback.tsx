// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/LoadingFallback.tsx

import React from "react";

export const LoadingFallback: React.FC = () => (
  <div className="loading-state loading-fullscreen">
    <div className="loading-spinner loading-large">🧱</div>
    <div className="loading-text">ERP SteinmetZ lädt...</div>
  </div>
);
