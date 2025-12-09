// SPDX-License-Identifier: MIT
// apps/backend/src/services/websocketService.ts

/**
 * WebSocket Service
 *
 * Provides real-time bidirectional communication between server and clients
 * using Socket.IO. Enables push notifications, live updates, and interactive features.
 * 
 * Features:
 * - JWT-based authentication
 * - Room-based broadcasting
 * - Connection tracking and management
 * - Automatic reconnection handling
 * - CORS-enabled for cross-origin requests
 * 
 * Supported event types:
 * - `dashboard:update` - Dashboard widget updates
 * - `chat:message` - New chat messages
 * - `system:notification` - System-wide notifications
 * - `batch:progress` - Batch processing progress updates
 * - `catalog:update` - Functions catalog changes
 * 
 * @example
 * ```typescript
 * // Initialize in server setup
 * const httpServer = http.createServer(app);
 * websocketService.initialize(httpServer);
 * 
 * // Broadcast to all connected clients
 * websocketService.broadcast('dashboard:update', {
 *   widget: 'user-stats',
 *   data: { activeUsers: 42 }
 * });
 * 
 * // Send to specific room
 * websocketService.toRoom('admin', 'system:notification', {
 *   level: 'warning',
 *   message: 'Server maintenance in 1 hour'
 * });
 * 
 * // Send to specific user
 * websocketService.toUser('user-123', 'chat:message', {
 *   from: 'support',
 *   text: 'How can I help you?'
 * });
 * ```
 */

import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { log } from "../routes/ai/utils/logger.js";

/**
 * Socket.IO socket with authentication context
 */
interface AuthenticatedSocket extends Socket {
  /** Authenticated user ID */
  userId?: string;
  /** User roles for authorization */
  userRoles?: string[];
}

/**
 * Active WebSocket connection metadata
 */
interface ConnectionInfo {
  /** Socket.IO connection ID */
  socketId: string;
  /** Authenticated user ID (if authenticated) */
  userId?: string;
  /** Connection timestamp (Unix ms) */
  connectedAt: number;
  /** List of joined rooms */
  rooms: string[];
}

class WebSocketService {
  private io: Server | null = null;
  private connections = new Map<string, ConnectionInfo>();

