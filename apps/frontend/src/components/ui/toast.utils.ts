// SPDX-License-Identifier: MIT
// apps/frontend/src/components/ui/toast.utils.ts

import type { ToastType } from "./useToast";

export const toast = {
  success: (message: string, duration?: number) => ({
    type: "success" as ToastType,
    message,
    duration,
  }),
  error: (message: string, duration?: number) => ({
    type: "error" as ToastType,
    message,
    duration,
  }),
  warning: (message: string, duration?: number) => ({
    type: "warning" as ToastType,
    message,
    duration,
  }),
  info: (message: string, duration?: number) => ({
    type: "info" as ToastType,
    message,
    duration,
  }),
};

export const toastIcons: Record<ToastType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};
