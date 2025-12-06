# Innovation Router

**Version:** 0.2.0  
**Last Updated:** December 2025

## Overview

The Innovation Router provides a comprehensive idea management system for tracking and developing innovative concepts within the ERP system. It enables teams to capture, prioritize, and progress ideas through various development phases, from initial parking to completion.

## Features

- **Idea Lifecycle Management**: Track ideas through 6 distinct phases
- **Priority Management**: Prioritize ideas by importance
- **Assignment System**: Assign ideas to team members
- **Tag-Based Organization**: Categorize with flexible tags
- **Attachment Support**: Link documents and files to ideas
- **Task Integration**: Connect ideas to related tasks
- **Phase History**: Track all phase transitions
- **Effort Estimation**: Estimate and track actual effort
- **Milestone Tracking**: Associate ideas with project milestones
- **Search & Filtering**: Find ideas by phase, priority, author, or content

## Data Model

### Idea Interface

```typescript
interface Idea {
  id: string;                    // UUID
  title: string;                 // Idea title
  description: string;           // Detailed description
  phase: IdeaPhase;             // Current phase
  priority: number;             // Priority (0-100)
  author: string;               // Creator ID
  assignee?: string;            // Assigned team member
  tags: string[];               // Categorization tags
  attachments: string[];        // File URLs/paths
  relatedTasks: string[];       // Related task IDs
  createdAt: string;            // Creation timestamp
  updatedAt: string;            // Last update timestamp
  phaseHistory: PhaseChange[];  // Phase transition log
  milestone?: string;           // Associated milestone
  estimatedEffort?: number;     // Hours (estimated)
  actualEffort?: number;        // Hours (actual)
  dueDate?: string;             // Target completion date
}
```

### Idea Phases

```typescript
type IdeaPhase = 
  | "parked"      // 🅿️ Idea parked for future consideration
  | "analysis"    // 🔍 Under analysis/evaluation
  | "development" // 🛠️ Actively being developed
  | "testing"     // 🧪 In testing phase
  | "completed"   // ✅ Implementation complete
  | "archived";   // 📦 Archived/rejected
```

### Phase Change

```typescript
interface PhaseChange {
  from: IdeaPhase;
  to: IdeaPhase;
  timestamp: string;
  comment?: string;
  changedBy?: string;
}
```

## API Endpoints

### GET `/api/innovation/ideas`

Retrieve ideas with optional filters.

**Query Parameters:**

- `phase` (string): Filter by phase
- `priority` (number): Filter by exact priority
- `author` (string): Filter by author
- `search` (string): Search in title and description
- `limit` (number): Max results (default: 100)
- `offset` (number): Pagination offset (default: 0)
- `sortBy` (string): Sort field (default: "priority")
- `sortOrder` ("asc" | "desc"): Sort direction (default: "desc")

**Response:**

```typescript
{
  success: true;
  data: Idea[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
  }
}
```

**Examples:**

```bash
# Get all parked ideas
GET /api/innovation/ideas?phase=parked

# High priority ideas
GET /api/innovation/ideas?priority=90&sortBy=priority&sortOrder=desc

# Search for "automation"
GET /api/innovation/ideas?search=automation

# Ideas by specific author
GET /api/innovation/ideas?author=user123
```

### GET `/api/innovation/ideas/:id`

Get a specific idea by ID.

**Response:**

```typescript
{
  success: true;
  data: Idea
}
```

### POST `/api/innovation/ideas`

Create a new idea (parks an idea for future development).

**Request Body:**

```typescript
{
  title: string;                 // Required
  description: string;           // Required
  author: string;                // Required
  priority?: number;             // Default: 0
  phase?: IdeaPhase;             // Default: "parked"
  assignee?: string;
  tags?: string[];               // Default: []
  attachments?: string[];        // Default: []
  relatedTasks?: string[];       // Default: []
  milestone?: string;
  estimatedEffort?: number;
  dueDate?: string;
}
```

**Response:**

```typescript
{
  success: true;
  data: {
    id: string;
    ...Idea
  }
}
```

### PUT `/api/innovation/ideas/:id`

Update an existing idea.

**Request Body:** Same as POST (all fields optional)

**Response:**

```typescript
{
  success: true;
  data: Idea
}
```

### PATCH `/api/innovation/ideas/:id/phase`

Move an idea to a different phase (records in phase history).

**Request Body:**

```typescript
{
  phase: IdeaPhase;             // Required
  comment?: string;             // Optional transition note
  changedBy?: string;           // Optional user ID
}
```

**Response:**

```typescript
{
  success: true;
  data: Idea;
  phaseChange: PhaseChange;
}
```

### DELETE `/api/innovation/ideas/:id`

Delete an idea permanently.

**Response:**

```typescript
{
  success: true;
  message: "Idea deleted successfully"
}
```

### GET `/api/innovation/ideas/:id/history`

Get the complete phase transition history for an idea.

**Response:**

```typescript
{
  success: true;
  data: PhaseChange[]
}
```

### GET `/api/innovation/stats`

Get innovation statistics and metrics.

**Response:**

