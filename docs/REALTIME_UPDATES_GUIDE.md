# Real-Time Updates Guide

This guide explains how to use the WebSocket integration for real-time updates in the ERP SteinmetZ application.

## Overview

The application uses Socket.IO for bidirectional real-time communication between the frontend and backend. This enables features like:

- Live dashboard updates
- Real-time chat messages
- Batch processing progress tracking
- System notifications

## Backend WebSocket Service

### Location

`apps/backend/src/services/websocketService.ts`

### Features

- JWT authentication support
- Room-based messaging
- Connection tracking
- User-specific messaging
- Broadcasting to all clients

### Event Types

```typescript
WS_EVENTS = {
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
};
```

### Backend Usage

#### Broadcast to all clients

```typescript
import { websocketService, WS_EVENTS } from "./services/websocketService";

websocketService.broadcast(WS_EVENTS.SYSTEM_NOTIFICATION, {
  message: "System maintenance scheduled",
  severity: "warning",
});
```

#### Send to specific room

```typescript
websocketService.toRoom("dashboard", WS_EVENTS.DASHBOARD_UPDATE, {
  metrics: { cpu: 45, memory: 67 },
});
```

#### Send to specific user

```typescript
websocketService.toUser(userId, WS_EVENTS.BATCH_COMPLETE, {
  batchId: "batch_123",
  results: { total: 100, successful: 98, failed: 2 },
});
```

## Frontend WebSocket Hooks

### Location

`apps/frontend/src/hooks/useWebSocket.ts`

### Available Hooks

#### 1. `useWebSocket` - General WebSocket Hook

```typescript
import { useWebSocket } from '../hooks/useWebSocket';

function MyComponent() {
  const { socket, isConnected, emit, joinRoom, leaveRoom } = useWebSocket({
    autoConnect: true,
    token: userToken // Optional JWT token
  });

  // Join a room
  useEffect(() => {
    if (isConnected) {
      joinRoom('my-room');
    }
  }, [isConnected]);

  // Emit event
  const sendMessage = () => {
    emit('custom-event', { data: 'hello' });
  };

  return <div>Connected: {isConnected ? 'Yes' : 'No'}</div>;
}
```

#### 2. `useDashboardUpdates` - Dashboard Real-Time Updates

```typescript
import { useDashboardUpdates } from '../hooks/useWebSocket';

function DashboardComponent() {
  const handleUpdate = (data) => {
    console.log('Dashboard update:', data);
    // Update dashboard metrics
  };

  const handleWidgetUpdate = (data) => {
    console.log('Widget update:', data);
    // Update specific widget
  };

  const { isConnected } = useDashboardUpdates(
    handleUpdate,
    handleWidgetUpdate
  );

  return <div>WebSocket: {isConnected ? '🟢' : '🔴'}</div>;
}
```

#### 3. `useChatUpdates` - Chat Real-Time Messages

```typescript
import { useChatUpdates } from '../hooks/useWebSocket';

function ChatComponent() {
  const [messages, setMessages] = useState([]);

  const handleMessage = (data) => {
    setMessages(prev => [...prev, data]);
  };

  const handleTyping = (data) => {
    console.log(`${data.user} is typing...`);
  };

  const { isConnected } = useChatUpdates(handleMessage, handleTyping);

  return (
    <div>
      {messages.map(msg => <div key={msg.id}>{msg.text}</div>)}
    </div>
  );
}
```

#### 4. `useBatchUpdates` - Batch Progress Tracking

```typescript
import { useBatchUpdates } from '../hooks/useWebSocket';

function BatchTracker({ batchId }) {
  const [progress, setProgress] = useState(0);

  const handleProgress = (data) => {
    setProgress(data.progress);
  };

  const handleComplete = (data) => {
    console.log('Batch complete:', data);
  };

  const handleError = (data) => {
    console.error('Batch error:', data);
  };

  const { isConnected } = useBatchUpdates(
    batchId,
    handleProgress,
    handleComplete,
    handleError
  );

  return <div>Progress: {progress}%</div>;
}
```

