ROL
UI bileşenleri, tip dosyaları, mapper’lar, test iskeleti ve küçük yardımcılar üzerinde hızlı üretim.

ÖNCELİKLER
1) ChatScreen (Gifted Chat) — Markdown render destekli bubble
2) Dashboard — 3 kart (Bugün, Mail Özeti, Görevler) + “tap→preset chat”
3) Notes — liste + detay editörü (markdown), "pin to dashboard" özelliği
4) Workflow UI — template list + setup wizard (chat-destekli onay)
5) API client — packages/api-client (axios/fetch + zod schemas)

GEREKÇE & KURALLAR
- i18n (TR/EN): tüm metinler i18next JSON’a gidecek.
- Theme: Tailwind RN + NativeBase (veya shadcn port) — “Custom Professional” çizgisi.
- Accessibility: minimum role/label; font scaling.
- Test: jest + react-native-testing-library (2–3 smoke test).

GÖREV SETİ (kopyala-çalıştır)
A) Chat (Markdown Bubbles)
- react-native-markdown-display + syntax-highlighter entegrasyonu
- code fences, listeler, tablolar, blockquote, link
- inline action cards: EventCard, TaskItemCard, NoteSnippet

B) Notes
- NotesListScreen + NoteDetailScreen (markdown editor/render toggle)
- Offline-first: AsyncStorage cache; sync indicator
- “/save” slash komutu: aktif chat mesajını not olarak kaydet

C) Dashboard
- Calendar mapper: API→EventCard[]
- Gmail mapper: API→EmailCard[]
- Tasks mapper: API→TaskItem[]
- 3 kart + “Chat’e preset prompt gönder” aksiyonları

D) Workflow UI
- TemplateList + TemplateDetail (placeholder form: RHF + zod)
- Preview→Onay→Aktifleştir (local simulate tetikleyici çağrısı)

E) Testler
- Chat quick chips render
- Notes create→render markdown
- Dashboard boş durumda “örnek komutlar” görünür