```typescript
{
  success: true;
  data: {
    totalIdeas: number;
    byPhase: {
      [phase: string]: number;
    };
    avgCompletionTime: number;    // days
    topContributors: {
      author: string;
      count: number;
    }[];
  }
}
```

## Database Schema

### ideas Table

```sql
CREATE TABLE ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  phase TEXT DEFAULT 'parked',
  priority INTEGER DEFAULT 0,
  author TEXT,
  assignee TEXT,
  tags_json TEXT DEFAULT '[]',
  attachments_json TEXT DEFAULT '[]',
  related_tasks_json TEXT DEFAULT '[]',
  phase_history_json TEXT DEFAULT '[]',
  milestone TEXT,
  estimated_effort INTEGER,
  actual_effort INTEGER,
  due_date TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- Indexes for performance
CREATE INDEX idx_ideas_phase ON ideas(phase);
CREATE INDEX idx_ideas_priority ON ideas(priority);
CREATE INDEX idx_ideas_author ON ideas(author);
```

## Workflow

### Typical Idea Lifecycle

1. **Park** (`parked`): New idea captured
2. **Analyze** (`analysis`): Evaluate feasibility and impact
3. **Develop** (`development`): Implementation in progress
4. **Test** (`testing`): Quality assurance and validation
5. **Complete** (`completed`): Ready for production
6. **Archive** (`archived`): Rejected or superseded

### Phase Transitions

Track all transitions with:
- Timestamp
- User who made the change
- Optional comment/reason

### Priority Guidelines

- **90-100**: Critical/urgent
- **70-89**: High priority
- **40-69**: Medium priority
- **10-39**: Low priority
- **0-9**: Backlog

## Usage Examples

### Park a New Idea

```bash
curl -X POST http://localhost:3000/api/innovation/ideas \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Automated Invoice Processing",
    "description": "Use AI to automatically extract data from invoice images",
    "author": "john.doe@company.com",
    "priority": 75,
    "tags": ["ai", "automation", "finance"],
    "estimatedEffort": 40
  }'
```

### Move Idea to Development

```bash
curl -X PATCH http://localhost:3000/api/innovation/ideas/idea-uuid/phase \
  -H "Content-Type: application/json" \
  -d '{
    "phase": "development",
    "comment": "Approved for Q1 2026 sprint",
    "changedBy": "manager@company.com"
  }'
```

### Get High Priority Ideas

```bash
curl "http://localhost:3000/api/innovation/ideas?\
phase=parked&\
sortBy=priority&\
sortOrder=desc&\
limit=10"
```

### Update Effort Tracking

```bash
curl -X PUT http://localhost:3000/api/innovation/ideas/idea-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "actualEffort": 35,
    "phase": "completed"
  }'
```

### Search for Ideas

```bash
curl "http://localhost:3000/api/innovation/ideas?search=automation"
```

## Best Practices

### Idea Capture

- **Be Descriptive**: Provide clear title and detailed description
- **Set Priority**: Help with prioritization decisions
- **Add Context**: Use tags and related tasks for discoverability
- **Estimate Early**: Rough effort estimates help with planning

### Phase Management

- **Regular Reviews**: Periodic triage of parked ideas
- **Clear Criteria**: Define what qualifies for each phase
- **Document Transitions**: Use comments when changing phases
- **Track Metrics**: Monitor time in each phase

### Collaboration

- **Assign Ownership**: Clear responsibility for ideas
- **Link Resources**: Attach relevant documents and files
- **Connect Tasks**: Link to implementation tasks
- **Update Status**: Keep idea status current

### Archiving

Archive ideas when:
- No longer relevant
- Superseded by another solution
- Not feasible with current resources
- Rejected after analysis

## Integration Points

### Task Management

Link ideas to:
- Implementation tasks
- Research tasks
- Testing tasks

### Project Milestones

Associate ideas with:
- Sprint goals
- Release targets
- Strategic initiatives

### Document Management

Attach:
- Design documents
- Feasibility studies
- Mockups and prototypes
- Business cases

## Error Handling

Common errors:
- `400`: Invalid phase transition or missing required fields
- `404`: Idea not found
- `500`: Database error

All errors follow the standard error response format:

```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    timestamp: string;
    path: string;
  }
}
```

## Logging

Uses `console.error` for database errors. Should be migrated to structured logging (Pino) as per CODE_QUALITY_IMPROVEMENTS.md.

## Dependencies

- **express**: Web framework
- **dbService**: Database abstraction layer

## Related Documentation

- [DATABASE_OPTIMIZATION.md](../../../../docs/DATABASE_OPTIMIZATION.md) - Query optimization
- [API_DOCUMENTATION.md](../../../../docs/api/API_DOCUMENTATION.md) - Complete API reference

## Future Enhancements

- [ ] Input validation with Zod schemas
- [ ] Standardized error handling (APIError classes)
- [ ] Structured logging with Pino
- [ ] Voting/rating system for ideas
- [ ] Comment threads on ideas
- [ ] Email notifications for phase changes
- [ ] Idea templates for common types
- [ ] Analytics dashboard
- [ ] Export ideas to CSV/PDF
- [ ] Integration with project management tools

## Maintainer

Thomas Heisig

**Last Review:** December 2025
