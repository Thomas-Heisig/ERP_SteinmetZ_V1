# Communication Center

Comprehensive communication management system for messages, notifications, templates, and call logging.

## Features

- **Multi-Channel Messaging**: Email, SMS, Fax, Internal Messages
- **Push Notifications**: Real-time user notifications with priorities
- **Message Templates**: Reusable templates with variable substitution
- **Call Logging**: Inbound/Outbound/Missed call tracking
- **Statistics**: Detailed communication analytics

## Database Schema

### Messages Table (`communication_messages`)

```sql
CREATE TABLE communication_messages (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'email' | 'sms' | 'fax' | 'internal'
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  cc TEXT,
  bcc TEXT,
  subject TEXT,
  body TEXT NOT NULL,
  html TEXT,
  priority TEXT DEFAULT 'normal',        -- 'low' | 'normal' | 'high' | 'urgent'
  status TEXT DEFAULT 'draft',           -- 'draft' | 'sent' | 'delivered' | 'read' | 'failed'

  sent_at TEXT,
  delivered_at TEXT,
  read_at TEXT,
  failed_reason TEXT,

  attachments_json TEXT DEFAULT '[]',
  reply_to TEXT,
  in_reply_to TEXT,
  thread_id TEXT,

  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_messages_type` on `type`
- `idx_messages_status` on `status`
- `idx_messages_from` on `from`
- `idx_messages_to` on `to`
- `idx_messages_thread` on `thread_id`

### Notifications Table (`communication_notifications`)

```sql
CREATE TABLE communication_notifications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  type TEXT DEFAULT 'info',              -- 'success' | 'info' | 'warning' | 'error'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  icon TEXT,

  link TEXT,
  action_label TEXT,
  action_url TEXT,

  read INTEGER DEFAULT 0,
  read_at TEXT,
  dismissed INTEGER DEFAULT 0,
  dismissed_at TEXT,

  priority TEXT DEFAULT 'normal',        -- 'low' | 'normal' | 'high' | 'urgent'
  expires_at TEXT,

  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_notifications_user` on `user_id`
- `idx_notifications_read` on `read`

### Templates Table (`communication_templates`)

```sql
CREATE TABLE communication_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,                    -- 'email' | 'sms' | 'fax' | 'internal'
  category TEXT,

  subject TEXT,
  body TEXT NOT NULL,
  html TEXT,

  variables_json TEXT DEFAULT '[]',

  is_active INTEGER DEFAULT 1,
  usage_count INTEGER DEFAULT 0,

  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_templates_type` on `type`

### Calls Table (`communication_calls`)

```sql
CREATE TABLE communication_calls (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,                    -- 'inbound' | 'outbound' | 'missed'
  "from" TEXT NOT NULL,
  "to" TEXT NOT NULL,
  status TEXT DEFAULT 'ringing',         -- 'ringing' | 'answered' | 'ended' | 'missed' | 'failed'

  duration INTEGER,                      -- seconds
  recording TEXT,
  notes TEXT,

  started_at TEXT NOT NULL,
  ended_at TEXT,

  created_by TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);
```

**Indexes:**

- `idx_calls_type` on `type`

## API Endpoints

### Messages

#### `GET /api/communication/messages`

List messages with filtering.

**Query Parameters:**

- `type` (optional): Filter by message type (email, sms, fax, internal)
- `status` (optional): Filter by status (draft, sent, delivered, read, failed)
- `priority` (optional): Filter by priority (low, normal, high, urgent)
- `from` (optional): Filter by sender
- `to` (optional): Filter by recipient
- `search` (optional): Search in subject and body
- `threadId` (optional): Filter by thread
- `startDate` (optional): Filter by created date (ISO 8601)
- `endDate` (optional): Filter by created date (ISO 8601)
- `limit` (default: 50): Results per page
- `offset` (default: 0): Pagination offset

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "email",
      "from": "sender@example.com",
      "to": "recipient@example.com",
      "cc": "cc@example.com",
      "bcc": "bcc@example.com",
      "subject": "Subject",
      "body": "Message body",
      "html": "<html>...</html>",
      "priority": "normal",
      "status": "sent",
      "sentAt": "2025-01-15T10:30:00Z",
      "deliveredAt": "2025-01-15T10:31:00Z",
      "readAt": null,
      "failedReason": null,
      "attachments": "[...]",
      "replyTo": null,
      "inReplyTo": null,
      "threadId": null,
      "createdBy": "user-id",
      "createdAt": "2025-01-15T10:30:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "limit": 50,
    "offset": 0,
    "total": 100
  }
}
```

#### `GET /api/communication/messages/:id`

Get message by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    /* Message object */
  }
}
```

