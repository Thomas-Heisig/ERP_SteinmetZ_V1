// SPDX-License-Identifier: MIT
// apps/frontend/src/hooks/useWebSocket.ts

/**
 * WebSocket Hook for Real-Time Updates
 * Provides easy integration with backend WebSocket service
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";

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

interface UseWebSocketReturn {
  /** Socket instance */
  socket: Socket | null;
  /** Connection status */
  isConnected: boolean;
  /** Connect manually */
  connect: () => void;
  /** Disconnect */
  disconnect: () => void;
  /** Emit event */
  emit: (event: string, data?: any) => void;
  /** Join a room */
  joinRoom: (room: string) => void;
  /** Leave a room */
  leaveRoom: (room: string) => void;
  /** Subscribe to an event */
  on: (event: string, handler: (data: any) => void) => void;
  /** Unsubscribe from an event */
  off: (event: string, handler: (data: any) => void) => void;
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
      console.log("✅ WebSocket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ WebSocket disconnected:", reason);
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("WebSocket connection error:", error.message);
      setIsConnected(false);
    });

    socket.on("welcome", (data) => {
      console.log("Welcome message:", data);
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

  const emit = useCallback((event: string, data?: any) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn("Socket not connected. Cannot emit event:", event);
    }
  }, []);

  const joinRoom = useCallback(
    (room: string) => {
      emit("join-room", room);
    },
    [emit],
  );

  const leaveRoom = useCallback(
    (room: string) => {
      emit("leave-room", room);
    },
    [emit],
  );

  const on = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on(event, handler);
    }
  }, []);

  const off = useCallback((event: string, handler: (data: any) => void) => {
    if (socketRef.current) {
      socketRef.current.off(event, handler);
    }
  }, []);

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
    socket: socketRef.current,
    isConnected,
    connect,
    disconnect,
    emit,
    joinRoom,
    leaveRoom,
    on,
    off,
  };
}

/**
 * Hook for subscribing to specific WebSocket events
 */
export function useWebSocketEvent<T = any>(
  event: string,
  handler: (data: T) => void,
  deps: any[] = [],
) {
  const { socket, isConnected } = useWebSocket({ autoConnect: true });

  useEffect(() => {
    if (socket && isConnected) {
      socket.on(event, handler);

      return () => {
        socket.off(event, handler);
      };
    }
  }, [socket, isConnected, event, ...deps]);
}

/**
 * Hook for dashboard real-time updates
 */
export function useDashboardUpdates(
  onUpdate: (data: any) => void,
  onWidgetUpdate?: (data: any) => void,
) {
  const { socket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
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
  }, [socket, isConnected, onUpdate, onWidgetUpdate, joinRoom, leaveRoom]);

  return { isConnected };
}

/**
 * Hook for chat real-time updates
 */
export function useChatUpdates(
  onMessage: (data: any) => void,
  onTyping?: (data: any) => void,
) {
  const { socket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
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
  }, [socket, isConnected, onMessage, onTyping, joinRoom, leaveRoom]);

  return { isConnected };
}

/**
 * Hook for batch processing real-time updates
 */
export function useBatchUpdates(
  batchId: string | null,
  onProgress?: (data: any) => void,
  onComplete?: (data: any) => void,
  onError?: (data: any) => void,
) {
  const { socket, isConnected, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
  });

  useEffect(() => {
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
    socket,
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
