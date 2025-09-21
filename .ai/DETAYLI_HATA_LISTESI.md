# YBIS Projesi - Detaylı Hata Listesi

**Tarih:** 15 Eylül 2025  
**Proje:** YBIS Monorepo  
**Durum:** Kritik Hatalar Tespit Edildi  

## 🚨 KRİTİK HATALAR (Acil Çözüm Gerekli)

### 1. React Native Build Hatası
**Dosya:** `apps/mobile/android/settings.gradle`  
**Hata:**
```
Could not read script 'C:\Projeler\YBIS_2\node_modules\@react-native-community\cli-platform-android\native_modules.gradle' as it does not exist.
```
**Sebep:** Native modules autolinking dosyası bulunamıyor  
**Çözüm:** 
- Native modules autolinking'i devre dışı bırak
- Veya doğru path'i kullan: `../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle`

### 2. Android Gradle Path Sorunları
**Dosya:** `apps/mobile/android/app/build.gradle`  
**Hata:**
```
C:\Projeler\YBIS_2\apps\mobile\android\node_modules\react-native\ReactAndroid\gradle.properties (Sistem belirtilen yolu bulamıyor)
```
**Sebep:** Monorepo yapısında yanlış path'ler  
**Çözüm:**
- React Native path'lerini monorepo root'a yönlendir
- `reactNativeDir = file("../../../node_modules/react-native")`

### 3. Metro Bundler Port Çakışması
**Hata:**
```
info Another process is running on port 8081.
? Use port 8082 instead?
```
**Sebep:** Port 8081'de başka bir süreç çalışıyor  
**Çözüm:**
- `taskkill /f /im node.exe` ile tüm Node süreçlerini kapat
- Veya farklı port kullan

### 4. React Versiyon Çakışması
**Dosya:** `apps/mobile/package.json`  
**Hata:** React 19.1.1 vs React Native 0.80.0 uyumsuzluğu  
**Sebep:** React Native 0.80.0 henüz React 19'u tam desteklemiyor  
**Çözüm:**
- React'i 18.3.1'e düşür
- Veya React Native'i 0.81+ versiyonuna yükselt

## ⚠️ YÜKSEK ÖNCELİKLİ HATALAR

### 5. TypeScript Versiyon Tutarsızlığı
**Dosyalar:** `packages/*/package.json`  
**Hata:** Packages'da TypeScript 5.3.3, Mobile/Backend'de 5.9.2  
**Sebep:** Paketler güncellenmemiş  
**Çözüm:**
```bash
cd packages/core && npm install typescript@5.9.2 --save-dev
cd packages/ui && npm install typescript@5.9.2 --save-dev
cd packages/api-client && npm install typescript@5.9.2 --save-dev
cd packages/workflows && npm install typescript@5.9.2 --save-dev
```

### 6. React Native Versiyon Çakışması
**Dosya:** `packages/ui/package.json`  
**Hata:** UI package'da React Native 0.72.6, Mobile'da 0.80.0  
**Sebep:** UI package güncellenmemiş  
**Çözüm:**
```bash
cd packages/ui && npm install react-native@0.80.0 --save
```

### 7. Eksik Build Scripti
**Dosya:** `apps/mobile/package.json`  
**Hata:** "build" scripti eksik  
**Sebep:** React Native projesi için build scripti tanımlanmamış  
**Çözüm:**
```json
{
  "scripts": {
    "build": "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle"
  }
}
```

### 8. Test Konfigürasyonu Bozuk
**Dosya:** `apps/mobile/jest.config.js`  
**Hata:** jest-native eksik  
**Sebep:** React Native test setup'ı eksik  
**Çözüm:**
```bash
npm install @testing-library/jest-native --save-dev
```

## 🔧 ORTA ÖNCELİKLİ HATALAR

### 9. iOS Konfigürasyonu Eksik
**Dosya:** `apps/mobile/ios/`  
**Hata:** iOS klasörü var ama içerik eksik  
**Sebep:** iOS projesi oluşturulmamış  
**Çözüm:**
- iOS projesini yeniden oluştur
- Xcode workspace'i konfigüre et

### 10. Güvenlik Açıkları
**Komut:** `npm audit`  
**Hata:** 8 güvenlik açığı (3 orta, 5 yüksek)  
**Sebep:** Eski paket versiyonları  
**Çözüm:**
```bash
npm audit fix
npm audit fix --force
```

