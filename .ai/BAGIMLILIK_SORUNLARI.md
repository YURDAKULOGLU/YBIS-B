# YBIS Projesi - Bağımlılık Sorunları

**Tarih:** 15 Eylül 2025  
**Proje:** YBIS Monorepo  
**Kategori:** Bağımlılık Yönetimi ve Versiyon Çakışmaları  

## 🚨 KRİTİK BAĞIMLILIK ÇAKIŞMALARI

### 1. React Versiyon Çakışması

#### Sorun: React 19 vs React Native 0.80 Uyumsuzluğu
**Etkilenen Dosyalar:**
- `apps/mobile/package.json`
- `packages/ui/package.json`
- `package.json` (root)

**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react": "19.1.1",
    "react-native": "0.80.0"
  }
}

// packages/ui/package.json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.72.6"
  }
}
```

**Sorun:** React Native 0.80.0 henüz React 19'u tam desteklemiyor.

**Çözüm Seçenekleri:**

**Seçenek 1: React'i 18.3.1'e Düşür (Önerilen)**
```bash
cd apps/mobile
npm install react@18.3.1 --save-exact
npm install @types/react@^18.0.0 --save-dev
```

**Seçenek 2: React Native'i 0.81+ Yükselt**
```bash
cd apps/mobile
npm install react-native@0.81.4 --save
```

### 2. TypeScript Versiyon Tutarsızlığı

#### Sorun: Paketler Arası TypeScript Versiyon Farkları
**Etkilenen Dosyalar:**
- `packages/core/package.json` (TypeScript 5.3.3)
- `packages/ui/package.json` (TypeScript 5.3.3)
- `packages/api-client/package.json` (TypeScript 5.3.3)
- `packages/workflows/package.json` (TypeScript 5.3.3)
- `apps/mobile/package.json` (TypeScript 5.9.2)
- `backend/package.json` (TypeScript 5.9.2)

**Sorun:** Packages'da eski TypeScript versiyonu kullanılıyor.

**Çözüm:**
```bash
# Root'ta TypeScript'i güncelle
npm install typescript@5.9.2 --save-dev

# Packages'da TypeScript'i güncelle
cd packages/core && npm install typescript@5.9.2 --save-dev
cd packages/ui && npm install typescript@5.9.2 --save-dev
cd packages/api-client && npm install typescript@5.9.2 --save-dev
cd packages/workflows && npm install typescript@5.9.2 --save-dev
```

### 3. React Native Versiyon Çakışması

#### Sorun: UI Package vs Mobile App Versiyon Uyumsuzluğu
**Etkilenen Dosyalar:**
- `packages/ui/package.json` (React Native 0.72.6)
- `apps/mobile/package.json` (React Native 0.80.0)

**Sorun:** UI package'da eski React Native versiyonu.

**Çözüm:**
```bash
cd packages/ui
npm install react-native@0.80.0 --save
npm install @types/react-native@^0.80.0 --save-dev
```

## ⚠️ YÜKSEK ÖNCELİKLİ BAĞIMLILIK SORUNLARI

### 4. React Navigation Versiyon Çakışması

#### Sorun: Farklı React Navigation Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "@react-navigation/native": "^7.1.17",
    "@react-navigation/stack": "^7.4.7",
    "@react-navigation/bottom-tabs": "^7.4.7"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "@react-navigation/native": "^6.1.18",
    "@react-navigation/stack": "^6.4.1",
    "@react-navigation/bottom-tabs": "^6.6.1"
  }
}
```

**Çözüm:**
```bash
cd packages/ui
npm install @react-navigation/native@^7.1.17 --save
npm install @react-navigation/stack@^7.4.7 --save
npm install @react-navigation/bottom-tabs@^7.4.7 --save
```

### 5. React Native Screens Versiyon Çakışması

#### Sorun: Farklı React Native Screens Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-screens": "^4.0.0"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-screens": "^3.34.0"
  }
}
```

**Çözüm:**
```bash
cd packages/ui
npm install react-native-screens@^4.0.0 --save
```

### 6. React Native Reanimated Versiyon Çakışması

#### Sorun: Farklı Reanimated Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-reanimated": "3.19.1"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-reanimated": "3.15.5"
  }
}
```

**Çözüm:**
```bash
cd packages/ui
npm install react-native-reanimated@3.19.1 --save
```

## 🔧 ORTA ÖNCELİKLİ BAĞIMLILIK SORUNLARI

### 7. Async Storage Versiyon Çakışması

#### Sorun: Farklı Async Storage Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "2.0.0"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "@react-native-async-storage/async-storage": "1.24.0"
  }
}
```

**Çözüm:**
```bash
cd packages/ui
npm install @react-native-async-storage/async-storage@2.0.0 --save
```

### 8. Gesture Handler Versiyon Çakışması

#### Sorun: Farklı Gesture Handler Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-gesture-handler": "2.18.1"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-gesture-handler": "2.18.1"
  }
}
```

**Durum:** Bu paket zaten uyumlu, sorun yok.

### 9. Safe Area Context Versiyon Çakışması