#### `POST /api/communication/messages`

Send a new message.

**Request Body:**

```json
{
  "type": "email",
  "from": "sender@example.com",
  "to": "recipient@example.com",
  "cc": "cc@example.com",
  "bcc": "bcc@example.com",
  "subject": "Subject",
  "body": "Message body",
  "html": "<html>...</html>",
  "priority": "normal",
  "attachments": [],
  "replyTo": "reply@example.com",
  "inReplyTo": "parent-message-id",
  "threadId": "thread-id",
  "createdBy": "user-id"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    /* Message object */
  }
}
```

#### `PUT /api/communication/messages/:id`

Update message status.

**Request Body:**

```json
{
  "status": "read",
  "readAt": "2025-01-15T12:00:00Z",
  "failedReason": "SMTP error"
}
```

#### `DELETE /api/communication/messages/:id`

Delete a message.

### Notifications

#### `GET /api/communication/notifications`

List notifications.

**Query Parameters:**

- `userId` (optional): Filter by user
- `type` (optional): Filter by type (success, info, warning, error)
- `read` (optional): Filter by read status (boolean)
- `dismissed` (optional): Filter by dismissed status (boolean)
- `priority` (optional): Filter by priority
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "userId": "user-id",
      "type": "info",
      "title": "Notification Title",
      "message": "Notification message",
      "icon": "bell",
      "link": "/path/to/resource",
      "actionLabel": "View",
      "actionUrl": "/action",
      "read": false,
      "readAt": null,
      "dismissed": false,
      "dismissedAt": null,
      "priority": "normal",
      "expiresAt": "2025-01-20T00:00:00Z",
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 25 }
}
```

#### `POST /api/communication/notifications`

Create a notification.

**Request Body:**

```json
{
  "userId": "user-id",
  "type": "info",
  "title": "Notification Title",
  "message": "Notification message",
  "icon": "bell",
  "link": "/resource",
  "actionLabel": "View",
  "actionUrl": "/action",
  "priority": "normal",
  "expiresAt": "2025-01-20T00:00:00Z"
}
```

#### `PUT /api/communication/notifications/:id`

Update notification (mark as read/dismissed).

**Request Body:**

```json
{
  "read": true,
  "dismissed": true
}
```

#### `DELETE /api/communication/notifications/:id`

Delete a notification.

### Templates

#### `GET /api/communication/templates`

List templates.

**Query Parameters:**

- `type` (optional): Filter by type
- `category` (optional): Filter by category
- `isActive` (optional): Filter by active status
- `search` (optional): Search in name and body

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Welcome Email",
      "type": "email",
      "category": "onboarding",
      "subject": "Welcome {{userName}}!",
      "body": "Dear {{userName}}, welcome to {{companyName}}...",
      "html": "<html>...</html>",
      "variables": "[{\"name\":\"userName\",\"default\":\"User\"}]",
      "isActive": true,
      "usageCount": 42,
      "createdBy": "user-id",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### `GET /api/communication/templates/:id`

Get template by ID.

#### `POST /api/communication/templates`

Create a template.

**Request Body:**

```json
{
  "name": "Welcome Email",
  "type": "email",
  "category": "onboarding",
  "subject": "Welcome {{userName}}!",
  "body": "Dear {{userName}}...",
  "html": "<html>...</html>",
  "variables": [
    { "name": "userName", "default": "User" },
    { "name": "companyName", "default": "Company" }
  ],
  "isActive": true,
  "createdBy": "user-id"
}
```

#### `PUT /api/communication/templates/:id`

Update a template.

#### `DELETE /api/communication/templates/:id`

Delete a template.

### Calls

#### `GET /api/communication/calls`

List calls.

**Query Parameters:**

- `type` (optional): Filter by type (inbound, outbound, missed)
- `status` (optional): Filter by status
- `from` (optional): Filter by caller
- `to` (optional): Filter by recipient
- `startDate` (optional): Filter by start date
- `endDate` (optional): Filter by start date
- `limit` (default: 50)
- `offset` (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "inbound",
      "from": "+491234567890",
      "to": "+490987654321",
      "status": "ended",
      "duration": 180,
      "recording": "/recordings/call-123.mp3",
      "notes": "Customer inquiry about product",
      "startedAt": "2025-01-15T10:00:00Z",
      "endedAt": "2025-01-15T10:03:00Z",
      "createdBy": "user-id",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ],
  "pagination": { "limit": 50, "offset": 0, "total": 150 }
}
```

