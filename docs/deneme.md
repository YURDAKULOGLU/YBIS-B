# React Native Android Build Notes

## Çözülen Problemler
- Flash-list native bağımlılığı autolinking sırasında buildi kırıyordu. Paket projeden tamamen kaldırıldı ve react-native.config.js dosyalarına Android platformunu devre dışı bırakan override eklendi.
- FlashList kalıntıları nedeniyle üretilen Java stubları temizlendi ve apps/mobile/android/app/build/generated/autolinking çıktıları silinerek autolinking listesi sıfırlandı.
- Gradle ve React Native cacheleri temizlendi (npx react-native clean, ./gradlew clean, kullanıcı ve proje bazlı .gradle klasörleri dahil). Böylece eski cachelerin build üzerinde etkisi kaldırıldı.

## Mevcut Durum
- FlashList kaynaklı build hatası giderildi; autolinking artık bu paketi listelemiyor.
- React Native 0.80 şu anda AGP 8.6.0 ile derlenmeye çalışıyor. Bu kombinasyon, react-native/gradle-pluginin AGP 8.9.2 parçalarını çekmeye çalışması nedeniyle 530 HTTP hatası üretiyor.
- react ve react-test-renderer paketleri 19.1.1 sürümünde; RN 0.80/0.81 resmi olarak React 18.3.1 ile uyumlu.

## Yapılacaklar
1. **Sürüm uyumlaştırması**
   - AGPyi RN 0.80 ile uyumlu bir seviyeye düşür (com.android.tools.build:gradle:8.1.4 + Gradle 8.0.x) veya RN 0.81e yükseltip AGP 8.12.0 + Gradle 9.0a geç.
   - react ve react-test-rendererı 18.3.1 sürümüne sabitle.
2. **RN 0.81 yükseltmesi (opsiyonel ama tavsiye edilen)**
   - @react-native/* preset/config paketlerini 0.81.x ile güncelle.
