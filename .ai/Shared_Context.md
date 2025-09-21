Proje: YBIS — Chat Orchestrator + Universal Tools + Template Workflows + Notes
Vizyon: "Hayatını profesyonelce yönet" — her şeyin girişi Chat (TR/EN).

MVP Hedefleri (3 hafta)
- Mobile RN: Chat (markdown bubbles), Dashboard (3 kart), Notes (bottom tab)
- Backend (Vercel Functions): /api/{chat, gmail, calendar, tasks, ocr, analyze, calculate, generate, transform}
- Workflow Templates: LLM doldur → kullanıcı onayı → local simulate trigger
- OAuth (Google): Gmail/Calendar/Tasks
- Telemetry + Hata taksonomisi + Idempotency

Yakın Yol Haritası (çekirdeğe kanca atılmış)
- Live Conversation (real-time voice, turn-taking): /api/rt/session (placeholder)
- Cell Phone Call (PSTN/SIP entegrasyon): /api/voice/call (placeholder)
- Yeni entegrasyonlar: Slack/Notion/Drive (provider/adapter olarak eklenebilir)

Standartlar
- API envelope: Ok<T>={ok:true,meta{requestId,elapsedMs},data}; Err={ok:false,meta,error{code,message,hint?}}
- Zod ile input/output doğrulama; ISO tarih; TZ=Europe/Istanbul
- Rate limit & retry/backoff (429, 5xx); Idempotency-Key (create_* eylemleri)
- Provider/Adapter deseni; ToolRegistry tek yetki kaynağı
- Notes: Markdown render & offline-first (AsyncStorage cache, Postgres kalıcı)
