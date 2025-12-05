// SPDX-License-Identifier: MIT
// apps/backend/src/services/websocketService.ts

/**
 * WebSocket Service
 * 
 * Provides real-time bidirectional communication between server and clients
 * using Socket.IO for features like:
 * - Dashboard live updates
 * - Chat message notifications
 * - System status updates
 * - Batch processing progress
 */

import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { log } from '../routes/ai/utils/logger.js';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRoles?: string[];
}

interface ConnectionInfo {
  socketId: string;
  userId?: string;
  connectedAt: number;
  rooms: string[];
}

class WebSocketService {
  private io: Server | null = null;
  private connections = new Map<string, ConnectionInfo>();

  /**
   * Initialize WebSocket server with HTTP server
   */
  initialize(httpServer: HttpServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      // Connection options
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    log('info', '🔌 WebSocket server initialized');
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
        if (typeof authHeader === 'string' && authHeader.startsWith('Bearer ')) {
          token = authHeader.substring(7);
        }
      }

      if (!token) {
        // Allow anonymous connections but with limited access
        log('debug', 'Anonymous WebSocket connection', { socketId: socket.id });
        return next();
      }

      try {
        // Verify JWT token
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
        const decoded = jwt.verify(token, jwtSecret) as any;
        
        socket.userId = decoded.id || decoded.userId;
        socket.userRoles = decoded.roles || [];

        log('debug', 'Authenticated WebSocket connection', {
          socketId: socket.id,
          userId: socket.userId,
        });

        next();
      } catch (error) {
        log('warn', 'WebSocket authentication failed', {
          socketId: socket.id,
          error: error instanceof Error ? error.message : String(error),
        });
        next(new Error('Authentication failed'));
      }
    });
  }

  /**
   * Setup event handlers for connections
   */
  private setupEventHandlers(): void {
    if (!this.io) return;

    this.io.on('connection', (socket: AuthenticatedSocket) => {
      const connectionInfo: ConnectionInfo = {
        socketId: socket.id,
        userId: socket.userId,
        connectedAt: Date.now(),
        rooms: [],
      };

      this.connections.set(socket.id, connectionInfo);

      log('info', '✅ Client connected', {
        socketId: socket.id,
        userId: socket.userId,
        totalConnections: this.connections.size,
      });

      // Send welcome message
      socket.emit('welcome', {
        message: 'Connected to ERP SteinmetZ WebSocket',
        socketId: socket.id,
        timestamp: Date.now(),
      });

      // Handle room joining
      socket.on('join-room', (room: string) => {
        socket.join(room);
        connectionInfo.rooms.push(room);
        log('debug', `Client joined room: ${room}`, { socketId: socket.id });
        socket.emit('room-joined', { room });
      });

      // Handle room leaving
      socket.on('leave-room', (room: string) => {
        socket.leave(room);
        connectionInfo.rooms = connectionInfo.rooms.filter(r => r !== room);
        log('debug', `Client left room: ${room}`, { socketId: socket.id });
        socket.emit('room-left', { room });
      });

      // Handle ping for connection testing
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: Date.now() });
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        this.connections.delete(socket.id);
        log('info', '❌ Client disconnected', {
          socketId: socket.id,
          userId: socket.userId,
          reason,
          totalConnections: this.connections.size,
        });
      });

      // Handle errors
      socket.on('error', (error) => {
        log('error', 'WebSocket error', {
          socketId: socket.id,
          error: error.message,
        });
      });
    });
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcast(event: string, data: any): void {
    if (!this.io) {
      log('warn', 'Cannot broadcast: WebSocket not initialized');
      return;
    }

    this.io.emit(event, data);
    log('debug', `Broadcasted event: ${event}`, { recipients: this.connections.size });
  }

  /**
   * Send event to specific room
   */
  toRoom(room: string, event: string, data: any): void {
    if (!this.io) {
      log('warn', 'Cannot send to room: WebSocket not initialized');
      return;
    }

    this.io.to(room).emit(event, data);
    log('debug', `Sent to room ${room}: ${event}`);
  }

  /**
   * Send event to specific user
   */
  toUser(userId: string, event: string, data: any): void {
    if (!this.io) {
      log('warn', 'Cannot send to user: WebSocket not initialized');
      return;
    }

    // Find all sockets for this user
    const userSockets = Array.from(this.connections.values())
      .filter(conn => conn.userId === userId)
      .map(conn => conn.socketId);

    if (userSockets.length === 0) {
      log('debug', `User ${userId} not connected`);
      return;
    }

    userSockets.forEach(socketId => {
      this.io?.to(socketId).emit(event, data);
    });

    log('debug', `Sent to user ${userId}: ${event}`, {
      sockets: userSockets.length,
    });
  }

  /**
   * Get connection statistics
   */
  getStats() {
    const connections = Array.from(this.connections.values());
    const authenticated = connections.filter(c => c.userId).length;
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
      log('info', '🔌 WebSocket server closed');
    }
  }
}

// Global WebSocket service instance
export const websocketService = new WebSocketService();

// Event types for type safety
export const WS_EVENTS = {
  // Dashboard events
  DASHBOARD_UPDATE: 'dashboard:update',
  WIDGET_UPDATE: 'dashboard:widget-update',
  
  // Chat events
  CHAT_MESSAGE: 'chat:message',
  CHAT_TYPING: 'chat:typing',
  
  // System events
  SYSTEM_NOTIFICATION: 'system:notification',
  SYSTEM_ALERT: 'system:alert',
  SYSTEM_STATUS: 'system:status',
  
  // Batch processing events
  BATCH_PROGRESS: 'batch:progress',
  BATCH_COMPLETE: 'batch:complete',
  BATCH_ERROR: 'batch:error',
  
  // Functions catalog events
  CATALOG_UPDATE: 'catalog:update',
  CATALOG_RELOAD: 'catalog:reload',
} as const;

export type WSEvent = typeof WS_EVENTS[keyof typeof WS_EVENTS];

export default websocketService;