#### `POST /api/communication/calls`

Log a call.

**Request Body:**

```json
{
  "type": "outbound",
  "from": "+490987654321",
  "to": "+491234567890",
  "status": "answered",
  "duration": 120,
  "recording": "/recordings/call-456.mp3",
  "notes": "Follow-up call",
  "startedAt": "2025-01-15T14:00:00Z",
  "endedAt": "2025-01-15T14:02:00Z",
  "createdBy": "user-id"
}
```

#### `PUT /api/communication/calls/:id`

Update call (e.g., after call ends).

**Request Body:**

```json
{
  "status": "ended",
  "duration": 300,
  "endedAt": "2025-01-15T14:05:00Z",
  "notes": "Customer requested callback"
}
```

### Statistics

#### `GET /api/communication/stats`

Get communication statistics.

**Response:**

```json
{
  "success": true,
  "data": {
    "messages": {
      "total": 1500,
      "email": 800,
      "sms": 400,
      "fax": 50,
      "internal": 250,
      "sent": 1400,
      "failed": 100
    },
    "notifications": {
      "total": 500,
      "unread": 25
    },
    "calls": {
      "total": 300,
      "inbound": 150,
      "outbound": 120,
      "missed": 30,
      "totalDuration": 54000
    },
    "templates": {
      "total": 25,
      "active": 20
    }
  }
}
```

## Frontend Integration

### TypeScript Types

```typescript
// types/communication.ts
export interface Message {
  id: string;
  type: "email" | "sms" | "fax" | "internal";
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  subject?: string;
  body: string;
  html?: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "draft" | "sent" | "delivered" | "read" | "failed";
  sentAt?: string;
  deliveredAt?: string;
  readAt?: string;
  failedReason?: string;
  attachments?: string;
  replyTo?: string;
  inReplyTo?: string;
  threadId?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: "success" | "info" | "warning" | "error";
  title: string;
  message: string;
  icon?: string;
  link?: string;
  actionLabel?: string;
  actionUrl?: string;
  read: boolean;
  readAt?: string;
  dismissed: boolean;
  dismissedAt?: string;
  priority: "low" | "normal" | "high" | "urgent";
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Template {
  id: string;
  name: string;
  type: "email" | "sms" | "fax" | "internal";
  category?: string;
  subject?: string;
  body: string;
  html?: string;
  variables: string;
  isActive: boolean;
  usageCount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Call {
  id: string;
  type: "inbound" | "outbound" | "missed";
  from: string;
  to: string;
  status: "ringing" | "answered" | "ended" | "missed" | "failed";
  duration?: number;
  recording?: string;
  notes?: string;
  startedAt: string;
  endedAt?: string;
  createdBy: string;
  createdAt: string;
}
```

### API Client

