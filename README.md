# YBIS - Your Business Intelligence System

YBIS, kişisel asistan ve iş zekası sistemi olarak tasarlanmış bir monorepo projesidir.

## Proje Yapısı

```
YBIS_2/
├── apps/
│   └── mobile/          # React Native TypeScript Mobile App
├── packages/
│   ├── core/           # Core utilities and types
│   ├── api-client/     # API client library
│   ├── ui/             # Shared UI components
│   └── workflows/      # Workflow engine
└── backend/
    ├── api/            # API endpoints
    └── src/            # Backend source code
```

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya yarn
- React Native CLI
- Android Studio (Android için)
- Xcode (iOS için)

### Backend Kurulumu

```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run dev
```

### Mobile App Kurulumu

```bash
cd apps/mobile
npm install
# Android için
npm run android
# iOS için
npm run ios
```

### Packages Kurulumu

```bash
# Her package için
cd packages/core
npm install
npm run build
```

## API Endpoints

Backend aşağıdaki API endpoint'lerini sağlar:

- `/api/chat` - AI sohbet
- `/api/gmail` - Gmail entegrasyonu
- `/api/calendar` - Takvim yönetimi
- `/api/tasks` - Görev yönetimi
- `/api/ocr` - OCR işleme
- `/api/analyze` - Metin analizi
- `/api/calculate` - Hesaplama
- `/api/generate` - İçerik üretimi
- `/api/transform` - Metin dönüştürme
- `/api/notes` - Not yönetimi
- `/api/rt` - Gerçek zamanlı işleme
- `/api/voice` - Ses işleme

## Geliştirme

### Backend
```bash
cd backend
npm run dev    # Development server
npm run build  # Build
npm test       # Tests
```

### Mobile
```bash
cd apps/mobile
npm start      # Metro bundler
npm run android # Android build
npm run ios    # iOS build
npm run lint   # Linting
npm test       # Tests
```

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.
