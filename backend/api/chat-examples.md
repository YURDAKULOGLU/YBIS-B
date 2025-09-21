# Chat Orchestrator API Examples

## Endpoint
`POST /api/chat`

## Authentication
User ID required in request body. In production, extract from JWT token.

## Examples

### 1. Simple Message (General QA)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Merhaba, nasılsın?",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "abc123",
    "elapsedMs": 45
  },
  "data": {
    "response": "Bu konuda size nasıl yardımcı olabilirim? Lütfen daha spesifik bir talep belirtin.",
    "intent": "general_qa",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Email Summary Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Gmail özetimi al",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "def456",
    "elapsedMs": 120
  },
  "data": {
    "response": "📧 Gmail özetiniz hazırlandı.",
    "intent": "email_summary",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Create Event (Requires Confirmation)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Yarın saat 14:00 için toplantı planla",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "ghi789",
    "elapsedMs": 80
  },
  "data": {
    "response": "Aşağıdaki işlemleri yapmak istiyorum:\n\n• Takvim etkinliği oluştur\n\nOnaylıyor musunuz? (Evet/Hayır)",
    "intent": "create_event",
    "planId": "plan_xyz123",
    "requiresConfirmation": true,
    "executionPlan": {
      "steps": [
        {
          "stepId": "step_001",
          "tool": "calendar",
          "action": "create",
          "description": "Takvim etkinliği oluştur",
          "requiresConfirmation": true
        }
      ],
      "estimatedDuration": 2
    },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 4. Confirm Plan Execution

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Evet, onayla",
    "userId": "user123",
    "planId": "plan_xyz123",
    "confirmExecution": true
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "jkl012",
    "elapsedMs": 150
  },
  "data": {
    "response": "📅 Etkinlik başarıyla oluşturuldu.",
    "intent": "create_event",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Reject Plan Execution

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hayır, iptal et",
    "userId": "user123",
    "planId": "plan_xyz123",
    "confirmExecution": false
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "mno345",
    "elapsedMs": 25
  },
  "data": {
    "response": "Tamam, işlemi iptal ettim. Başka nasıl yardımcı olabilirim?",
    "intent": "create_event",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 6. Create Note (Immediate Execution)

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Bu toplantı notlarını kaydet: Proje timeline tartışıldı",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "pqr678",
    "elapsedMs": 95
  },
  "data": {
    "response": "📝 Notunuz kaydedildi.",
    "intent": "create_note",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 7. Calculate Expression

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "25 * 4 + 15 hesapla",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "stu901",
    "elapsedMs": 60
  },
  "data": {
    "response": "🧮 Hesaplama sonucu hazır.",
    "intent": "calculate",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 8. Clarification Needed

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Görev oluştur",
    "userId": "user123"
  }'
```

**Response:**
```json
{
  "ok": true,
  "meta": {
    "requestId": "vwx234",
    "elapsedMs": 70
  },
  "data": {
    "response": "İşleminizi tamamlamak için ek bilgiye ihtiyacım var:",
    "intent": "create_task",
    "clarificationNeeded": true,
    "clarificationQuestion": "I need more information to execute tasks.create. Required fields: title, priority. Please provide the missing information.",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### 9. Error - Invalid Request

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": ""
  }'
```

**Response:**
```json
{
  "ok": false,
  "meta": {
    "requestId": "yz012",
    "elapsedMs": 15
  },
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request format",
    "hint": "Check the required fields: message, userId"
  }
}
```

### 10. Health Check

```bash
curl -X GET http://localhost:3000/api/chat/health
```

**Response:**
```json
{
  "ok": true,
  "service": "chat-orchestrator",
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Request Schema

```typescript
{
  message: string (required, min 1 char),
  userId: string (required, min 1 char),
  context?: {
    preferences?: Record<string, any>,
    recentItems?: any[]
  },
  planId?: string,              // For plan continuation
  confirmExecution?: boolean    // For plan confirmation
}
```

## Response Types

### Success Response
```typescript
{
  ok: true,
  meta: {
    requestId: string,
    elapsedMs: number
  },
  data: {
    response: string,
    intent: string,
    planId?: string,
    requiresConfirmation?: boolean,
    executionPlan?: {
      steps: Array<{
        stepId: string,
        tool: string,
        action: string,
        description: string,
        requiresConfirmation: boolean
      }>,
      estimatedDuration: number
    },
    clarificationNeeded?: boolean,
    clarificationQuestion?: string,
    timestamp: string
  }
}
```

### Error Response
```typescript
{
  ok: false,
  meta: {
    requestId: string,
    elapsedMs: number
  },
  error: {
    code: string,
    message: string,
    hint?: string
  }
}
```

## Error Codes

- `VALIDATION_ERROR` - Invalid request format
- `PLAN_NOT_FOUND` - Plan ID not found or expired
- `INTERNAL_ERROR` - Server error

## Flow Examples

### Simple Flow (No Confirmation)
1. User sends message
2. System detects intent
3. System generates plan
4. System executes immediately (safe operations)
5. System returns summary

### Confirmation Flow
1. User sends message
2. System detects intent requiring confirmation
3. System returns plan with `requiresConfirmation: true`
4. User confirms with `confirmExecution: true`
5. System executes plan
6. System returns summary

### Clarification Flow
1. User sends message
2. System detects missing parameters
3. System returns `clarificationNeeded: true`
4. User provides additional information
5. System continues processing