## Dashboard WebSocket Integration

### Hook: `useDashboardWebSocket`

Location: `apps/frontend/src/components/Dashboard/hooks/useDashboardWebSocket.ts`

```typescript
import { useDashboardWebSocket } from './hooks/useDashboardWebSocket';

function Dashboard() {
  const {
    isConnected,
    lastUpdate,
    updates,
    widgetUpdates,
    clearUpdates
  } = useDashboardWebSocket();

  // Access widget-specific updates
  const widgetData = widgetUpdates['my-widget-id'];

  return (
    <div>
      <div>Status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      <div>Last Update: {lastUpdate?.timestamp}</div>
      <button onClick={clearUpdates}>Clear Updates</button>
    </div>
  );
}
```

## Configuration

### Environment Variables

#### Backend (.env)

```bash
# WebSocket Configuration
FRONTEND_URL=http://localhost:5173

# Session Configuration
SESSION_SECRET=your-secret-key-change-in-production

# Redis Configuration (optional, falls back to in-memory)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
REDIS_ENABLED=true  # Set to enable Redis in development
```

#### Frontend (.env)

```bash
VITE_API_URL=http://localhost:3000
```

## Testing WebSocket Connection

### 1. Check Connection Status

```bash
curl http://localhost:3000/api/ws/stats
```

Response:

```json
{
  "success": true,
  "totalConnections": 2,
  "authenticated": 1,
  "anonymous": 1,
  "rooms": {
    "dashboard": 1,
    "chat": 1
  }
}
```

### 2. Test from Browser Console

```javascript
// Connect to WebSocket
const socket = io("http://localhost:3000", {
  transports: ["websocket", "polling"],
});

// Listen for connection
socket.on("connect", () => {
  console.log("Connected:", socket.id);
});

// Listen for welcome message
socket.on("welcome", (data) => {
  console.log("Welcome:", data);
});

// Join a room
socket.emit("join-room", "dashboard");

// Listen for dashboard updates
socket.on("dashboard:update", (data) => {
  console.log("Dashboard update:", data);
});
```

## Best Practices

### 1. Connection Management

- Use `autoConnect: true` for components that always need WebSocket
- Clean up listeners in `useEffect` return function
- Handle reconnection gracefully

### 2. Authentication

- Pass JWT token to `useWebSocket` for authenticated connections
- Token is sent in auth object and authorization header

### 3. Room Management

- Join specific rooms for targeted updates
- Leave rooms when component unmounts
- Use meaningful room names

### 4. Error Handling

```typescript
const { socket } = useWebSocket();

useEffect(() => {
  if (socket) {
    socket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      // Handle error (show notification, retry, etc.)
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }
}, [socket]);
```

### 5. Performance

- Use `useCallback` for event handlers to prevent unnecessary re-renders
- Limit update frequency on high-frequency events
- Clean up state appropriately

## Troubleshooting

### WebSocket Not Connecting

1. Check backend is running: `curl http://localhost:3000/api/health`
2. Verify CORS configuration in backend
3. Check browser console for connection errors
4. Verify firewall settings

### Messages Not Received

1. Check room membership: `socket.emit('join-room', 'room-name')`
2. Verify event names match between frontend and backend
3. Check connection status: `socket.connected`

### Authentication Issues

1. Verify JWT token is valid
2. Check token is passed to `useWebSocket({ token })`
3. Verify backend JWT_SECRET matches

## Integration Examples

### Complete Dashboard Integration

See: `apps/frontend/src/components/Dashboard/Dashboard.tsx`

### Complete Batch Processing Integration

See: `apps/frontend/src/components/BatchProcessing/BatchProcessingPage.tsx`

### Complete Advanced Filters

See: `apps/frontend/src/components/AdvancedFilters/AdvancedFilters.tsx`

## Additional Resources

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSocket API Documentation](docs/api/API_DOCUMENTATION.md)
- [Backend WebSocket Documentation](docs/WEBSOCKET_REALTIME.md)