```typescript
// services/communicationApi.ts
import axios from "axios";
import type {
  Message,
  Notification,
  Template,
  Call,
} from "@/types/communication";

const API_BASE = "/api/communication";

export const communicationApi = {
  // Messages
  async getMessages(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Message[] }>(
      `${API_BASE}/messages`,
      { params },
    );
    return data;
  },

  async getMessageById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Message }>(
      `${API_BASE}/messages/${id}`,
    );
    return data;
  },

  async sendMessage(message: Partial<Message>) {
    const { data } = await axios.post<{ success: boolean; data: Message }>(
      `${API_BASE}/messages`,
      message,
    );
    return data;
  },

  async updateMessage(id: string, updates: Partial<Message>) {
    const { data } = await axios.put<{ success: boolean; data: Message }>(
      `${API_BASE}/messages/${id}`,
      updates,
    );
    return data;
  },

  async deleteMessage(id: string) {
    const { data } = await axios.delete(`${API_BASE}/messages/${id}`);
    return data;
  },

  // Notifications
  async getNotifications(params?: Record<string, unknown>) {
    const { data } = await axios.get<{
      success: boolean;
      data: Notification[];
    }>(`${API_BASE}/notifications`, { params });
    return data;
  },

  async createNotification(notification: Partial<Notification>) {
    const { data } = await axios.post<{ success: boolean; data: Notification }>(
      `${API_BASE}/notifications`,
      notification,
    );
    return data;
  },

  async markNotificationAsRead(id: string) {
    const { data } = await axios.put(`${API_BASE}/notifications/${id}`, {
      read: true,
    });
    return data;
  },

  async dismissNotification(id: string) {
    const { data } = await axios.put(`${API_BASE}/notifications/${id}`, {
      dismissed: true,
    });
    return data;
  },

  async deleteNotification(id: string) {
    const { data } = await axios.delete(`${API_BASE}/notifications/${id}`);
    return data;
  },

  // Templates
  async getTemplates(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Template[] }>(
      `${API_BASE}/templates`,
      { params },
    );
    return data;
  },

  async getTemplateById(id: string) {
    const { data } = await axios.get<{ success: boolean; data: Template }>(
      `${API_BASE}/templates/${id}`,
    );
    return data;
  },

  async createTemplate(template: Partial<Template>) {
    const { data } = await axios.post<{ success: boolean; data: Template }>(
      `${API_BASE}/templates`,
      template,
    );
    return data;
  },

  async updateTemplate(id: string, updates: Partial<Template>) {
    const { data } = await axios.put<{ success: boolean; data: Template }>(
      `${API_BASE}/templates/${id}`,
      updates,
    );
    return data;
  },

  async deleteTemplate(id: string) {
    const { data } = await axios.delete(`${API_BASE}/templates/${id}`);
    return data;
  },

  // Calls
  async getCalls(params?: Record<string, unknown>) {
    const { data } = await axios.get<{ success: boolean; data: Call[] }>(
      `${API_BASE}/calls`,
      { params },
    );
    return data;
  },

  async logCall(call: Partial<Call>) {
    const { data } = await axios.post<{ success: boolean; data: Call }>(
      `${API_BASE}/calls`,
      call,
    );
    return data;
  },

  async updateCall(id: string, updates: Partial<Call>) {
    const { data } = await axios.put<{ success: boolean; data: Call }>(
      `${API_BASE}/calls/${id}`,
      updates,
    );
    return data;
  },

  // Statistics
  async getStats() {
    const { data } = await axios.get(`${API_BASE}/stats`);
    return data;
  },
};
```

### React Query Hooks

```typescript
// hooks/useCommunication.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { communicationApi } from "@/services/communicationApi";
import type {
  Message,
  Notification,
  Template,
  Call,
} from "@/types/communication";

// Messages
export function useMessages(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["messages", params],
    queryFn: () => communicationApi.getMessages(params),
  });
}

export function useMessage(id: string) {
  return useQuery({
    queryKey: ["messages", id],
    queryFn: () => communicationApi.getMessageById(id),
    enabled: !!id,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: Partial<Message>) =>
      communicationApi.sendMessage(message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
      queryClient.invalidateQueries({ queryKey: ["communication-stats"] });
    },
  });
}

export function useUpdateMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Message> }) =>
      communicationApi.updateMessage(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["messages", id] });
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.deleteMessage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// Notifications
export function useNotifications(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => communicationApi.getNotifications(params),
    refetchInterval: 30000, // Refetch every 30 seconds
  });
}

export function useCreateNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (notification: Partial<Notification>) =>
      communicationApi.createNotification(notification),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["communication-stats"] });
    },
  });
}

export function useMarkNotificationAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.markNotificationAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useDismissNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => communicationApi.dismissNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

// Templates
export function useTemplates(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["templates", params],
    queryFn: () => communicationApi.getTemplates(params),
  });
}

export function useTemplate(id: string) {
  return useQuery({
    queryKey: ["templates", id],
    queryFn: () => communicationApi.getTemplateById(id),
    enabled: !!id,
  });
}

export function useCreateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (template: Partial<Template>) =>
      communicationApi.createTemplate(template),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

export function useUpdateTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Template> }) =>
      communicationApi.updateTemplate(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["templates", id] });
      queryClient.invalidateQueries({ queryKey: ["templates"] });
    },
  });
}

// Calls
export function useCalls(params?: Record<string, unknown>) {
  return useQuery({
    queryKey: ["calls", params],
    queryFn: () => communicationApi.getCalls(params),
  });
}

export function useLogCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (call: Partial<Call>) => communicationApi.logCall(call),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calls"] });
      queryClient.invalidateQueries({ queryKey: ["communication-stats"] });
    },
  });
}

export function useUpdateCall() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Call> }) =>
      communicationApi.updateCall(id, updates),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["calls", id] });
      queryClient.invalidateQueries({ queryKey: ["calls"] });
    },
  });
}

// Statistics
export function useCommunicationStats() {
  return useQuery({
    queryKey: ["communication-stats"],
    queryFn: () => communicationApi.getStats(),
    staleTime: 60000, // Cache for 1 minute
  });
}
```

