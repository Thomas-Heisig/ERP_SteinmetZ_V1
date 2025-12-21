// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/LoadingFallback.tsx

/**
 * Loading Fallback Component
 * 
 * A fullscreen loading indicator used as a fallback for React Suspense boundaries
 * and lazy-loaded components. Displays the ERP SteinmetZ branding with an
 * animated spinner.
 * 
 * @module LoadingFallback
 * @category UI Components
 * 
 * @example
 * ```tsx
 * import { Suspense } from 'react';
 * import { LoadingFallback } from './components/ui/LoadingFallback';
 * 
 * function App() {
 *   return (
 *     <Suspense fallback={<LoadingFallback />}>
 *       <LazyComponent />
 *     </Suspense>
 *   );
 * }
 * ```
 */

import React from "react";

/**
 * Fullscreen loading spinner for suspense boundaries
 * 
 * @returns {React.FC} Loading fallback component
 */
export const LoadingFallback: React.FC = () => (
  <div className="loading-state loading-fullscreen">
    <div className="loading-spinner loading-large">🧱</div>
    <div className="loading-text">ERP SteinmetZ lädt...</div>
  </div>
);
