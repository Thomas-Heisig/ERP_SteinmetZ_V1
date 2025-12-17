// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useWebSocket.ts

/**
 * WebSocket Hook for Real-Time Updates
 * Provides easy integration with backend WebSocket service
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { createLogger } from "../utils/logger.js";

const logger = createLogger("websocket");

interface UseWebSocketOptions {
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Authentication token */
  token?: string;
  /** Reconnection configuration */
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
}

type WebSocketData = Record<string, unknown>;

interface UseWebSocketReturn {
  /** Connection status */
  isConnected: boolean;
  /** Connect manually */
  connect: () => void;
  /** Disconnect */
  disconnect: () => void;
  /** Emit event */
  emit: (event: string, data?: WebSocketData) => void;
  /** Join a room */
  joinRoom: (room: string) => void;
  /** Leave a room */
  leaveRoom: (room: string) => void;
  /** Subscribe to an event */
  on: <T = WebSocketData>(event: string, handler: (data: T) => void) => void;
  /** Unsubscribe from an event */
  off: <T = WebSocketData>(event: string, handler: (data: T) => void) => void;
  /** Get socket instance (use with caution) */
  getSocket: () => Socket | null;
}

/**
 * WebSocket hook for real-time communication
 */
export function useWebSocket(
  options: UseWebSocketOptions = {},
): UseWebSocketReturn {
  const {
    autoConnect = true,
    token,
    reconnection = true,
    reconnectionAttempts = 5,
    reconnectionDelay = 1000,
  } = options;

  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const connect = useCallback(() => {
    if (socketRef.current?.connected) {
      return;
    }

    const socket = io(apiUrl, {
      auth: token ? { token } : undefined,
      reconnection,
      reconnectionAttempts,
      reconnectionDelay,
      transports: ["websocket", "polling"],
    });

    socket.on("connect", () => {
      logger.info("WebSocket connected", { socketId: socket.id });
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      logger.info("WebSocket disconnected", { reason });
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      logger.error("WebSocket connection error", { message: error.message });
      setIsConnected(false);
    });

    socket.on("welcome", (data) => {
      logger.debug("Welcome message received", { data });
    });

    socketRef.current = socket;
  }, [apiUrl, token, reconnection, reconnectionAttempts, reconnectionDelay]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const emit = useCallback((event: string, data?: WebSocketData) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }, []);

  const joinRoom = useCallback(
    (room: string) => {
      emit("join-room", { room });
    },
    [emit],
  );

  const leaveRoom = useCallback(
    (room: string) => {
      emit("leave-room", { room });
    },
    [emit],
  );

  const on = useCallback(
    <T = WebSocketData>(event: string, handler: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.on(event, handler);
      }
    },
    [],
  );

  const off = useCallback(
    <T = WebSocketData>(event: string, handler: (data: T) => void) => {
      if (socketRef.current) {
        socketRef.current.off(event, handler);
      }
    },
    [],
  );

  const getSocket = useCallback(() => socketRef.current, []);

  // Auto-connect on mount if enabled
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [autoConnect, connect, disconnect]);

  return {
    isConnected,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    on,
    off,
    getSocket,
  };
}

/**
 * Hook for subscribing to specific WebSocket events
 */
export function useWebSocketEvent<T = WebSocketData>(
  event: string,
  handler: (data: T) => void,
  deps: React.DependencyList = [],
) {
  const { getSocket, isConnected, on, off } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket && isConnected) {
      on<T>(event, handler);

      return () => {
        off<T>(event, handler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getSocket, isConnected, event, handler, ...deps]);
}

interface DashboardUpdate {
  type: string;
  payload: WebSocketData;
}

/**
 * Hook for dashboard real-time updates
 */
export function useDashboardUpdates(
  onUpdate: (data: DashboardUpdate) => void,
  onWidgetUpdate?: (data: DashboardUpdate) => void,
) {
  const { getSocket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket && isConnected) {
      // Join dashboard room
      joinRoom("dashboard");

      // Subscribe to dashboard events
      socket.on("dashboard:update", onUpdate);

      if (onWidgetUpdate) {
        socket.on("dashboard:widget-update", onWidgetUpdate);
      }

      return () => {
        socket.off("dashboard:update", onUpdate);
        if (onWidgetUpdate) {
          socket.off("dashboard:widget-update", onWidgetUpdate);
        }
        leaveRoom("dashboard");
      };
    }
  }, [getSocket, isConnected, onUpdate, onWidgetUpdate, joinRoom, leaveRoom]);

  return { isConnected };
}

interface ChatMessage {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
}

interface TypingStatus {
  userId: string;
  isTyping: boolean;
}

/**
 * Hook for chat real-time updates
 */
export function useChatUpdates(
  onMessage: (data: ChatMessage) => void,
  onTyping?: (data: TypingStatus) => void,
) {
  const { getSocket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket && isConnected) {
      // Join chat room
      joinRoom("chat");

      // Subscribe to chat events
      socket.on("chat:message", onMessage);

      if (onTyping) {
        socket.on("chat:typing", onTyping);
      }

      return () => {
        socket.off("chat:message", onMessage);
        if (onTyping) {
          socket.off("chat:typing", onTyping);
        }
        leaveRoom("chat");
      };
    }
  }, [getSocket, isConnected, onMessage, onTyping, joinRoom, leaveRoom]);

  return { isConnected };
}

interface BatchProgress {
  progress: number;
  total: number;
  message?: string;
}

interface BatchComplete {
  batchId: string;
  results: WebSocketData;
}

interface BatchError {
  batchId: string;
  error: string;
}

/**
 * Hook for batch processing real-time updates
 */
export function useBatchUpdates(
  batchId: string | null,
  onProgress?: (data: BatchProgress) => void,
  onComplete?: (data: BatchComplete) => void,
  onError?: (data: BatchError) => void,
) {
  const { getSocket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
    const socket = getSocket();
    if (socket && isConnected && batchId) {
      // Join batch-specific room
      joinRoom(`batch:${batchId}`);

      // Subscribe to batch events
      if (onProgress) {
        socket.on("batch:progress", onProgress);
      }
      if (onComplete) {
        socket.on("batch:complete", onComplete);
      }
      if (onError) {
        socket.on("batch:error", onError);
      }

      return () => {
        if (onProgress) socket.off("batch:progress", onProgress);
        if (onComplete) socket.off("batch:complete", onComplete);
        if (onError) socket.off("batch:error", onError);
        leaveRoom(`batch:${batchId}`);
      };
    }
  }, [
    getSocket,
    isConnected,
    batchId,
    onProgress,
    onComplete,
    onError,
    joinRoom,
    leaveRoom,
  ]);

  return { isConnected };
}
