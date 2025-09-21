Monorepo
apps/
  mobile/        # iOS/Android (RN)
  desktop/       # Tauri (PC), ilerleyen aşama
  web/           # opsiyonel admin/docs
packages/
  core/          # domain types, errors, telemetry, utils
  api-client/    # fetch/axios wrapper + zod schemas
  ui/            # design system (Tailwind RN/NativeBase/ShadCN port), icons
  workflows/     # template tanımları (TS/JSON)
backend/
  api/           # Vercel Functions
  src/
    modules/     # gmail, calendar, tasks, ocr, nlp, analytics, voice (placeholder)
    shared/      # tools, planner, context, auth, storage, cache, bus, errors, telemetry

Replaceable Katmanlar
- Tool Providers: gmail|calendar|tasks|ocr|analyze|generate|transform (+slack|notion|drive)
- LLM Providers: anthropic|openai|local
- Queue/Cron Providers: none|qstash|trigger
- Voice Providers (roadmap): none|twilio|vonage|webRTC

Çalışma İlkeleri
- Tek giriş: POST /api/chat → planner (intent→steps) → executor (tool çağrıları)
- Workflow: Trigger(time|event) + Steps[{tool,action,params}] + preview + onay + simulate
- Notes: chat’ten “kaydet” ile not oluşturma, Notes tab’ında düzenleme
