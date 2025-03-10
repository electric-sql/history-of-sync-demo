# ElectricSQL & Tanstack Optimistic UI Demo - Technical Specification

## Project Overview

This project demonstrates the evolution of data persistence patterns in React applications, focusing on the following progression:

1. Traditional HTML form posts with page refresh
2. API-based writes with manual requerying
3. Tanstack Query for data fetching and mutations
4. Tanstack Query with side effect revalidation
5. ElectricSQL for automatic synchronization
6. Tanstack Optimistic UI for immediate feedback

Each approach will use the same TodoMVC-style application with a side-by-side audit log to demonstrate how changes propagate through the system.

## Core Requirements

### Application Features

- **Todo List**: Classic TodoMVC with add, toggle completion, and delete functionality
- **Audit Log**: Records all todo actions with timestamps and before/after values
- **Side-by-Side Layout**: Shows todos and audit log simultaneously
- **Error Handling**: Rejects todos containing the word "slow" to demonstrate error flows
- **Multi-tab Support**: Changes sync between browser tabs in the ElectricSQL examples

### Technical Stack

- **Frontend**: React with Vite
- **Routing**: Tanstack Router
- **UI Components**: Radix UI with built-in styling primitives
- **Notifications**: Radix UI Toast for error messages
- **API Server**: Hono.js running on Node.js
- **Database**: PostgreSQL
- **ORM**: Drizzle with Drizzle Studio for DB management
- **Containerization**: Docker Compose for backend services
- **Data Libraries**:
  - Tanstack Query
  - ElectricSQL
  - Tanstack Optimistic

## Database Schema

```sql
-- Todo items table
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  is_complete BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Audit log table
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL, -- 'TODO_CREATED', 'TODO_UPDATED', 'TODO_DELETED'
  timestamp TIMESTAMP NOT NULL DEFAULT NOW(),
  old_values JSONB, -- Previous state (null for create)
  new_values JSONB, -- New state (null for delete)
  entity_id UUID, -- Reference to the affected todo
  entity_type TEXT DEFAULT 'todo'
);
```

## API Endpoints

The Hono.js API will provide the following endpoints:

```
GET /api/todos - Get all todos
POST /api/todos - Create a new todo
PUT /api/todos/:id - Update a todo
DELETE /api/todos/:id - Delete a todo
GET /api/audit-logs - Get all audit logs
```

The server will automatically create audit log entries for all todo operations.

## Implementation Approaches

### 01-FormPost

- Traditional HTML form submission for creating todos
- Full page refresh on submit
- Server renders the complete page with the updated todo list and audit log

### 02-APIFetch

- React-based UI that makes fetch calls to the API
- Manual requerying of data after mutations
- No caching or optimistic updates

### 03-TanstackQuery

- Implementation using Tanstack Query
- Automatic requerying after mutations
- Simplified data fetching with caching

### 04-TanstackQueryWithSideEffects

- Similar to the previous approach but demonstrates how to handle backend side effects
- Updates the audit log queries when todos are modified

### 05-ElectricSQL

- Replaces Tanstack Query with ElectricSQL for seamless synchronization
- No explicit data fetching or invalidation required
- Demonstrates real-time sync between multiple tabs

### 06-TanstackOptimistic

- Adds optimistic updates via @tanstack/optimistic
- Shows immediate UI feedback before server confirmation
- Demonstrates rollback on error (e.g., when adding a todo with "slow")

## UI Design

Each example will have the same UI components and layout:

```
+-------------------------------------------+
| App Header / Navigation                   |
+---------------------+---------------------+
| Todo List           | Audit Log           |
| - Input box         | - Event entries     |
| - List of todos     | - Timestamps        |
| - Completion toggle | - Diffs of changes  |
|                     |                     |
|                     |                     |
+---------------------+---------------------+
```

### Todo Item Component

- Checkbox for completion status
- Todo title text
- Created timestamp (subtle)
- Delete button (appears on hover)

