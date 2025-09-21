# YBIS Current Architecture Documentation

**Date:** 2025-09-20
**Version:** Current State Analysis
**Status:** Comprehensive

---

## 📋 **Table of Contents**
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture Patterns](#architecture-patterns)
4. [Monorepo Structure](#monorepo-structure)
5. [Backend Architecture](#backend-architecture)
6. [Mobile App Architecture](#mobile-app-architecture)
7. [Shared Packages](#shared-packages)
8. [API Design](#api-design)
9. [Data Flow](#data-flow)
10. [Current Features](#current-features)
11. [Infrastructure](#infrastructure)
12. [Development Workflow](#development-workflow)

---

## 🏗️ **Project Overview**

### Project Name
**YBIS** - Your Business Intelligence System

### Architecture Type
**Modular Monolith + MCP (Model Context Protocol)**

### Core Purpose
Business intelligence and productivity platform with AI-powered chat, Google Workspace integration, and cross-platform availability.

---

## 🔧 **Technology Stack**

### **Backend**
- **Runtime:** Node.js 20.11.0+ / Vercel Edge Runtime
- **Framework:** Hono (Fast HTTP framework)
- **Language:** TypeScript 5.9.2
- **Validation:** Zod v4 (enhanced validation)
- **Database:** PostgreSQL (with Drizzle ORM references)
- **Cache/Session:** Redis (Upstash)
- **Authentication:** Google OAuth2 + JWT
- **Deployment:** Vercel Serverless

### **Mobile**
- **Framework:** React Native 0.81.4
- **Language:** TypeScript 5.9.2
- **Navigation:** React Navigation 7.x (Stack + Tabs)
- **State Management:** Zustand 5.0.8
- **Forms:** React Hook Form 7.62.0 + Zod resolvers
- **HTTP Client:** Axios 1.12.2
- **UI Library:** Custom components + React Native Vector Icons

### **Shared**
- **Monorepo:** NX 21.5.2 + npm workspaces
- **Package Manager:** npm 10.2.4 (Volta managed)
- **Bundler:** Metro (React Native), TypeScript compilation
- **Testing:** Jest 29.7.0
- **Linting:** ESLint 9.35.0 + Prettier 3.6.2

---

## 🏛️ **Architecture Patterns**

### **1. Modular Monolith**
```
YBIS Monorepo
├── apps/           # Applications
├── packages/       # Shared libraries
├── backend/        # API backend
└── specs/          # Feature specifications
```

### **2. Clean Architecture Layers**
- **Domain Layer:** `@ybis/core` (types, schemas, business logic)
- **Application Layer:** `@ybis/workflows` (use cases)
- **Infrastructure Layer:** `backend/` (APIs, database, external services)
- **Presentation Layer:** `apps/mobile` (UI components, screens)

### **3. API-First Design**
- RESTful APIs with typed contracts
- Request/Response envelope pattern
- Comprehensive error handling
- Rate limiting and idempotency

---

## 📁 **Monorepo Structure**

```
C:\Projeler\YBIS_2\
├── apps/
│   └── mobile/                 # React Native app
│       ├── src/
│       │   ├── components/     # Reusable UI components
│       │   ├── screens/        # Screen components
│       │   ├── stores/         # Zustand stores
│       │   ├── providers/      # Context providers
│       │   └── types/          # App-specific types
│       ├── shared/             # Shared mobile code
│       │   ├── api/            # API client mappers
│       │   ├── state/          # State management
│       │   ├── theme/          # Theming system
│       │   ├── ui/             # UI components
│       │   └── i18n/           # Internationalization
│       ├── android/            # Android platform code
│       ├── ios/                # iOS platform code
│       └── package.json
│
├── packages/
│   ├── core/                   # Core types and schemas
│   │   ├── src/
│   │   │   ├── types/          # Business domain types
│   │   │   ├── schemas/        # Zod validation schemas
│   │   │   ├── utils/          # Utility functions
│   │   │   └── constants/      # Constants
│   │   └── package.json
│   │
│   ├── api-client/             # API client library
│   │   ├── src/
│   │   │   ├── client.ts       # Base HTTP client
│   │   │   ├── types.ts        # API types
│   │   │   └── endpoints/      # Endpoint definitions
│   │   │       ├── chat.ts
│   │   │       ├── calendar.ts
│   │   │       ├── tasks.ts
│   │   │       ├── gmail.ts
│   │   │       └── notes.ts
│   │   └── package.json
│   │
│   ├── ui/                     # Shared UI components
│   │   └── package.json
│   │
│   └── workflows/              # Business workflows
│       └── package.json
│
├── backend/                    # Hono API backend
│   ├── api/                    # API route handlers
│   │   ├── chat.ts             # AI chat endpoints
│   │   ├── calendar.ts         # Google Calendar integration
│   │   ├── tasks.ts            # Task management (partially implemented)
│   │   ├── gmail.ts            # Gmail integration
│   │   ├── notes.ts            # Notes management
│   │   ├── analyze.ts          # Text analysis
│   │   ├── generate.ts         # Content generation
│   │   ├── transform.ts        # Text transformation
│   │   ├── calculate.ts        # Mathematical calculations
│   │   ├── ocr.ts              # OCR processing
│   │   ├── voice.ts            # Voice processing
│   │   └── rt.ts               # Real-time features
│   │
│   ├── src/shared/             # Shared backend code
│   │   ├── auth/               # Authentication
│   │   │   └── google.ts       # Google OAuth implementation
│   │   ├── middleware/         # HTTP middleware
│   │   ├── utils/              # Utilities
│   │   │   ├── rateLimit.ts    # Rate limiting
│   │   │   └── idempotency.ts  # Idempotency checks
│   │   ├── tools/              # Tool schemas and registry
│   │   │   ├── schemas.ts      # Zod v4 schemas
│   │   │   ├── types.ts        # Tool types
│   │   │   └── registry.ts     # Tool registry
│   │   ├── planner/            # Execution planning
│   │   └── errors/             # Error handling
│   │
│   └── package.json
│
├── specs/                      # Feature specifications
│   └── 002-google-workspace-integration/
│       └── spec.md
│
├── scripts/                    # Build and utility scripts
├── .specify/                   # Specify framework
├── docs/                       # Documentation
└── package.json               # Root configuration
```

---

## 🔧 **Backend Architecture**

### **Core Technologies**
- **Hono Framework:** Fast HTTP middleware with edge runtime support
- **Vercel Deployment:** Serverless functions with automatic scaling
- **Redis Session Store:** Upstash Redis for token storage and caching

### **API Structure**
```typescript
// Standardized API envelope
interface ApiResponse<T> {
  ok: boolean;
  meta: {
    requestId: string;
    elapsedMs: number;
  };
  data?: T;
  error?: {
    code: string;
    message: string;
    hint?: string;
  };
}
```

### **Authentication System**
- **Google OAuth2:** Full implementation with refresh tokens
- **Token Storage:** Encrypted refresh tokens in Redis
- **Scopes:** Gmail, Calendar, Tasks, User info
- **Security:** HMAC encryption, token rotation

### **Current API Endpoints**

#### **Google Integration**
- **Calendar API:** `/api/calendar/{list,create,update,delete}`
- **Gmail API:** `/api/gmail/{list,send,search}`
- **Tasks API:** `/api/tasks/{list,create,update,delete}` *(partially implemented)*

#### **Core Features**
- **Chat API:** `/api/chat` - AI conversation handling
- **Notes API:** `/api/notes/{create,list,search,update,delete}`
- **Analysis API:** `/api/analyze` - Text analysis and insights
- **Generation API:** `/api/generate` - Content generation
- **Transform API:** `/api/transform` - Text transformation
- **Calculate API:** `/api/calculate` - Mathematical operations
- **OCR API:** `/api/ocr` - Image text extraction
- **Voice API:** `/api/voice` - Voice processing

### **Key Backend Features**
- ✅ Rate limiting per user/endpoint
- ✅ Idempotency keys for state-changing operations
- ✅ Comprehensive error handling
- ✅ Request/response logging
- ✅ Google API integration with token refresh
- ✅ Zod v4 validation with enhanced schemas

---

## 📱 **Mobile App Architecture**

### **Navigation Structure**
```typescript
// Main app navigation
RootNavigator (Stack)
├── MainTabs (Bottom Tabs)
│   ├── Dashboard      # Home screen with metrics
│   ├── Chat          # AI chat interface
│   └── Notes         # Notes management
└── NoteDetail        # Individual note screen
```

### **State Management**
- **Zustand Stores:**
  - `chatStore.ts` - Chat messages and AI interaction
  - `notesStore.ts` - Notes CRUD operations
  - `authStore.ts` - Authentication state
  - `tasksStore.ts` - Task management

### **Current Mobile Features**
- ✅ **Dashboard:** Metrics overview, quick actions
- ✅ **AI Chat:** Message bubbles, composer, chat history
- ✅ **Notes:** List, create, view, edit notes
- ✅ **Theme System:** Dark theme with custom design tokens
- ✅ **Form Toolkit:** React Hook Form + Zod integration
- ✅ **State Management:** Zustand stores with persistence

### **Missing Mobile Features**
- ❌ Google OAuth flow
- ❌ Calendar view/management
- ❌ Tasks view/management
- ❌ Real-time sync with Google services
- ❌ Settings/preferences screen

---

## 📦 **Shared Packages**

### **@ybis/core**
- **Purpose:** Core business types and validation schemas
- **Exports:** Types, Zod schemas, utilities, constants
- **Key Features:** Zod v4 enhanced validation, strict mode, datetime validation

### **@ybis/api-client**
- **Purpose:** Typed HTTP client for backend APIs
- **Structure:** Base client + endpoint-specific classes
- **Features:** Request/response typing, error handling, axios-based

### **@ybis/ui**
- **Purpose:** Shared UI components
- **Status:** Minimal implementation

### **@ybis/workflows**
- **Purpose:** Business workflow definitions
- **Status:** Placeholder

---

## 🔄 **API Design**

### **Request/Response Pattern**
All APIs follow a consistent envelope pattern:

```typescript
// Success Response
{
  ok: true,
  meta: { requestId: "req_123", elapsedMs: 45 },
  data: { /* actual response data */ }
}

// Error Response
{
  ok: false,
  meta: { requestId: "req_123", elapsedMs: 12 },
  error: {
    code: "VALIDATION_ERROR",
    message: "Invalid request format",
    hint: "Check required fields"
  }
}
```

### **Authentication**
- **Header:** `Authorization: Bearer <access_token>`
- **Automatic Refresh:** Backend handles token refresh transparently
- **Error Handling:** 401 responses trigger re-authentication

### **Rate Limiting**
- **Implementation:** Redis-based with sliding window
- **Limits:** Per-user, per-endpoint buckets
- **Headers:** `X-RateLimit-*` headers in responses

---

## 📊 **Data Flow**

### **Google Integration Flow**
1. **OAuth:** User authorizes via Google OAuth2
2. **Token Storage:** Refresh token encrypted and stored in Redis
3. **API Calls:** Backend refreshes access tokens automatically
4. **Sync:** Data fetched from Google APIs and returned to client

### **Chat Flow**
1. **User Input:** Message sent from mobile app
2. **Processing:** Backend processes with AI/tools
3. **Response:** Structured response with cards/actions
4. **UI Update:** Mobile app renders response with appropriate UI

### **Data Persistence**
- **Backend:** PostgreSQL for application data
- **Mobile:** AsyncStorage for local state
- **Cache:** Redis for sessions and temporary data

---

## ✅ **Current Features**

### **Implemented & Working**
- ✅ Google OAuth2 authentication system
- ✅ Google Calendar full CRUD operations
- ✅ Gmail reading and sending
- ✅ AI chat with structured responses
- ✅ Notes management (create, read, update, delete)
- ✅ Mobile app with navigation
- ✅ Rate limiting and security
- ✅ Type-safe API client
- ✅ Comprehensive error handling

### **Partially Implemented**
- 🔄 Google Tasks API (backend exists, uses mock data)
- 🔄 Mobile UI for Google services (missing screens)
- 🔄 Real-time synchronization

### **Missing/TODO**
- ❌ Database schema and migrations
- ❌ Google Tasks real implementation
- ❌ Mobile OAuth flow
- ❌ Bidirectional sync logic
- ❌ Conflict resolution
- ❌ Push notifications
- ❌ Offline support

---

## 🏗️ **Infrastructure**

### **Deployment**
- **Backend:** Vercel serverless functions
- **Mobile:** React Native builds (Android/iOS)
- **Database:** PostgreSQL (connection details not visible)
- **Cache:** Upstash Redis cloud

### **Environment Variables**
```bash
# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Database
DATABASE_URL=
REDIS_URL=

# Security
TOKEN_ENCRYPTION_KEY=
```

### **Build Process**
- **Backend:** TypeScript compilation to dist/
- **Mobile:** React Native bundling with Metro
- **Packages:** Parallel TypeScript builds with watch mode

---

## 🔄 **Development Workflow**

### **Scripts**
```bash
# Development
npm run dev                    # Start all services
npm run dev:backend           # Backend only
npm run dev:mobile            # Mobile only
npm run dev:packages          # Packages in watch mode

# Building
npm run build                 # Build everything
npm run build:packages        # Build shared packages
npm run build:backend         # Build backend
npm run build:mobile          # Build mobile app

# Quality
npm run lint                  # Lint all workspaces
npm run test                  # Run all tests
npm run type-check            # TypeScript validation
```

### **Package Dependencies**
```mermaid
graph TD
    A[apps/mobile] --> B[@ybis/core]
    A --> C[@ybis/api-client]
    A --> D[@ybis/ui]
    E[backend] --> B
    C --> B
    F[@ybis/workflows] --> B
```

---

## 🎯 **Architecture Strengths**

1. **Type Safety:** End-to-end TypeScript with Zod validation
2. **Modularity:** Clean separation of concerns
3. **Scalability:** Serverless backend, shared packages
4. **Developer Experience:** Hot reload, comprehensive tooling
5. **Security:** OAuth2, encryption, rate limiting
6. **API Design:** Consistent patterns, error handling

## ⚠️ **Technical Debt & Limitations**

1. **Tasks API:** Mock implementation needs Google Tasks integration
2. **Mobile Integration:** Missing Google OAuth and service screens
3. **Sync Logic:** No bidirectional sync or conflict resolution
4. **Database:** Schema and migration system undefined
5. **Testing:** Limited test coverage
6. **Documentation:** API documentation incomplete

---

**Next Steps:** Move to full app blueprint and system overview documentation.