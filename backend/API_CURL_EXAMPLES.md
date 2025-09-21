# API cURL Examples

This document provides cURL examples for all YBIS backend APIs.

## Base URL
```
BASE_URL="http://localhost:3000"
```

## Authentication
All APIs expect a user ID for rate limiting. In production, this would come from JWT tokens.

## Chat API

### Send Message
```bash
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Create a calendar event for tomorrow at 2 PM",
    "userId": "user123",
    "context": {
      "timezone": "America/New_York"
    }
  }'
```

### Confirm Plan
```bash
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_abc123",
    "confirmExecution": true,
    "userId": "user123"
  }'
```

### Reject Plan
```bash
curl -X POST "$BASE_URL/api/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "plan_abc123",
    "confirmExecution": false,
    "userId": "user123"
  }'
```

## Gmail API

### Get Email Summary
```bash
curl -X POST "$BASE_URL/api/gmail/summary" \
  -H "Content-Type: application/json" \
  -d '{
    "maxResults": 10,
    "query": "is:unread"
  }'
```

### List Emails
```bash
curl -X POST "$BASE_URL/api/gmail/list" \
  -H "Content-Type: application/json" \
  -d '{
    "maxResults": 20,
    "query": "from:important@example.com",
    "labelIds": ["INBOX"]
  }'
```

### Send Email (with Idempotency)
```bash
curl -X POST "$BASE_URL/api/gmail/send" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: email_$(uuidgen)" \
  -d '{
    "to": ["recipient@example.com"],
    "subject": "Meeting Follow-up",
    "body": "Thank you for the productive meeting today.",
    "cc": ["manager@example.com"],
    "attachments": []
  }'
```

## Calendar API

### List Calendar Events
```bash
curl -X POST "$BASE_URL/api/calendar/list" \
  -H "Content-Type: application/json" \
  -d '{
    "timeMin": "2024-01-15T00:00:00Z",
    "timeMax": "2024-01-22T23:59:59Z",
    "maxResults": 25,
    "calendarId": "primary"
  }'
```

### Create Calendar Event (with Idempotency)
```bash
curl -X POST "$BASE_URL/api/calendar/create" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: event_$(uuidgen)" \
  -d '{
    "title": "Team Standup",
    "start": "2024-01-16T09:00:00Z",
    "end": "2024-01-16T09:30:00Z",
    "description": "Daily team standup meeting",
    "location": "Conference Room A",
    "attendees": ["team@example.com"],
    "calendarId": "primary"
  }'
```

### Update Calendar Event
```bash
curl -X POST "$BASE_URL/api/calendar/update" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event123",
    "title": "Updated Team Standup",
    "start": "2024-01-16T09:15:00Z",
    "end": "2024-01-16T09:45:00Z",
    "description": "Updated daily team standup meeting",
    "calendarId": "primary"
  }'
```

### Delete Calendar Event
```bash
curl -X POST "$BASE_URL/api/calendar/delete" \
  -H "Content-Type: application/json" \
  -d '{
    "eventId": "event123",
    "calendarId": "primary"
  }'
```

## Tasks API

### List Tasks
```bash
curl -X POST "$BASE_URL/api/tasks/list" \
  -H "Content-Type: application/json" \
  -d '{
    "limit": 20,
    "offset": 0,
    "priority": "high",
    "completed": false
  }'
```

### Create Task (with Idempotency)
```bash
curl -X POST "$BASE_URL/api/tasks/create" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: task_$(uuidgen)" \
  -d '{
    "title": "Review quarterly report",
    "description": "Review and provide feedback on Q4 financial report",
    "priority": "high",
    "dueDate": "2024-01-20T17:00:00Z"
  }'
```

### Update Task
```bash
curl -X POST "$BASE_URL/api/tasks/update" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_abc123",
    "title": "Updated: Review quarterly report",
    "description": "Review and provide detailed feedback on Q4 financial report",
    "priority": "medium",
    "dueDate": "2024-01-22T17:00:00Z"
  }'
```

### Complete/Uncomplete Task
```bash
curl -X POST "$BASE_URL/api/tasks/complete" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_abc123",
    "completed": true
  }'
```

### Delete Task
```bash
curl -X POST "$BASE_URL/api/tasks/delete" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "task_abc123"
  }'
```

## Response Format

All APIs return responses in the following format:

### Success Response
```json
{
  "ok": true,
  "data": {
    // API-specific data
  }
}
```

### Error Response
```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Rate Limiting

APIs implement rate limiting with the following limits:

| API | Endpoint | Limit |
|-----|----------|-------|
| Chat | /chat | 60 requests/10min |
| Gmail | /summary | 100 requests/10min |
| Gmail | /list | 100 requests/10min |
| Gmail | /send | 10 requests/10min |
| Calendar | /list | 100 requests/10min |
| Calendar | /create | 10 requests/10min |
| Calendar | /update | 50 requests/10min |
| Calendar | /delete | 20 requests/10min |
| Tasks | /list | 100 requests/10min |
| Tasks | /create | 10 requests/10min |
| Tasks | /update | 50 requests/10min |
| Tasks | /complete | 100 requests/10min |
| Tasks | /delete | 20 requests/10min |

Rate limit exceeded responses:
```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests"
  }
}
```

## Idempotency

Create operations support idempotency using the `X-Idempotency-Key` header:

```bash
# Generate a unique key (macOS/Linux)
IDEMPOTENCY_KEY="operation_$(uuidgen)"

# Or use a custom key
IDEMPOTENCY_KEY="my_unique_operation_2024_01_15"

curl -X POST "$BASE_URL/api/gmail/send" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: $IDEMPOTENCY_KEY" \
  -d '{ ... }'
```

Idempotent operations that are repeated with the same key will return the same result without side effects.

## Error Codes

Common error codes across all APIs:

- `VALIDATION_ERROR`: Request validation failed
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INVALID_IDEMPOTENCY_KEY`: Malformed idempotency key
- `INTERNAL_ERROR`: Server error
- `NOT_FOUND`: Resource not found (Gmail: `EMAIL_NOT_FOUND`, Calendar: `EVENT_NOT_FOUND`, Tasks: `TASK_NOT_FOUND`)
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `PERMISSION_DENIED`: Insufficient permissions

## Testing Commands

### Test All Endpoints
```bash
# Set base URL
BASE_URL="http://localhost:3000"

# Test Chat
curl -X POST "$BASE_URL/api/chat" -H "Content-Type: application/json" -d '{"message":"Hello","userId":"test"}'

# Test Gmail Summary
curl -X POST "$BASE_URL/api/gmail/summary" -H "Content-Type: application/json" -d '{"maxResults":5}'

# Test Tasks List
curl -X POST "$BASE_URL/api/tasks/list" -H "Content-Type: application/json" -d '{"limit":10}'

# Test Calendar List
curl -X POST "$BASE_URL/api/calendar/list" -H "Content-Type: application/json" -d '{"maxResults":5}'
```

### Create Sample Data
```bash
# Create a task
curl -X POST "$BASE_URL/api/tasks/create" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: sample_task_$(date +%s)" \
  -d '{
    "title": "Sample Task",
    "description": "This is a sample task for testing",
    "priority": "medium"
  }'

# Create a calendar event
curl -X POST "$BASE_URL/api/calendar/create" \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: sample_event_$(date +%s)" \
  -d '{
    "title": "Sample Meeting",
    "start": "2024-01-20T14:00:00Z",
    "end": "2024-01-20T15:00:00Z",
    "description": "Sample meeting for testing"
  }'
```