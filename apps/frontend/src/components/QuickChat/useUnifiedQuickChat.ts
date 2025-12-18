// SPDX-License-Identifier: MIT
// apps/frontend/src/components/QuickChat/useUnifiedQuickChat.ts

/**
 * Hook to access UnifiedQuickChat context
 *
 * @module useUnifiedQuickChat
 * @throws {Error} If used outside UnifiedQuickChatProvider
 *
 * @example
 * ```tsx
 * const {
 *   sessions,
 *   currentSession,
 *   loading,
 *   sendMessage,
 *   createSession,
 * } = useUnifiedQuickChat();
 * ```
 */

import { useContext } from "react";
import {
  UnifiedQuickChatContext,
  type UnifiedQuickChatContextValue,
} from "./UnifiedQuickChatContextValue";

export const useUnifiedQuickChat = (): UnifiedQuickChatContextValue => {
  const context = useContext(UnifiedQuickChatContext);
  if (!context) {
    throw new Error(
      "useUnifiedQuickChat must be used within UnifiedQuickChatProvider",
    );
  }
  return context;
};
