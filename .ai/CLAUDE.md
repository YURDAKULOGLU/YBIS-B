# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Root Level (Monorepo)
- `npm run dev` - Start both backend and mobile app in development mode
- `npm run dev:backend` - Start only the backend development server
- `npm run dev:mobile` - Start only the mobile app development server
- `npm run build` - Build all packages, backend, and mobile app
- `npm run test` - Run tests across all workspaces
- `npm run lint` - Run linting across all workspaces
- `npm run clean` - Clean all node_modules and build artifacts

### Backend (`backend/`)
- `npm run dev` - Start development server using Vercel CLI
- `npm run build` - Compile TypeScript to JavaScript
- `npm run test` - Run Jest tests
- `npm run start` - Start production server

### Mobile App (`apps/mobile/`)
- `npm start` - Start React Native Metro bundler with cache reset
- `npm run android` - Build and run Android app
- `npm run ios` - Build and run iOS app
- `npm run lint` - Run ESLint
- `npm run test` - Run Jest tests

### Packages (`packages/*/`)
- `npm run build` - Build TypeScript packages
- `npm run dev` - Watch mode for TypeScript compilation
- `npm run test` - Run package-specific tests

## Architecture Overview

### Monorepo Structure
This is a TypeScript monorepo using npm workspaces with three main components:

1. **Backend** (`backend/`) - Hono-based API server deployed on Vercel
2. **Mobile App** (`apps/mobile/`) - React Native TypeScript application
3. **Shared Packages** (`packages/`) - Reusable utilities and components

### Backend Architecture
- **Framework**: Hono (lightweight web framework)
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Cache**: Redis (Upstash)
- **Authentication**: JWT with Google OAuth
- **Deployment**: Vercel serverless functions

#### Backend Module Structure
- `backend/api/` - API route handlers organized by feature
- `backend/src/modules/` - Business logic modules (analytics, calendar, gmail, nlp, ocr, tasks, voice)
- `backend/src/shared/` - Shared utilities (auth, bus, cache, context, errors, planner, storage, telemetry, tools, types, utils)

#### API Endpoints
The backend provides these main API routes:
- `/api/chat` - AI conversation interface
- `/api/gmail` - Gmail integration
- `/api/calendar` - Calendar management
- `/api/tasks` - Task management
- `/api/ocr` - Optical Character Recognition
- `/api/analyze` - Text analysis
- `/api/calculate` - Mathematical calculations
- `/api/generate` - Content generation
- `/api/transform` - Text transformation
- `/api/notes` - Note management
- `/api/rt` - Real-time processing
- `/api/voice` - Voice processing

### Mobile App Architecture
- **Framework**: React Native 0.72.6 with TypeScript
- **Navigation**: React Navigation v6 (Stack + Bottom Tabs)
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Phosphor React Native

#### Mobile App Structure
- `apps/mobile/screens/` - Screen components (Chat, Dashboard, NoteDetail, NotesList)
- `apps/mobile/shared/api/` - API client and HTTP utilities
- `apps/mobile/shared/state/` - Zustand store modules (auth, messages, notes)
- `apps/mobile/shared/i18n/` - Internationalization

### Shared Packages
- `@ybis/core` - Core utilities and TypeScript types
- `@ybis/api-client` - API client library
- `@ybis/ui` - Shared UI components
- `@ybis/workflows` - Workflow engine

## Environment Setup

### Required Environment Variables
Copy `.env.example` to `.env` in both root and `backend/` directories and configure:

#### Database & Cache
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

#### Authentication
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - Google OAuth credentials

#### AI Services
- `OPENAI_API_KEY` - OpenAI API key
- `ANTHROPIC_API_KEY` - Anthropic API key

#### File Storage
- AWS S3 credentials for file uploads

### Development Setup
1. Install dependencies: `npm install` (installs for all workspaces)
2. Copy and configure environment files
3. Start PostgreSQL and Redis locally
4. For mobile development, ensure React Native CLI and platform tools are installed

## Key Technologies
- **Backend**: Hono, TypeScript, Drizzle ORM, PostgreSQL, Redis, Vercel
- **Mobile**: React Native, TypeScript, Zustand, NativeWind, React Navigation
- **Shared**: Zod for validation, Axios for HTTP, Jest for testing
- **Build Tools**: TypeScript compiler, Metro (React Native), Vercel CLI

## Testing
- Jest is configured for all packages with TypeScript support
- Backend uses `ts-jest` preset
- Mobile app uses `react-native` Jest preset
- Run individual package tests or use root `npm run test` for all

## Deployment
- Backend deploys to Vercel using `vercel dev` for local development
- Mobile app builds standard React Native apps for iOS/Android
- Packages are built as TypeScript libraries consumed by apps

ROLÜN
Senior TypeScript Backend & Orchestrator mühendisi + RN entegrasyon danışmanı.
Hedefin: 
1) /api/chat orchestrator (intent→plan→execute→summarize),
2) Universal tool uçları (/api/gmail|calendar|tasks|ocr|analyze|calculate|generate|transform),
3) Workflow Template çekirdeği (LLM fill + onay + local simulate),
4) Notes API (temel CRUD) ve chat ile entegrasyon.

KURALLAR
- Tüm public API’ler envelope kullanır: Ok<T> / Err.
- Zod ile input/output validate; ISO tarih; TZ Europe/Istanbul.
- Sadece ToolRegistry’de izinli tool/action üret; eksik parametrede "clarify" sorusu üret ve yürütmeyi beklet.
- Idempotency-Key: create_* çağrıları (calendar/tasks/send) için zorunlu.
- Telemetry: intent, steps, latency, tool çağrı sayısı; PII loglama.
- Dosya bazlı minimal diff; public kontratı kırma, sadece genişlet.

BAŞLANGIÇ GÖREVLERİ
A) Orchestrator — /api/chat
- detectIntent(message) → "email_summary"|"create_event"|"create_task"|"create_note"|"general_QA"|...
- enrichContext(userId) → tz, bugün, kullanıcı tercihleri, recent items
- llmPlan(intent, ctx, message) → steps[] (whitelisted tool/actions)
- executeToolStep(userId, step) → ilgili /api/* uçlarına POST
- llmSummarize(intent, ctx, results) → kısa TR yanıt (+ markdown destekli)

B) Tool Providers — /api/*
- gmail: summary|list|read|send (q,max,threadId,draft{to,subject,body})
- calendar: list|create|update|delete (range,event,id)
- tasks: list|create|complete|update (listId,task,id)
- ocr: extract(image)
- analyze: insights(data,query)
- calculate: evaluate(expression)
- generate: document(data,type["report"|"summary"|"document"])
- transform: convert(data,to["csv"|"json"|"markdown"])
Hepsi zod şemalı, Ok/Err ile dönecek, cURL örnekleri eklenecek.

C) Workflow Templates
- shared/flows/templates.ts: Trigger(time|event), Step{tool,action,params}, placeholders
- Örnekler: WeeklyPlanning, InboxSummary, InvoiceIntake
- preview(): onay metni

D) Notes API
- /api/notes: list|create|update|delete; Markdown içerik
- Chat entegrasyonu: "kaydet" komutu create_note intent’ine gider.

E) Roadmap Kancaları (uygulama gerekmez, iskelet koy)
- Voice: /api/rt/session (live conversation placeholder), /api/voice/call (cell phone call placeholder)
- registry.registerProvider("voice", actions:["start","stop","call"]) (şimdilik "not_implemented")

TESLİM KONTROL
- Tüm uçlar için 1 happy + 1 invalid cURL
- .env.example güncel (OAuth, DB, KV)
- Kısa README: çalıştırma adımları