#### Sorun: Farklı Safe Area Context Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-safe-area-context": "^4.14.1"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-safe-area-context": "4.10.9"
  }
}
```

**Çözüm:**
```bash
cd packages/ui
npm install react-native-safe-area-context@^4.14.1 --save
```

## 🔍 DÜŞÜK ÖNCELİKLİ BAĞIMLILIK SORUNLARI

### 10. Vector Icons Versiyon Tutarlılığı

#### Sorun: Vector Icons Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-vector-icons": "^10.3.0"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-vector-icons": "10.3.0"
  }
}
```

**Durum:** Bu paket zaten uyumlu, sorun yok.

### 11. Markdown Display Versiyon Tutarlılığı

#### Sorun: Markdown Display Versiyonları
**Mevcut Durum:**
```json
// apps/mobile/package.json
{
  "dependencies": {
    "react-native-markdown-display": "^7.0.2"
  }
}

// packages/ui/package.json (varsayılan)
{
  "dependencies": {
    "react-native-markdown-display": "7.0.2"
  }
}
```

**Durum:** Bu paket zaten uyumlu, sorun yok.

## 🛠️ BAĞIMLILIK DÜZELTME KOMUTLARI

### 1. Acil Düzeltmeler (Bugün)
```bash
# React versiyonunu düzelt
cd apps/mobile
npm install react@18.3.1 --save-exact
npm install @types/react@^18.0.0 --save-dev

# TypeScript versiyonlarını standardize et
npm install typescript@5.9.2 --save-dev
cd packages/core && npm install typescript@5.9.2 --save-dev
cd packages/ui && npm install typescript@5.9.2 --save-dev
cd packages/api-client && npm install typescript@5.9.2 --save-dev
cd packages/workflows && npm install typescript@5.9.2 --save-dev
```

### 2. Bu Hafta
```bash
# React Native versiyonlarını hizala
cd packages/ui
npm install react-native@0.80.0 --save
npm install @types/react-native@^0.80.0 --save-dev

# React Navigation versiyonlarını hizala
npm install @react-navigation/native@^7.1.17 --save
npm install @react-navigation/stack@^7.4.7 --save
npm install @react-navigation/bottom-tabs@^7.4.7 --save

# React Native Screens versiyonunu hizala
npm install react-native-screens@^4.0.0 --save

# React Native Reanimated versiyonunu hizala
npm install react-native-reanimated@3.19.1 --save

# Safe Area Context versiyonunu hizala
npm install react-native-safe-area-context@^4.14.1 --save

# Async Storage versiyonunu hizala
npm install @react-native-async-storage/async-storage@2.0.0 --save
```

### 3. Gelecek Hafta
```bash
# Cache'leri temizle
npm cache clean --force

# node_modules'ları temizle
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf apps/mobile/node_modules
rm -rf backend/node_modules

# Bağımlılıkları yeniden kur
npm install
```

## 📊 BAĞIMLILIK İSTATİSTİKLERİ

### Versiyon Çakışmaları:
- **React:** 2 farklı versiyon (18.2.0, 19.1.1)
- **React Native:** 2 farklı versiyon (0.72.6, 0.80.0)
- **TypeScript:** 2 farklı versiyon (5.3.3, 5.9.2)
- **React Navigation:** 2 farklı versiyon (6.x, 7.x)
- **React Native Screens:** 2 farklı versiyon (3.34.0, 4.0.0)
- **React Native Reanimated:** 2 farklı versiyon (3.15.5, 3.19.1)

### Toplam Çakışma:
- **Kritik:** 3
- **Yüksek Öncelik:** 3
- **Orta Öncelik:** 3
- **Düşük Öncelik:** 2

## 🎯 BAŞARI KRİTERLERİ

- [ ] Tüm paketlerde React 18.3.1 kullanılıyor
- [ ] Tüm paketlerde React Native 0.80.0 kullanılıyor
- [ ] Tüm paketlerde TypeScript 5.9.2 kullanılıyor
- [ ] React Navigation versiyonları hizalanmış
- [ ] React Native Screens versiyonları hizalanmış
- [ ] React Native Reanimated versiyonları hizalanmış
- [ ] npm install hatasız çalışıyor
- [ ] Build işlemleri başarılı

## 🔍 BAĞIMLILIK KONTROL KOMUTLARI

### Versiyon Kontrolü:
```bash
# Tüm paketlerde React versiyonunu kontrol et
npm list react --depth=0

# Tüm paketlerde React Native versiyonunu kontrol et
npm list react-native --depth=0

# Tüm paketlerde TypeScript versiyonunu kontrol et
npm list typescript --depth=0

# Çakışan bağımlılıkları kontrol et
npm ls --depth=0
```

### Audit Kontrolü:
```bash
# Güvenlik açıklarını kontrol et
npm audit

# Güvenlik açıklarını düzelt
npm audit fix

# Zorla düzelt
npm audit fix --force
```

Bu bağımlılık sorunları çözüldükten sonra, proje tamamen çalışır durumda olacaktır.

