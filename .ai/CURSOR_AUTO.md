AMAÇ
Monorepoyu ve tekrarlı işleri otomatik kur. Sadece istenen dosyaları oluştur, çalıştırılabilir halde bırak.

YAPILACAKLAR
1) Klasör & bağımlılıklar
- apps/mobile (React Native TS), packages/{core,api-client,ui,workflows}, backend/{api,src}
- Mobile deps: react-navigation, zustand, axios, @react-native-async-storage/async-storage,
  react-native-markdown-display, react-native-syntax-highlighter, react-hook-form, zod,
  tailwind-rn veya nativewind, native-base (veya shadcn port), phosphor-react-native
- Backend deps: zod, hono veya next-api, axios, nanoid, jose, drizzle-orm, postgres, upstash-kv

2) Backend dosya ağacı
backend/
  api/{chat.ts,gmail.ts,calendar.ts,tasks.ts,ocr.ts,analyze.ts,calculate.ts,generate.ts,transform.ts,notes.ts,rt.ts,voice.ts}
  src/modules/{gmail,calendar,tasks,ocr,nlp,analytics,voice}
  src/shared/{tools,planner,context,auth,storage,cache,bus,errors,telemetry,utils,types}

3) Mobile dosya ağacı
apps/mobile/
  app.tsx, screens/{Dashboard.tsx,Chat.tsx,NotesList.tsx,NoteDetail.tsx}
  features/{chat,notes,workflows}
  shared/{ui,api,state,config,utils,theme,i18n}
  shared/api/client.ts (baseURL, 2s timeout, error mapper)
  shared/state/{auth.ts,messages.ts,notes.ts,workflows.ts}
  shared/theme/{tokens.ts,ThemeProvider.tsx}
  shared/i18n/{index.ts, tr.json, en.json}

4) Scriptler
- backend: "dev": "vercel dev", "build", "test"
- mobile: "start","android","ios","lint","test"

5) README’ler
- backend & mobile için çalıştırma adımları + .env.example doldur

KURALLAR
- Boş fonksiyon bırakma; en azından NOT_IMPLEMENTED dönüşü ve zod şeması ekle.
- Public API sözleşmesine uymayan değişiklik yapma.