### 11. Git Repository Eksik
**Hata:** Proje versiyon kontrolünde değil  
**Sebep:** Git repository başlatılmamış  
**Çözüm:**
```bash
git init
git add .gitignore package*.json
git commit -m "Initial commit"
```

### 12. ESLint Konfigürasyonu Eksik
**Dosya:** `apps/mobile/eslint.config.js`  
**Hata:** ESLint kuralları eksik  
**Sebep:** Konfigürasyon dosyası boş  
**Çözüm:**
```javascript
module.exports = {
  extends: ['@react-native'],
  rules: {
    // Custom rules
  }
};
```

## 🔍 DÜŞÜK ÖNCELİKLİ SORUNLAR

### 13. Prettier Konfigürasyonu Eksik
**Dosya:** `.prettierrc`  
**Hata:** Code formatting kuralları yok  
**Çözüm:** Prettier konfigürasyonu ekle

### 14. Dokümantasyon Eksiklikleri
**Dosyalar:** `README.md`, `docs/`  
**Hata:** API dokümantasyonu eksik  
**Çözüm:** Swagger/OpenAPI dokümantasyonu ekle

### 15. Environment Variables Eksik
**Dosya:** `.env.example`  
**Hata:** Environment variables dokümante edilmemiş  
**Çözüm:** .env.example dosyası oluştur

## 📋 HATA ÇÖZÜM ÖNCELİK SIRASI

### 1. Acil (Bugün)
- [ ] React versiyon çakışmasını çöz
- [ ] Metro bundler port sorununu çöz
- [ ] Android Gradle path'lerini düzelt

### 2. Bu Hafta
- [ ] TypeScript versiyonlarını standardize et
- [ ] Build scripti ekle
- [ ] Test konfigürasyonunu düzelt
- [ ] Güvenlik açıklarını kapat

### 3. Gelecek Hafta
- [ ] iOS konfigürasyonunu tamamla
- [ ] Git repository başlat
- [ ] ESLint konfigürasyonunu düzelt
- [ ] Dokümantasyonu tamamla

## 🛠️ HATA ÇÖZÜM KOMUTLARI

### Bağımlılık Çakışmalarını Çöz
```bash
# Tüm Node süreçlerini kapat
taskkill /f /im node.exe

# Cache'leri temizle
npm cache clean --force
rmdir /s /q "%TEMP%\rncli-init-template-*"

# Bağımlılıkları yeniden kur
cd apps/mobile
npm install
```

### React Versiyonunu Düzelt
```bash
cd apps/mobile
npm install react@18.3.1 --save-exact
npm install @types/react@^18.0.0 --save-dev
```

### TypeScript Versiyonlarını Standardize Et
```bash
# Root'ta
npm install typescript@5.9.2 --save-dev

# Packages'da
cd packages/core && npm install typescript@5.9.2 --save-dev
cd packages/ui && npm install typescript@5.9.2 --save-dev
cd packages/api-client && npm install typescript@5.9.2 --save-dev
cd packages/workflows && npm install typescript@5.9.2 --save-dev
```

### Test Konfigürasyonunu Düzelt
```bash
cd apps/mobile
npm install @testing-library/jest-native --save-dev
npm install @testing-library/react-native --save-dev
```

### Güvenlik Açıklarını Kapat
```bash
npm audit fix
npm audit fix --force
```

## 📊 HATA İSTATİSTİKLERİ

- **Toplam Hata:** 15
- **Kritik:** 4
- **Yüksek Öncelik:** 4
- **Orta Öncelik:** 4
- **Düşük Öncelik:** 3

## 🎯 BAŞARI KRİTERLERİ

- [ ] Mobil uygulama başarıyla derleniyor
- [ ] Metro bundler sorunsuz çalışıyor
- [ ] Android build başarılı
- [ ] iOS build başarılı
- [ ] Tüm testler geçiyor
- [ ] Güvenlik açıkları kapatılmış
- [ ] CI/CD pipeline çalışıyor

Bu hata listesi, projedeki tüm sorunları ve çözümlerini detaylı şekilde açıklamaktadır. Öncelik sırasına göre çözüldükten sonra, proje tamamen çalışır durumda olacaktır.

