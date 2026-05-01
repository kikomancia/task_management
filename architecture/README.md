# 🏗️ Architecture — SYSTEM DESIGN

## System Overview

```
┌─────────────────┐
│   React App     │ (Frontend)
│  - Kanban UI    │
│  - Drag & Drop  │
└────────┬────────┘
         │ HTTP/REST
         │
┌────────▼────────┐
│  Express API    │ (Backend)
│  - Routes       │
│  - Controllers  │
│  - Middleware   │
└────────┬────────┘
         │ MongoDB Driver
         │
┌────────▼────────┐
│  MongoDB Atlas  │ (Database)
│  - Tasks        │
│  - Collections  │
└─────────────────┘
```

## Data Model

### Task Document
```json
{
  "_id": "ObjectId",
  "title": "string",
  "description": "string",
  "status": "todo | in-progress | done",
  "startDate": "ISO 8601 date or null",
  "endDate": "ISO 8601 date or null",
  "createdAt": "ISO 8601 date",
  "updatedAt": "ISO 8601 date"
}
```

## API Endpoints

### Task Routes
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tasks` | Fetch all tasks |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task (status) |
| DELETE | `/api/tasks/:id` | Delete task |

### Request/Response Examples

**POST /api/tasks** - Create
```json
Request:
{
  "title": "Design homepage",
  "description": "Create mockups for landing page",
  "status": "todo"
}

Response (201):
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Design homepage",
  "description": "Create mockups for landing page",
  "status": "todo",
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-01T10:00:00Z"
}
```

**PUT /api/tasks/:id** - Update Status
```json
Request:
{
  "status": "in-progress"
}

Response (200):
{
  "_id": "507f1f77bcf86cd799439011",
  "title": "Design homepage",
  "description": "Create mockups for landing page",
  "status": "in-progress",
  "createdAt": "2026-05-01T10:00:00Z",
  "updatedAt": "2026-05-01T10:00:30Z"
}
```

## Frontend Component Structure

```
App
├── KanbanBoard
│   ├── Column (To Do)
│   │   ├── TaskCard
│   │   ├── TaskCard
│   ├── Column (In Progress)
│   │   ├── TaskCard
│   ├── Column (Done)
│       ├── TaskCard
├── AddTaskForm
```

## Data Flow

1. **Load Tasks**: App mounts → useEffect → GET /api/tasks → setState
2. **Create Task**: Form submit → POST /api/tasks → setState
3. **Move Task**: Drag drop → PUT /api/tasks/:id → setState
4. **Delete Task**: Delete button → DELETE /api/tasks/:id → setState

## Error Handling

- API errors return appropriate HTTP status codes (400, 404, 500)
- Frontend catches fetch errors and displays user messages
- MongoDB connection failures logged to console