### Audit Log Entry Component

- Event type (created, updated, deleted)
- Timestamp
- Before/after diff visualization
- Reference to the affected todo

## Error Handling

- Radix UI Toast component for error notifications
- Any todo containing the word "slow" will be rejected by the server
- Each implementation will handle this error case appropriately:
  - Form Post: Server-side validation with error message
  - API Fetch: Client-side error handling with toast
  - Tanstack Query: Error handling through query hooks
  - ElectricSQL: Conflict resolution and error display
  - Tanstack Optimistic: Rollback of optimistic updates on error

## Development Setup

### Project Structure

```
/
├── src/
│   ├── components/
│   │   ├── TodoList.jsx
│   │   ├── AuditLog.jsx
│   │   ├── Layout.jsx
│   │   ├── ErrorToast.jsx
│   ├── examples/
│   │   ├── 01-FormPost/
│   │   ├── 02-APIFetch/
│   │   ├── 03-TanstackQuery/
│   │   ├── 04-TanstackQueryWithSideEffects/
│   │   ├── 05-ElectricSQL/
│   │   ├── 06-TanstackOptimistic/
│   ├── routes/
│   ├── App.jsx
│   ├── main.jsx
├── server/
│   ├── index.js
│   ├── routes/
│   ├── db/
│   │   ├── schema.js
│   │   ├── migrations/
├── docker-compose.yml
├── package.json
├── vite.config.js
```

### Docker Compose Configuration

```yaml
version: "3.3"
name: "electric_quickstart"
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: electric
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - 54321:5432
    tmpfs:
      - /var/lib/postgresql/data
      - /tmp
    command:
      - -c
      - listen_addresses=*
      - -c
      - wal_level=logical
  electric:
    image: electricsql/electric
    environment:
      DATABASE_URL: postgresql://postgres:password@postgres:5432/electric?sslmode=disable
    ports:
      - "3000:3000"
    depends_on:
      - postgres
```

## Implementation Details

### Common Components

These components will be reused across all examples:

1. `TodoItem.jsx` - Individual todo item display
2. `TodoList.jsx` - Container for todo items
3. `AuditLogEntry.jsx` - Individual audit log entry
4. `AuditLog.jsx` - Container for audit log entries
5. `Layout.jsx` - Side-by-side layout for todos and audit log
6. `ErrorToast.jsx` - Toast notification for errors

### Example-Specific Components

Each example will have its own implementation of:

1. `TodoProvider.jsx` - Data fetching and state management
2. `TodoForm.jsx` - Form for creating new todos
3. `TodoActions.jsx` - Actions for updating and deleting todos

## Routing

Using Tanstack Router to navigate between the different examples:

```jsx
// src/routes/__root.jsx
import { createRootRoute } from '@tanstack/react-router'

export const rootRoute = createRootRoute({
  component: RootComponent,
})

// src/routes/index.jsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomeComponent,
})

// src/routes/01-form-post.jsx
import { createRoute } from '@tanstack/react-router'
import { rootRoute } from './__root'

export const formPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/01-form-post',
  component: FormPostExample,
})

// Similar routes for other examples
```

## Getting Started Guide

Instructions for setting up and running the demo:

1. Clone the repository
2. Install dependencies: `npm install`
3. Start Docker services: `docker-compose up -d`
4. Start the API server: `npm run server`
5. Start the React application: `npm run dev`
6. Navigate to http://localhost:5173

## Future Considerations

- Add pagination for larger todo lists
- Implement filtering and searching
- Add user authentication
- Support offline mode with ElectricSQL
- Enhance visualizations of the synchronization process

## Conclusion

This specification outlines a comprehensive demo application that showcases the evolution of data persistence patterns in React applications. By implementing each approach with the same UI components and functionality, the demo will effectively highlight the advantages of modern libraries like ElectricSQL and Tanstack Optimistic for building responsive and synchronized user interfaces.