### Component Examples

#### Message List

```tsx
// components/MessageList.tsx
import { useMessages, useUpdateMessage } from "@/hooks/useCommunication";

export function MessageList() {
  const { data: messagesData, isLoading } = useMessages({ limit: 50 });
  const updateMessage = useUpdateMessage();

  const handleMarkAsRead = async (id: string) => {
    await updateMessage.mutateAsync({
      id,
      updates: { readAt: new Date().toISOString() },
    });
  };

  if (isLoading) return <div>Loading messages...</div>;

  return (
    <div className="message-list">
      {messagesData?.data.map((message) => (
        <div key={message.id} className="message-item">
          <div className="message-header">
            <span className="message-type">{message.type}</span>
            <span className="message-from">{message.from}</span>
            <span className="message-to">To: {message.to}</span>
          </div>
          <div className="message-subject">{message.subject}</div>
          <div className="message-body">{message.body}</div>
          <div className="message-footer">
            <span className={`status-${message.status}`}>{message.status}</span>
            {!message.readAt && (
              <button onClick={() => handleMarkAsRead(message.id)}>
                Mark as Read
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

#### Notification Bell

```tsx
// components/NotificationBell.tsx
import { useState } from "react";
import {
  useNotifications,
  useMarkNotificationAsRead,
  useDismissNotification,
} from "@/hooks/useCommunication";

