# YBIS Projesi - Konfigürasyon Sorunları

**Tarih:** 15 Eylül 2025  
**Proje:** YBIS Monorepo  
**Kategori:** Konfigürasyon ve Setup Sorunları  

## 🚨 KRİTİK KONFİGÜRASYON SORUNLARI

### 1. Android Gradle Konfigürasyonu

#### Sorun: Monorepo Path Çakışmaları
**Dosya:** `apps/mobile/android/app/build.gradle`

**Mevcut (Hatalı) Konfigürasyon:**
```gradle
react {
    root = file("../")
    reactNativeDir = file("../node_modules/react-native")
    codegenDir = file("../node_modules/@react-native/codegen")
    cliFile = file("../node_modules/react-native/cli.js")
}
```

**Sorun:** Monorepo yapısında path'ler yanlış. React Native paketleri root'ta.

**Düzeltilmiş Konfigürasyon:**
```gradle
react {
    root = file("../")
    reactNativeDir = file("../../../node_modules/react-native")
    codegenDir = file("../../../node_modules/@react-native/codegen")
    cliFile = file("../../../node_modules/react-native/cli.js")
}
```

#### Sorun: Native Modules Autolinking
**Dosya:** `apps/mobile/android/settings.gradle`

**Mevcut (Hatalı) Konfigürasyon:**
```gradle
apply from: file("../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle")
applyNativeModulesSettingsGradle(settings)
```

**Sorun:** Dosya bulunamıyor çünkü paket yapısı değişmiş.

**Düzeltilmiş Konfigürasyon:**
```gradle
// Native modules autolinking - Modern approach (commented out for now)
// apply from: file("../../../node_modules/@react-native-community/cli-platform-android/native_modules.gradle")
// applyNativeModulesSettingsGradle(settings)
```

### 2. Metro Bundler Konfigürasyonu

#### Sorun: Monorepo Watch Folders
**Dosya:** `apps/mobile/metro.config.js`

**Mevcut Konfigürasyon:**
```javascript
watchFolders: [
    path.resolve(__dirname, '../..'),
    ...packages.map(p => path.resolve(__dirname, `../../packages/${p}`)),
],
```

**Sorun:** Packages klasöründe eksik paketler var.

**Düzeltilmiş Konfigürasyon:**
```javascript
watchFolders: [
    path.resolve(__dirname, '../..'),
    path.resolve(__dirname, '../../packages/core'),
    path.resolve(__dirname, '../../packages/ui'),
    path.resolve(__dirname, '../../packages/api-client'),
    path.resolve(__dirname, '../../packages/workflows'),
],
```

### 3. Package.json Konfigürasyonu

#### Sorun: Eksik Build Scripti
**Dosya:** `apps/mobile/package.json`

