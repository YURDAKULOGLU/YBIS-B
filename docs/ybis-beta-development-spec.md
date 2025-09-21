# YBIS BETA DEVELOPMENT SPECIFICATION
## (deneme.md Chat Loglarından Türetilmiş - Demo Kısımları Çıkarıldı)

**Date:** 2025-01-23  
**Version:** 1.0  
**Status:** Beta Development Focus  
**Source:** deneme.md chat logs analysis

---

## 📋 **Table of Contents**
1. [Genel Kararlar & Vizyon](#genel-kararlar--vizyon)
2. [Yapısal Organizasyon & Vertical Paketler](#yapısal-organizasyon--vertical-paketler)
3. [Development Kararları & Teknik Strateji](#development-kararları--teknik-strateji)
4. [Ürün Stratejisi & Scope Yönetimi](#ürün-stratejisi--scope-yönetimi)
5. [Repository & Branch Yönetimi](#repository--branch-yönetimi)
6. [Build & Dependency Yönetimi](#build--dependency-yönetimi)
7. [Güvenlik & Config Yönetimi](#güvenlik--config-yönetimi)
8. [Beta Development Roadmap](#beta-development-roadmap)
9. [Eksikler & Riskler](#eksikler--riskler)

---

## 🔷 **BÖLÜM 1: GENEL KARARLAR & VİZYON**

### **Tek Ekran Yaklaşımı**
- **Ana Değer:** Uygulamanın en vurucu noktası tek ekran yaklaşımı
- **Kullanıcı Deneyimi:** Kullanıcı uygulamaya girdiğinde tüm işlerini buradan halledecek
- **Basitlik Felsefesi:** Karmaşıklığı ortadan kaldıran, otomasyonu hissettiren deneyim
- **Aha Moment:** Kullanıcının işinin "gerçekten yapıldığını" hissetmesi

### **Monorepo Stratejisi**
- **Yapı:** Proje tek repo altında, vertical paketler halinde modüler kurgulanacak
- **Disiplin:** Başta farklı dependency setleri denense de, sonunda her şeyi hizalamak kararı
- **Uyumluluk:** Ayrı ayrı bağımlılık karmaşası olmayacak, uyumlu tek yapı
- **Modülerlik:** Her vertical bağımsız ama gerektiğinde üst üste gelebilecek şekilde

### **Master Agent + Sub-Agent Mimarisi**
- **Orkestratör:** Ana ajan orkestratör olacak
- **Alt Ajanlar:** Email, Calendar, Task vb. ajanlar çalışacak
- **Koordinasyon:** Master agent alt ajanları koordine edecek
- **Genişletilebilirlik:** Yeni ajanlar kolayca eklenebilecek

### **Beta Süreci Stratejisi**
- **Öncelik:** Beta kullanıcılarından gerçek kullanım verisi toplamak
- **Değer İspatı:** Ürünün değerini ispatlamak
- **Gerçek Entegrasyonlar:** Google Auth gibi entegrasyonların fake değil, gerçek olması
- **Feedback Loop:** Kullanıcı geri bildirimlerini sistematik toplama

---

## 🔷 **BÖLÜM 2: YAPISAL ORGANİZASYON & VERTICAL PAKETLER**

### **Vertical Paket Mantığı**
- **LawBIS:** Anayasa/tüzük tarayıcı, hukuki doküman yönetimi
- **DocBIS:** Tıp kaynaklarını tarayıcı, hasta kayıt sistemi
- **StudBIS:** Akademik araştırma, ödev takip sistemi
- **GenBIS:** Genel iş süreçleri, temel productivity

### **Ortak Base Sistemi**
- **Agent Altyapısı:** Tüm vertical'larda ortak agent sistemi
- **Core Tools:** Temel araçlar tüm paketlerde mevcut
- **Özel Tools:** Her paketin kendi özel araçları
- **Stacklenebilir Modüller:** Bağımsız ama üst üste gelebilir

### **Flashcard ve Özgün Tools**
- **Öğrenci Odaklı:** Öğrenciler için farklılaştırıcı modüller
- **Özel Özellikler:** Her vertical'ın kendine özgü araçları
- **Genişletilebilirlik:** Yeni vertical'lar kolayca eklenebilir

---

## 🔷 **BÖLÜM 3: DEVELOPMENT KARARLARI & TEKNİK STRATEJİ**

### **Monorepo Disiplini**
- **Bağımlılık Yönetimi:** Tüm paketlerin uyumlu dependency setleri
- **Build Sistemi:** Tek build pipeline, tutarlı versiyonlama
- **Test Altyapısı:** Eksik olan kısımlar sonradan eklenecek
- **Code Quality:** Lint, format, type-check standartları

### **Build & Path Sorunları**
- **Metro Config:** Mobile uygulamanın paket bağımlılıkları düzeltilmesi gerekiyor
- **Import Paths:** src vs dist importları, metro config yanlış pathler
- **Package Dependencies:** Mobile package.json'da @ybis/* paketleri eksik
- **Build Scripts:** Mobile için build script'i tanımlı değil

### **React Native Versiyon Stratejisi**
- **Mevcut:** RN 0.80+ uyum sorunları var
- **Fallback:** Gerekirse 0.76 gibi daha stabil versiyonlara dönülebilir
- **Yeni Mimari:** Fabric/JSI gerekirse kapatılabilir, riskli
- **Kotlin & CompileSdk:** Versiyon downgrade çözüm olarak masada

### **Test & CI/CD Eksikleri**
- **Test Coverage:** Şu an yalnızca temel smoke test mantığında
- **Unit Tests:** Utils, agents, service katmanı eksik
- **Integration Tests:** Email→task akışı, calendar conflict çözümü eksik
- **CI/CD Pipeline:** Henüz pipeline yok, GitHub Actions planlanıyor

---

## 🔷 **BÖLÜM 4: ÜRÜN STRATEJİSİ & SCOPE YÖNETİMİ**

### **Scope Kayması Önleme**
- **Ana Hedef:** "Hayatını profesyonelce yönet" mottosu
- **Core Features:** Üç temel entegrasyon (Email, Calendar, Task) + Workflow Builder
- **Beta Focus:** Ürünün çekirdek değerini ispatlama
- **Feature Discipline:** Gereksiz özellik eklememek

### **Aha Moment Stratejisi**
- **Basitlik Vurgusu:** Kullanıcı değeri basitlik üzerinden görecek
- **Otomasyon Hissi:** İşin gerçekten yapıldığına dair hissiyat
- **Immediate Value:** Kullanıcı hemen değer görmeli
- **Workflow Success:** Otomatik workflow'ların başarılı çalışması

### **Monetizasyon Stratejisi**
- **Beta Sonrası:** Monetizasyon beta sonrası kararlaştırılacak
- **Test & Doğrulama:** Şimdilik strateji test, doğrulama ve değer ispatı
- **Türkiye Pazarı:** TL bazlı, KOBİ odaklı modeller
- **Pricing Research:** Kullanıcı feedback'i ile pricing belirleme

---

## 🔷 **BÖLÜM 5: REPOSITORY & BRANCH YÖNETİMİ**

### **Monorepo Branch Stratejisi**
- **main:** Stabil release branch
- **develop:** Core development (n8n'siz, temiz)
- **beta-development:** Beta geliştirme için özel branch
- **production-ready:** Hardened production branch

### **Branch Kullanım Kuralları**
- **Beta Branch:** Beta geliştirme için ayrı branch
- **Development:** Temel geliştirme develop'da
- **Feature Branches:** Her özellik için ayrı branch
- **Release Management:** main'den release tag'leri

### **Code Quality & Review**
- **Pull Request:** Tüm değişiklikler PR ile
- **Code Review:** En az bir kişi review
- **Automated Checks:** Lint, test, build kontrolleri
- **Merge Strategy:** Squash merge tercih edilir

---

## 🔷 **BÖLÜM 6: BUILD & DEPENDENCY YÖNETİMİ**

### **Metro Config Sorunları**
- **Import Resolution:** Mobile app paketleri src'den import ediyordu
- **Dist Yönlendirme:** dist'e yönlendirilmesi gerekiyor
- **NodeModules Paths:** Yanlış ayarlanmış (../../../ yerine ../../)
- **Package Resolution:** Metro'nun paket çözümleme sorunları

### **Mobile Package.json Eksikleri**
- **Dependencies:** @ybis/* paketleri dependency olarak eklenmemiş
- **Build Scripts:** Build script'i mobile için tanımlı değil
- **Script Dependencies:** Build script'leriyle çözülmeli
- **Version Alignment:** Tüm paketlerin versiyon uyumu

### **Versiyonlama Stratejisi**
- **RN Sürüm:** 0.80+ sorun çıkarırsa 0.76'ya dönmek mantıklı
- **Kotlin/CompileSdk:** Uyumluluk sorunları için versiyon düşürme fallback'i
- **Yeni Mimari:** Fabric/JSI beta'da kapatmak mantıklı olabilir
- **Stability First:** Risk azaltma için stabil versiyonlar tercih

---

## 🔷 **BÖLÜM 7: GÜVENLİK & CONFIG YÖNETİMİ**

### **API Key Güvenliği**
- **Risk:** Şu an default keyler kodda gömülü olma riski
- **Çözüm:** .env + react-native-config kullanımı
- **Backend Proxy:** API key'leri backend üzerinden proxy
- **Environment Separation:** Dev, staging, prod ayrı config'ler

### **Google Auth Güvenliği**
- **Gerçek Auth:** Beta'da gerçek olmalı, mock değil
- **Token Management:** Güvenli token saklama ve refresh
- **Scope Management:** Minimal gerekli scope'lar
- **Security Headers:** CORS, CSP gibi güvenlik başlıkları

### **Rate Limiting & Firewall**
- **API Rate Limiting:** API tarafında eklenmeli (örn. 100 req / 15 dk)
- **CORS & Firewall:** Domain bazlı whitelist
- **Cloudflare Firewall:** TR odaklı koruma
- **DDoS Protection:** Cloudflare ile DDoS koruması

---

## 🔷 **BÖLÜM 8: BETA DEVELOPMENT ROADMAP**

### **Phase 1: Core Infrastructure (2-3 hafta)**
- Metro config sorunlarını çözme
- Mobile package.json dependencies düzeltme
- Build script'leri ekleme
- Basic CI/CD pipeline kurma

### **Phase 2: Beta Features (3-4 hafta)**
- Gerçek Google Auth entegrasyonu
- Core workflow'ları implement etme
- Beta user onboarding sistemi
- Feedback collection sistemi

### **Phase 3: Beta Testing (4-6 hafta)**
- Beta user recruitment
- Real usage tracking
- Performance monitoring
- Bug fixing ve optimization

### **Phase 4: Production Preparation (2-3 hafta)**
- Security hardening
- Production deployment setup
- Monitoring ve alerting
- User documentation

---

## 🔷 **BÖLÜM 9: EKSİKLER & RİSKLER**

### **Kritik Eksikler**
- **Test Coverage:** Test coverage düşük
- **CI/CD Pipeline:** Henüz pipeline yok
- **Mobile UI:** Bazı kısımlarda template ihtiyacı var
- **Prod Security:** Prod-ready güvenlik ayarları henüz tam değil

### **Teknik Riskler**
- **RN Versiyon:** React Native versiyon uyumsuzluğu
- **Monorepo Paths:** Monorepo path hataları
- **n8n Bağımlılığı:** n8n'e aşırı bağımlılık (ileride çıkarılmalı)
- **AI Değer Algısı:** Kullanıcının AI değerini görememe ihtimali

### **Risk Azaltma Stratejileri**
- **Stabil Versiyonlar:** Riskli güncellemelerden kaçınma
- **Fallback Plans:** Her kritik sistem için fallback plan
- **User Education:** AI değerini vurgulama ve eğitim
- **Incremental Rollout:** Aşamalı özellik çıkarma

---

## 📊 **Implementation Checklist**

### **Immediate Actions (Week 1)**
- [ ] Metro config sorunlarını çöz
- [ ] Mobile package.json dependencies ekle
- [ ] Build script'leri tanımla
- [ ] Basic CI/CD pipeline kur

### **Short Term (Weeks 2-4)**
- [ ] Google Auth gerçek entegrasyonu
- [ ] Core workflow implementasyonu
- [ ] Beta user onboarding sistemi
- [ ] Feedback collection sistemi

### **Medium Term (Weeks 5-8)**
- [ ] Beta user recruitment
- [ ] Real usage tracking
- [ ] Performance monitoring
- [ ] Bug fixing ve optimization

### **Long Term (Weeks 9-12)**
- [ ] Security hardening
- [ ] Production deployment setup
- [ ] Monitoring ve alerting
- [ ] User documentation

---

## 🎯 **Success Metrics**

### **Technical Metrics**
- Build success rate: >95%
- Test coverage: >80%
- CI/CD pipeline: 100% automated
- Security score: A+ rating

### **Beta Metrics**
- Beta user count: 50+ active users
- Feature adoption: >70% of users use core features
- Feedback quality: Structured feedback collection
- Performance: <2s response time

### **Quality Metrics**
- Bug count: <5 critical bugs
- User satisfaction: >4.0/5.0 rating
- Documentation coverage: 100% API documented
- Code quality: ESLint/Prettier compliance

---

**This specification serves as the comprehensive guide for YBIS beta development phase, derived from chat log analysis and technical decisions.**
