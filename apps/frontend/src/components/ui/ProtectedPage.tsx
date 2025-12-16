// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/ProtectedPage.tsx

import React, { Suspense } from "react";
import ProtectedRoute from "../Auth/ProtectedRoute";
import { ErrorBoundary } from "./ErrorBoundary";
import { LoadingFallback } from "./LoadingFallback";

interface ProtectedPageProps {
  children: React.ReactNode;
}

export const ProtectedPage: React.FC<ProtectedPageProps> = ({ children }) => (
  <ProtectedRoute>
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
    </ErrorBoundary>
  </ProtectedRoute>
);
