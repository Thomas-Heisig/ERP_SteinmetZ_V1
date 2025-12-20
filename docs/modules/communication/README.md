# Communication Module

## Overview

The Communication module provides centralized communication management including email, internal messaging, notifications, and communication history tracking.

## Features

- **Email Management**: Send and track emails
- **Internal Messaging**: Team communication
- **Notifications**: System and user notifications
- **Communication History**: Audit trail of all communications
- **Templates**: Email and message templates

## API Endpoints

### Email

#### `GET /api/communication/emails`

List all emails with filtering options.

#### `POST /api/communication/emails/send`

Send an email.

**Request Body:**

```json
{
  "to": ["recipient@example.com"],
  "cc": [],
  "bcc": [],
  "subject": "Email Subject",
  "body": "Email content",
  "html": "<html>...</html>",
  "attachments": []
}
```

#### `GET /api/communication/emails/:id`

Get email details and tracking information.

### Messages

#### `GET /api/communication/messages`

List internal messages.

#### `POST /api/communication/messages`

Send internal message to team members.

#### `GET /api/communication/messages/:id`

Get message details.

#### `PUT /api/communication/messages/:id/read`

Mark message as read.

### Notifications

#### `GET /api/communication/notifications`

Get user notifications.

#### `POST /api/communication/notifications`

Create a notification.

#### `PUT /api/communication/notifications/:id/read`

Mark notification as read.

#### `DELETE /api/communication/notifications/:id`

Delete a notification.

### Templates

#### `GET /api/communication/templates`

List all communication templates.

#### `POST /api/communication/templates`

Create a new template.

#### `GET /api/communication/templates/:id`

Get template details.

#### `PUT /api/communication/templates/:id`

Update template.

### Statistics

#### `GET /api/communication/statistics`

Get communication statistics.

## Integration Points

- **CRM Module**: Customer communication tracking
- **HR Module**: Employee communication
- **Marketing Module**: Campaign email delivery
- **System**: System notifications and alerts

## Version History

- **v0.3.0** (2025-12-19): Initial communication module implementation