export function NotificationBell() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: notificationsData } = useNotifications({ read: false });
  const markAsRead = useMarkNotificationAsRead();
  const dismissNotification = useDismissNotification();

  const unreadCount =
    notificationsData?.data.filter((n) => !n.read).length || 0;

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead.mutateAsync(notification.id);
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await dismissNotification.mutateAsync(id);
  };

  return (
    <div className="notification-bell">
      <button onClick={() => setShowDropdown(!showDropdown)}>
        <BellIcon />
        {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>

      {showDropdown && (
        <div className="notifications-dropdown">
          {notificationsData?.data.length === 0 ? (
            <div className="no-notifications">No new notifications</div>
          ) : (
            notificationsData?.data.map((notification) => (
              <div
                key={notification.id}
                className={`notification-item ${notification.type}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">{notification.icon}</div>
                <div className="notification-content">
                  <div className="notification-title">{notification.title}</div>
                  <div className="notification-message">
                    {notification.message}
                  </div>
                </div>
                <button
                  className="dismiss-btn"
                  onClick={(e) => handleDismiss(e, notification.id)}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
```

#### Template Selector

```tsx
// components/TemplateSelector.tsx
import { useState } from "react";
import { useTemplates } from "@/hooks/useCommunication";

interface TemplateSelectorProps {
  type: "email" | "sms" | "fax" | "internal";
  onSelect: (template: Template) => void;
}

export function TemplateSelector({ type, onSelect }: TemplateSelectorProps) {
  const [search, setSearch] = useState("");
  const { data: templatesData } = useTemplates({
    type,
    isActive: true,
    search,
  });

  return (
    <div className="template-selector">
      <input
        type="text"
        placeholder="Search templates..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="templates-list">
        {templatesData?.data.map((template) => (
          <div
            key={template.id}
            className="template-item"
            onClick={() => onSelect(template)}
          >
            <div className="template-name">{template.name}</div>
            <div className="template-category">{template.category}</div>
            <div className="template-usage">
              Used {template.usageCount} times
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### Communication Stats Widget

```tsx
// components/CommunicationStats.tsx
import { useCommunicationStats } from "@/hooks/useCommunication";

export function CommunicationStats() {
  const { data: stats, isLoading } = useCommunicationStats();

  if (isLoading) return <div>Loading stats...</div>;

  return (
    <div className="communication-stats">
      <div className="stat-card">
        <h3>Messages</h3>
        <div className="stat-value">{stats?.data.messages.total}</div>
        <div className="stat-breakdown">
          <div>Email: {stats?.data.messages.email}</div>
          <div>SMS: {stats?.data.messages.sms}</div>
          <div>Fax: {stats?.data.messages.fax}</div>
          <div>Internal: {stats?.data.messages.internal}</div>
        </div>
        <div className="stat-status">
          <span className="success">Sent: {stats?.data.messages.sent}</span>
          <span className="error">Failed: {stats?.data.messages.failed}</span>
        </div>
      </div>

      <div className="stat-card">
        <h3>Notifications</h3>
        <div className="stat-value">{stats?.data.notifications.total}</div>
        <div className="stat-detail">
          Unread: {stats?.data.notifications.unread}
        </div>
      </div>

      <div className="stat-card">
        <h3>Calls</h3>
        <div className="stat-value">{stats?.data.calls.total}</div>
        <div className="stat-breakdown">
          <div>Inbound: {stats?.data.calls.inbound}</div>
          <div>Outbound: {stats?.data.calls.outbound}</div>
          <div>Missed: {stats?.data.calls.missed}</div>
        </div>
        <div className="stat-detail">
          Total Duration: {Math.floor(stats?.data.calls.totalDuration / 60)} min
        </div>
      </div>

      <div className="stat-card">
        <h3>Templates</h3>
        <div className="stat-value">{stats?.data.templates.total}</div>
        <div className="stat-detail">
          Active: {stats?.data.templates.active}
        </div>
      </div>
    </div>
  );
}
```

## Best Practices

### Message Management

1. **Thread Management**: Always set `threadId` for related messages to enable conversation tracking
2. **Attachments**: Store attachments as JSON array of file paths/URLs
3. **HTML Content**: Sanitize HTML content before sending to prevent XSS attacks
4. **Priority Handling**: Use priority levels to ensure critical messages are processed first

### Notifications-

1. **Expiration**: Set `expiresAt` for time-sensitive notifications
2. **Polling**: Use React Query's `refetchInterval` for real-time updates
3. **Action Links**: Always provide actionable links for better UX
4. **Type Consistency**: Use appropriate notification types (success, info, warning, error)

### Templates-

1. **Variable Naming**: Use clear, consistent variable names (e.g., `{{userName}}`, `{{orderNumber}}`)
2. **Default Values**: Always provide default values for variables
3. **Testing**: Preview templates with sample data before activation
4. **Versioning**: Track template versions for audit purposes

### Call Logging

1. **Duration Tracking**: Calculate duration in seconds for consistency
2. **Recording Storage**: Store recordings in secure, accessible location
3. **Privacy**: Ensure compliance with call recording regulations
4. **Notes**: Add detailed notes for call context and follow-up actions

### Performance

1. **Pagination**: Always use pagination for large datasets
2. **Caching**: Leverage React Query caching for frequently accessed data
3. **Filtering**: Filter on the backend to reduce data transfer
4. **Indexing**: Utilize database indexes for faster queries

### Security

1. **Input Validation**: All inputs are validated with Zod schemas
2. **SQL Injection**: Use parameterized queries (SqlValue types)
3. **XSS Prevention**: Sanitize HTML content
4. **Access Control**: Implement user-based access controls for messages/notifications

---

**Last Updated:** 2025-01-15  
**Version:** 2.0  
**Database:** SQLite  
**Documentation:** Complete with frontend integration guide