**Mevcut Scripts:**
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "build:android": "cd android && gradlew.bat assembleRelease",
    "build:ios": "cd ios && xcodebuild -workspace YBISMobile.xcworkspace -scheme YBISMobile -configuration Release"
  }
}
```

**Sorun:** Ana "build" scripti eksik.

**Düzeltilmiş Scripts:**
```json
{
  "scripts": {
    "start": "react-native start",
    "android": "react-native run-android",
    "ios": "react-native run-ios",
    "build": "npx react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle",
    "build:android": "cd android && gradlew.bat assembleRelease",
    "build:ios": "cd ios && xcodebuild -workspace YBISMobile.xcworkspace -scheme YBISMobile -configuration Release"
  }
}
```

## ⚠️ YÜKSEK ÖNCELİKLİ KONFİGÜRASYON SORUNLARI

### 4. TypeScript Konfigürasyonu

#### Sorun: Versiyon Tutarsızlığı
**Dosyalar:** `packages/*/tsconfig.json`

**Mevcut Konfigürasyon:**
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  }
}
```

**Sorun:** TypeScript versiyonu 5.3.3 (eski).

**Düzeltilmiş Konfigürasyon:**
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020"],
    "module": "CommonJS",
    "moduleResolution": "node",
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### 5. Jest Konfigürasyonu

#### Sorun: React Native Test Setup Eksik
**Dosya:** `apps/mobile/jest.config.js`

**Mevcut Konfigürasyon:**
```javascript
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
```

**Sorun:** jest-native setup eksik.

**Düzeltilmiş Konfigürasyon:**
```javascript
module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|@react-native-async-storage|@react-native-community|react-native-vector-icons|react-native-reanimated|react-native-gesture-handler|react-native-screens|react-native-safe-area-context)/)',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/android/', '<rootDir>/ios/'],
};
```

### 6. ESLint Konfigürasyonu

#### Sorun: Konfigürasyon Dosyası Boş
**Dosya:** `apps/mobile/eslint.config.js`

**Mevcut Konfigürasyon:**
```javascript
// Boş dosya
```

**Düzeltilmiş Konfigürasyon:**
```javascript
module.exports = {
  root: true,
  extends: ['@react-native'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    'react-native/no-unused-styles': 'error',
    'react-native/split-platform-components': 'error',
    'react-native/no-inline-styles': 'warn',
    'react-native/no-color-literals': 'warn',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
  ignorePatterns: ['node_modules/', 'android/', 'ios/', 'dist/'],
};
```

## 🔧 ORTA ÖNCELİKLİ KONFİGÜRASYON SORUNLARI

### 7. Babel Konfigürasyonu

#### Sorun: Module Resolver Path'leri
**Dosya:** `apps/mobile/babel.config.js`

**Mevcut Konfigürasyon:**
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './src/assets',
        },
      },
    ],
  ],
};
```

**Sorun:** Monorepo paketleri için alias eksik.

**Düzeltilmiş Konfigürasyon:**
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    'nativewind/babel',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@screens': './src/screens',
          '@hooks': './src/hooks',
          '@utils': './src/utils',
          '@types': './src/types',
          '@assets': './src/assets',
          // Monorepo packages
          '@ybis/core': '../../packages/core/src',
          '@ybis/ui': '../../packages/ui/src',
          '@ybis/api-client': '../../packages/api-client/src',
          '@ybis/workflows': '../../packages/workflows/src',
        },
      },
    ],
  ],
};
```

### 8. Tailwind Konfigürasyonu

#### Sorun: NativeWind Konfigürasyonu
**Dosya:** `apps/mobile/tailwind.config.js`

**Mevcut Konfigürasyon:**
```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**Düzeltilmiş Konfigürasyon:**
```javascript
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
    './shared/**/*.{js,jsx,ts,tsx}',
    './features/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6',
        secondary: '#6b7280',
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
    },
  },
  plugins: [],
};
```

## 🔍 DÜŞÜK ÖNCELİKLİ KONFİGÜRASYON SORUNLARI

### 9. Prettier Konfigürasyonu

#### Sorun: Prettier Konfigürasyonu Eksik
**Dosya:** `.prettierrc`

**Düzeltilmiş Konfigürasyon:**
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### 10. Git Konfigürasyonu

#### Sorun: .gitignore Eksik
**Dosya:** `.gitignore`

**Düzeltilmiş Konfigürasyon:**
```gitignore
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# React Native
.expo/
.expo-shared/
*.jks
*.p8
*.p12
*.key
*.mobileprovision
*.orig.*
web-build/

# Metro
.metro-health-check*

# Android
android/app/build/
android/build/
android/.gradle/
android/local.properties
android/app/debug.keystore

# iOS
ios/build/
ios/Pods/
ios/*.xcworkspace
ios/*.xcuserdata
ios/DerivedData/

# TypeScript
*.tsbuildinfo

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output/

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# next.js build output
.next

# nuxt.js build output
.nuxt

# vuepress build output
.vuepress/dist

# Serverless directories
.serverless

# FuseBox cache
.fusebox/

# DynamoDB Local files
.dynamodb/

# TernJS port file
.tern-port
```

## 📋 KONFİGÜRASYON DÜZELTME ADIMLARI

### 1. Acil Düzeltmeler (Bugün)
```bash
# Android Gradle path'lerini düzelt
cd apps/mobile/android/app
# build.gradle dosyasını düzenle

# Metro bundler konfigürasyonunu düzelt
cd apps/mobile
# metro.config.js dosyasını düzenle

# Build scripti ekle
# package.json dosyasını düzenle
```

### 2. Bu Hafta
```bash
# TypeScript konfigürasyonlarını düzelt
cd packages/core && npm install typescript@5.9.2 --save-dev
cd packages/ui && npm install typescript@5.9.2 --save-dev
cd packages/api-client && npm install typescript@5.9.2 --save-dev
cd packages/workflows && npm install typescript@5.9.2 --save-dev

# Jest konfigürasyonunu düzelt
cd apps/mobile
npm install @testing-library/jest-native --save-dev

# ESLint konfigürasyonunu düzelt
# eslint.config.js dosyasını düzenle
```

### 3. Gelecek Hafta
```bash
# Babel konfigürasyonunu düzelt
# babel.config.js dosyasını düzenle

# Tailwind konfigürasyonunu düzelt
# tailwind.config.js dosyasını düzenle

# Prettier konfigürasyonu ekle
# .prettierrc dosyasını oluştur

# Git konfigürasyonu ekle
git init
# .gitignore dosyasını oluştur
```

## 🎯 BAŞARI KRİTERLERİ

- [ ] Android Gradle build başarılı
- [ ] Metro bundler sorunsuz çalışıyor
- [ ] TypeScript derlemesi başarılı
- [ ] Jest testleri çalışıyor
- [ ] ESLint kuralları geçiyor
- [ ] Prettier formatting çalışıyor
- [ ] Git repository düzgün kurulmuş

Bu konfigürasyon sorunları çözüldükten sonra, proje tamamen çalışır durumda olacaktır.

