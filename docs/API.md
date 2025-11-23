# FluxFlow API Documentation

This document describes the APIs for FluxFlow's backend services and ML service.

## ML Service API

Base URL (Development): `http://localhost:8000`
Base URL (Production): `https://your-ml-service.com`

### Endpoints

#### GET /

Get service status.

**Response:**
```json
{
  "status": "online",
  "service": "FluxFlow ML Engine",
  "version": "1.0.0"
}
```

#### GET /health

Health check endpoint for monitoring.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000000",
  "service": "FluxFlow ML Engine"
}
```

#### POST /predict-schedule

Generate an optimized schedule based on tasks and user energy level.

**Request Body:**
```json
{
  "tasks": [
    {
      "id": "string",
      "title": "string",
      "estimated_duration_minutes": 60,
      "priority": 3,
      "deadline": "2024-01-01T12:00:00Z" // optional
    }
  ],
  "user_state": {
    "energy_level": 7,
    "current_time": "2024-01-01T09:00:00Z"
  }
}
```

**Validation Rules:**
- `tasks`: 1-50 items
- `title`: 1-200 characters
- `estimated_duration_minutes`: 1-480 (8 hours max)
- `priority`: 1-5
- `energy_level`: 1-10

**Response:**
```json
[
  {
    "task_id": "string",
    "start_time": "2024-01-01T09:10:00Z",
    "end_time": "2024-01-01T10:10:00Z",
    "confidence_score": 0.85
  }
]
```

**Error Responses:**

422 Validation Error:
```json
{
  "detail": [
    {
      "loc": ["body", "user_state", "energy_level"],
      "msg": "ensure this value is less than or equal to 10",
      "type": "value_error.number.not_le"
    }
  ]
}
```

500 Server Error:
```json
{
  "detail": "Scheduling error: <error message>"
}
```

## Firebase Cloud Functions

### onUserCreated

**Trigger:** Firebase Authentication user creation

**Description:** Automatically creates a user profile document in Firestore when a new user signs up.

**Created Document:**
```
users/{userId}
{
  email: string
  createdAt: timestamp
  updatedAt: timestamp
  settings: {
    theme: "system"
    notificationsEnabled: true
  }
}
```

### onUserDeleted

**Trigger:** Firebase Authentication user deletion

**Description:** Cleans up all user data when an account is deleted.

**Deleted Data:**
- User profile document
- All tasks in `users/{userId}/tasks/`
- All energy logs in `users/{userId}/energy_logs/`

## Firestore Data Model

### Collections

#### users/{userId}

User profile document.

**Fields:**
- `email`: string - User's email address
- `createdAt`: timestamp - Account creation time
- `updatedAt`: timestamp - Last update time
- `settings`: object - User preferences
  - `theme`: string - "light" | "dark" | "system"
  - `notificationsEnabled`: boolean

**Security:**
- Read/Write: Only authenticated user with matching UID

#### users/{userId}/tasks/{taskId}

Task documents for a specific user.

**Fields:**
- `title`: string (1-200 chars) - Task title
- `estimatedDuration`: number (1-480) - Duration in minutes
- `priority`: number (1-5) - Priority level
- `completed`: boolean - Completion status
- `createdAt`: timestamp - Creation time
- `deadline`: timestamp (optional) - Due date

**Security:**
- Read/Write: Only authenticated user with matching UID
- Validation: Field types and ranges enforced

#### users/{userId}/energy_logs/{logId}

Energy level logs for a specific user.

**Fields:**
- `level`: number (1-10) - Energy level
- `timestamp`: timestamp - Log time
- `notes`: string (optional) - Additional notes

**Security:**
- Read: Only authenticated user with matching UID
- Create: Only authenticated user with matching UID
- Update/Delete: Not allowed (immutable logs)

## Frontend Service APIs

### taskService

#### createTask(taskData)

Create a new task.

**Parameters:**
```typescript
{
  title: string
  estimatedDuration: number
  priority: number
  deadline?: Date
}
```

**Returns:** `Promise<string>` - Task ID

**Throws:** Error if user not authenticated

#### updateTask(taskId, updates)

Update an existing task.

**Parameters:**
- `taskId`: string
- `updates`: Partial task object

**Returns:** `Promise<void>`

#### deleteTask(taskId)

Delete a task.

**Parameters:**
- `taskId`: string

**Returns:** `Promise<void>`

#### getTasks(includeCompleted?)

Get all tasks for the current user.

**Parameters:**
- `includeCompleted`: boolean (default: true)

**Returns:** `Promise<Task[]>`

### energyService

#### logEnergy(level, notes?)

Log current energy level.

**Parameters:**
- `level`: number (1-10)
- `notes`: string (optional)

**Returns:** `Promise<string>` - Log ID

**Throws:** Error if level out of range

#### getLatestEnergyLog()

Get the most recent energy log.

**Returns:** `Promise<EnergyLog | null>`

### scheduleService

#### generateSchedule(tasks, currentEnergy, useLocalFallback?)

Generate an optimized schedule.

**Parameters:**
- `tasks`: Task[]
- `currentEnergy`: EnergyLog | null
- `useLocalFallback`: boolean (default: true)

**Returns:** `Promise<ScheduledTask[]>`

**Behavior:**
- Attempts to call ML service
- Falls back to local algorithm if ML service unavailable
- Throws error if fallback disabled and ML service fails

## Rate Limits

Currently no rate limits enforced. Recommended limits for production:

- ML Service: 100 requests/minute per IP
- Firestore: Default Firebase quotas apply
- Cloud Functions: Default Firebase quotas apply

## Authentication

All frontend API calls require Firebase Authentication. The SDK automatically includes the auth token in requests.

**Example:**
```typescript
import { auth } from './firebaseConfig';

// User must be signed in
const user = auth.currentUser;
if (!user) {
  throw new Error('User not authenticated');
}

// SDK handles auth token automatically
await createTask({ title: 'My Task', ... });
```

## Error Handling

All services use centralized error handling via `utils/errorHandler.ts`.

**Error Types:**
- `NETWORK`: Connection issues
- `AUTH`: Authentication failures
- `VALIDATION`: Invalid input
- `NOT_FOUND`: Resource not found
- `PERMISSION`: Access denied
- `SERVER`: Server errors
- `UNKNOWN`: Unexpected errors

**Example:**
```typescript
import { handleError, showError } from './utils/errorHandler';

try {
  await createTask(taskData);
} catch (error) {
  const message = showError(error);
  // Display message to user
}
```