  /**
   * Initialize WebSocket server and attach to HTTP server
   * 
   * Sets up Socket.IO with authentication middleware, CORS configuration,
   * and event handlers. Must be called after Express app is created.
   * 
   * @param httpServer - Node.js HTTP server instance
   * 
   * @example
   * ```typescript
   * const app = express();
   * const httpServer = http.createServer(app);
   * websocketService.initialize(httpServer);
   * httpServer.listen(3000);
   * ```
   */
  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:5173",
        methods: ["GET", "POST"],
        credentials: true,
      },
      // Connection options
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    log("info", "🔌 WebSocket server initialized");
  }

  /**
   * Setup authentication middleware
   */
  private setupMiddleware(): void {
    if (!this.io) return;

    this.io.use((socket: AuthenticatedSocket, next) => {
      // Prioritize auth.token, fallback to authorization header
      let token = socket.handshake.auth.token;

      if (!token && socket.handshake.headers.authorization) {
        const authHeader = socket.handshake.headers.authorization;
        if (
          typeof authHeader === "string" &&
          authHeader.startsWith("Bearer ")
        ) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        // Allow anonymous connections but with limited access
        log("debug", "Anonymous WebSocket connection", { socketId: socket.id });
        return next();
      }

      try {
        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
        const decoded = jwt.verify(token, jwtSecret) as any;

        socket.userId = decoded.id || decoded.userId;
        socket.userRoles = decoded.roles || [];

        log("debug", "Authenticated WebSocket connection", {
          socketId: socket.id,
          userId: socket.userId,
        });

        next();
      } catch (error) {
        log("warn", "WebSocket authentication failed", {
          socketId: socket.id,
          error: error instanceof Error ? error.message : String(error),
        });
        next(new Error("Authentication failed"));
      }
    });
  }

  /**
   * Setup event handlers for connections
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      const connectionInfo: ConnectionInfo = {
        socketId: socket.id,
        userId: socket.userId,
        connectedAt: Date.now(),
        rooms: [],
      };

      this.connections.set(socket.id, connectionInfo);

      log("info", "✅ Client connected", {
        socketId: socket.id,
        userId: socket.userId,
        totalConnections: this.connections.size,
      });

      // Send welcome message
      socket.emit("welcome", {
        message: "Connected to ERP SteinmetZ WebSocket",
        socketId: socket.id,
        timestamp: Date.now(),
      });

      // Handle room joining
      socket.on("join-room", (room: string) => {
        socket.join(room);
        connectionInfo.rooms.push(room);
        log("debug", `Client joined room: ${room}`, { socketId: socket.id });
        socket.emit("room-joined", { room });
      });

      // Handle room leaving
      socket.on("leave-room", (room: string) => {
        socket.leave(room);
        connectionInfo.rooms = connectionInfo.rooms.filter((r) => r !== room);
        log("debug", `Client left room: ${room}`, { socketId: socket.id });
        socket.emit("room-left", { room });
      });

      // Handle ping for connection testing
      socket.on("ping", () => {
        socket.emit("pong", { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on("disconnect", (reason) => {
        this.connections.delete(socket.id);
        log("info", "❌ Client disconnected", {
          socketId: socket.id,
          userId: socket.userId,
          reason,
          totalConnections: this.connections.size,
        });
      });

      // Handle errors
      socket.on("error", (error) => {
        log("error", "WebSocket error", {
          socketId: socket.id,
          error: error.message,
        });
      });
    });
  }

  /**
   * Broadcast event to all connected clients
   * 
   * Sends an event to every active WebSocket connection, regardless of
   * authentication status or room membership. Use for system-wide notifications.
   * 
   * @param event - Event name (e.g., 'system:notification', 'dashboard:update')
   * @param data - Event payload (will be JSON serialized)
   * 
   * @example
   * ```typescript
   * // Notify all users of system maintenance
   * websocketService.broadcast('system:notification', {
   *   level: 'warning',
   *   title: 'Scheduled Maintenance',
   *   message: 'System will be down for 30 minutes at 2 AM UTC',
   *   timestamp: Date.now()
   * });
   * ```
   */
  broadcast(event: string, data: any): void {
    if (!this.io) {
      log("warn", "Cannot broadcast: WebSocket not initialized");
      return;
    }

    this.io.emit(event, data);
    log("debug", `Broadcasted event: ${event}`, {
      recipients: this.connections.size,
    });
  }

  /**
   * Send event to all clients in a specific room
   * 
   * Delivers event only to sockets that have joined the specified room.
   * Useful for department-specific updates, project teams, or role-based notifications.
   * 
   * @param room - Room name (clients join via 'join-room' event)
   * @param event - Event name
   * @param data - Event payload
   * 
   * @example
   * ```typescript
   * // Notify all admins
   * websocketService.toRoom('admin', 'user:login', {
   *   userId: 'user-123',
   *   ipAddress: '192.168.1.100',
   *   timestamp: Date.now()
   * });
   * 
   * // Update dashboard for finance department
   * websocketService.toRoom('finance', 'dashboard:update', {
   *   widget: 'revenue',
   *   value: 125000
   * });
   * ```
   */
  toRoom(room: string, event: string, data: any): void {
    if (!this.io) {
      log("warn", "Cannot send to room: WebSocket not initialized");
      return;
    }

    this.io.to(room).emit(event, data);
    log("debug", `Sent to room ${room}: ${event}`);
  }

  /**
   * Send event to all active connections for a specific user
   * 
   * Delivers event to all sockets belonging to the user (handles multiple
   * tabs/devices). Requires authenticated connection with userId.
   * 
   * @param userId - Target user ID (from JWT authentication)
   * @param event - Event name
   * @param data - Event payload
   * 
   * @example
   * ```typescript
   * // Send personal notification
   * websocketService.toUser('user-123', 'notification', {
   *   title: 'Task Assigned',
   *   body: 'You have been assigned to Project X',
   *   actionUrl: '/projects/x'
   * });
   * 
   * // Update user's batch processing status
   * websocketService.toUser('user-123', 'batch:progress', {
   *   batchId: 'batch-456',
   *   progress: 75,
   *   status: 'processing'
   * });
   * ```
   */
  toUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      log("warn", "Cannot send to user: WebSocket not initialized");
      return;
    }

    // Find all sockets for this user
    const userSockets = Array.from(this.connections.values())
      .filter((conn) => conn.userId === userId)
      .map((conn) => conn.socketId);

    if (userSockets.length === 0) {
      log("debug", `User ${userId} not connected`);
      return;
    }

    userSockets.forEach((socketId) => {
      this.io?.to(socketId).emit(event, data);
    });

    log("debug", `Sent to user ${userId}: ${event}`, {
      sockets: userSockets.length,
    });
  }

  /**
   * Get WebSocket connection statistics
   * 
   * Returns metrics about active connections, authentication status,
   * and room membership. Useful for monitoring and debugging.
   * 
   * @returns Statistics object with connection counts and room distribution
   * 
   * @example
   * ```typescript
   * const stats = websocketService.getStats();
   * console.log(`Total connections: ${stats.totalConnections}`);
   * console.log(`Authenticated: ${stats.authenticated}`);
   * console.log(`Anonymous: ${stats.anonymous}`);
   * console.log('Rooms:', stats.rooms);
   * ```
   */
  getStats() {
    const connections = Array.from(this.connections.values());
    const authenticated = connections.filter((c) => c.userId).length;
    const anonymous = connections.length - authenticated;

    return {
      totalConnections: this.connections.size,
      authenticated,
      anonymous,
      rooms: this.getRoomStats(),
    };
  }

  /**
   * Get room statistics
   */
  private getRoomStats() {
    const roomCounts: Record<string, number> = {};

    for (const conn of this.connections.values()) {
      for (const room of conn.rooms) {
        roomCounts[room] = (roomCounts[room] || 0) + 1;
      }
    }

    return roomCounts;
  }

  /**
   * Get all connections info (for admin purposes)
   */
  getConnections(): ConnectionInfo[] {
    return Array.from(this.connections.values());
  }

  /**
   * Close WebSocket server
   */
  close(): void {
    if (this.io) {
      this.io.close();
      this.connections.clear();
      log("info", "🔌 WebSocket server closed");
    }
  }
}

// Global WebSocket service instance
export const websocketService = new WebSocketService();

// Event types for type safety
export const WS_EVENTS = {
  // Dashboard events
  DASHBOARD_UPDATE: "dashboard:update",
  WIDGET_UPDATE: "dashboard:widget-update",

  // Chat events
  CHAT_MESSAGE: "chat:message",
  CHAT_TYPING: "chat:typing",

  // System events
  SYSTEM_NOTIFICATION: "system:notification",
  SYSTEM_ALERT: "system:alert",
  SYSTEM_STATUS: "system:status",

  // Batch processing events
  BATCH_PROGRESS: "batch:progress",
  BATCH_COMPLETE: "batch:complete",
  BATCH_ERROR: "batch:error",

  // Functions catalog events
  CATALOG_UPDATE: "catalog:update",
  CATALOG_RELOAD: "catalog:reload",
} as const;

export type WSEvent = (typeof WS_EVENTS)[keyof typeof WS_EVENTS];

export default websocketService;
