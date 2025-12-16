# Innovation Board - Backend API Spezifikation

## Übersicht

Das Innovation Board verwaltet Ideen in verschiedenen Phasen (Backlog, Geparkt, Analyse, Entwicklung, Testing, Abgeschlossen, Archiviert).

## Benötigte API-Endpunkte

### 1. Ideen abrufen

```http
GET /api/innovation/ideas
```

**Query Parameters:**

- `boardId` (string): Board-ID
- `search` (string, optional): Suchbegriff für Titel/Beschreibung
- `priority` (string, optional): Komma-getrennte Prioritäten (critical, high, medium, low)
- `tags` (string, optional): Komma-getrennte Tags
- `phase` (string, optional): Spezifische Phase filtern

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Idee Titel",
      "description": "Kurzbeschreibung",
      "detailedDescription": "Lange Beschreibung (optional)",
      "phase": "backlog" | "parked" | "analysis" | "development" | "testing" | "completed" | "archived",
      "priority": "critical" | "high" | "medium" | "low",
      "author": {
        "id": "user-uuid",
        "name": "Max Mustermann",
        "avatar": "url (optional)",
        "department": "IT (optional)"
      },
      "tags": ["automation", "efficiency"],
      "createdAt": "2025-12-15T10:00:00Z",
      "updatedAt": "2025-12-15T12:00:00Z",
      "estimatedValue": 50000,
      "estimatedEffort": 8,
      "complexity": "low" | "medium" | "high",
      "metrics": {
        "votes": 15,
        "comments": 3,
        "followers": 5,
        "views": 42
      },
      "aiInsights": {
        "potentialImpact": 85,
        "feasibility": 70,
        "similarIdeas": ["idea-id-1", "idea-id-2"],
        "suggestedTags": ["automation", "ai"]
      }
    }
  ]
}
```

### 2. Neue Idee erstellen

```http
POST /api/innovation/ideas
```

**Request Body:**

```json
{
  "title": "Neue Idee",
  "description": "Beschreibung",
  "detailedDescription": "Optionale Details",
  "priority": "medium",
  "tags": ["tag1", "tag2"],
  "estimatedValue": 10000,
  "estimatedEffort": 5,
  "complexity": "medium"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "new-uuid",
    "phase": "parked",
    "createdAt": "2025-12-15T14:00:00Z",
    ...
  }
}
```

### 3. Phase ändern (Drag & Drop)

```http
PATCH /api/innovation/ideas/:id/phase
```

**Request Body:**

```json
{
  "phase": "development"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "idea-uuid",
    "phase": "development",
    "updatedAt": "2025-12-15T14:05:00Z"
  }
}
```

### 4. Idee löschen

```http
DELETE /api/innovation/ideas/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Idee erfolgreich gelöscht"
}
```

### 5. Board-Metriken abrufen

```http
GET /api/innovation/metrics
```

**Query Parameters:**

- `boardId` (string): Board-ID

**Response:**

```json
{
  "success": true,
  "data": {
    "totalIdeas": 127,
    "completedThisMonth": 8,
    "inDevelopment": 12,
    "avgTimeToComplete": 18.5,
    "topContributors": [
      { "name": "Anna Schmidt", "count": 23 },
      { "name": "Max Mustermann", "count": 18 }
    ]
  }
}
```

### 6. KI-Empfehlungen abrufen

```http
GET /api/innovation/ai/suggestions
```

**Query Parameters:**

- `boardId` (string): Board-ID

**Response:**

```json
{
  "success": true,
  "data": {
    "nextPriorities": [
      { "id": "idea-uuid", "title": "High Impact Idea", "score": 92 }
    ],
    "potentialBlockers": [
      { "id": "idea-uuid", "title": "Complex Feature", "risk": 85 }
    ],
    "quickWins": [
      { "id": "idea-uuid", "title": "Simple Fix", "effort": 2 }
    ]
  }
}
```

### 7. KI-Beschreibung generieren

```http
POST /api/innovation/ai/generate-description
```

**Request Body:**

```json
{
  "title": "Idee Titel",
  "context": "Zusätzlicher Kontext (optional)"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "description": "KI-generierte Beschreibung",
    "detailedDescription": "Ausführliche Details",
    "suggestedTags": ["tag1", "tag2"],
    "estimatedComplexity": "medium",
    "potentialImpact": 75
  }
}
```

### 8. Für Idee abstimmen

```http
POST /api/innovation/ideas/:id/vote
```

**Request Body:**

```json
{
  "vote": "up" | "down"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "idea-uuid",
    "metrics": {
      "votes": 16
    }
  }
}
```

### 9. Idee folgen

```http
POST /api/innovation/ideas/:id/follow
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "idea-uuid",
    "following": true,
    "metrics": {
      "followers": 6
    }
  }
}
```

## WebSocket Events (Optional)

Für Echtzeit-Updates:

```javascript
// Client subscribes to: "innovation"

// Events:
{
  "type": "innovation:idea-created",
  "idea": { /* Idee-Objekt */ }
}

{
  "type": "innovation:idea-updated",
  "idea": { /* Idee-Objekt */ }
}

{
  "type": "innovation:idea-deleted",
  "ideaId": "uuid"
}

{
  "type": "innovation:phase-changed",
  "ideaId": "uuid",
  "oldPhase": "backlog",
  "newPhase": "development"
}
```

## Datenmodell (Empfehlung)

### Idea Table

```sql
CREATE TABLE ideas (
  id UUID PRIMARY KEY,
  board_id UUID NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  detailed_description TEXT,
  phase VARCHAR(20) NOT NULL,
  priority VARCHAR(10) NOT NULL,
  author_id UUID NOT NULL,
  estimated_value DECIMAL(10,2),
  estimated_effort INTEGER,
  complexity VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (board_id) REFERENCES boards(id),
  FOREIGN KEY (author_id) REFERENCES users(id)
);

CREATE TABLE idea_tags (
  idea_id UUID,
  tag VARCHAR(50),
  PRIMARY KEY (idea_id, tag),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

CREATE TABLE idea_votes (
  id UUID PRIMARY KEY,
  idea_id UUID NOT NULL,
  user_id UUID NOT NULL,
  vote_type VARCHAR(10) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE(idea_id, user_id)
);

CREATE TABLE idea_followers (
  idea_id UUID,
  user_id UUID,
  created_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (idea_id, user_id),
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE idea_metrics (
  idea_id UUID PRIMARY KEY,
  votes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  followers_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);
```

## Fehlerbehandlung

Alle Endpunkte sollten bei Fehlern folgendes Format zurückgeben:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Titel ist erforderlich",
    "details": {}
  }
}
```

## Authentifizierung

Alle Endpunkte erfordern Authentifizierung via JWT Token im Authorization Header:

```http
Authorization: Bearer <token>
```

## Status Codes

- `200 OK`: Erfolgreiche Anfrage
- `201 Created`: Ressource erfolgreich erstellt
- `400 Bad Request`: Validierungsfehler
- `401 Unauthorized`: Nicht authentifiziert
- `403 Forbidden`: Keine Berechtigung
- `404 Not Found`: Ressource nicht gefunden
- `500 Internal Server Error`: Serverfehler
