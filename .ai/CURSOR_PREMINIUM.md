ROL
Refactor, minimal diff, public kontrata sadakat. Her görev sonunda yalnız değişen dosyaları üret.

GÖREVLER
1) shared/tools/registry.ts & types.ts — ToolProvider arayüzü + register/get
2) Tüm tools için zod şemaları (gmail, calendar, tasks, ocr, analyze, calculate, generate, transform)
3) api/chat.ts — detectIntent + llmPlan + executeToolStep + llmSummarize
4) api/notes.ts — list/create/update/delete (markdown content)
5) shared/errors.ts — error taxonomy + error→userMessage mapper
6) shared/telemetry.ts — withTimer(fn) + event(name, payload)
7) api/rt.ts & api/voice.ts — NOT_IMPLEMENTED (roadmap kancaları)

TESLİM
- Patch (diff) + kısa not
- Değişiklikler public kontratı bozmaz
