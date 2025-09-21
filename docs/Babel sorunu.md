Problem Snapshot

Metro logs hala @babel/runtime/helpers/interopRequireDefault modülünü bulamadığını söylüyor. Metro aradığı yolu sırayla apps/mobile/node_modules → .. → ..\..\node_modules (yani C:\Projeler\YBIS_2\node_modules) şeklinde deniyor, fakat çözüm adımı başarısız oluyor.
Dosya fiziksel olarak mevcut (node_modules/@babel/runtime/helpers/interopRequireDefault.js) ve kök package.json bağımlılık listesinde ("@babel/runtime": "^7.28.4") yer alıyor; npm ls @babel/runtime de tek kopyayı doğruluyor.
Depoda şu an yalnızca 003-mobile-google-oauth dalı açık ve tüm kaynaklar ?? (izlenmeyen) durumda, yani git’te henüz commit’lenmiş bir değişiklik yok.
Şu Ana Kadar Yapılanlar

Npm workspaces refaktörü: Mobil bağımlılıklar köke taşındı, apps/mobile/package.json yalnızca script + peerDependency tutacak şekilde sadeleştirildi.
Metro temizliği: Metro 8081 portu birkaç kez sonlandırıldı, npm start -- --reset-cache ile temiz cache denemeleri yapıldı.
Node_modules temizliği: apps/mobile/node_modules ve .tmp tekrar tekrar silindi; şu anda Get-ChildItem -Directory -Recurse -Filter node_modules çıktısı yalnızca kök ağacı (ve backend workspace’inin node_modules’ü) gösteriyor.
React Native CLI çağrıları: Script’ler kökteki CLI’yı kullanacak şekilde npx/node ../../node_modules/react-native/cli.js ... biçimine getirildi; Metro/Android komutlarının hepsi kökten çalışıyor.
Metro alias denemesi: apps/mobile/metro.config.js:25 altına @babel/runtime ve @babel/runtime/helpers alias’ı eklenip çıkarıldı; davranış değişmediği için alias geri alındı.
Muhtemel Kök Sebep

Babel preset’i helper’ları @babel/runtime üzerinden çözüyor. Paket kökte kurulu olsa da Metro, workspace sınırları nedeniyle dependency’yi “mobil proje tarafından talep edilmemiş” varsayıp Haste grafine eklemiyor olabilir.
extraNodeModules için kullanılan Proxy nested path içeren modül isimlerinde (ör. @babel/runtime/helpers/...) beklenmedik çalışıyor olabilir; Metro ismi tek segment olarak değil komple string olarak alıyor, ama yine de çözüm başarısız yani Proxy çözümü yeterli değil.
Önerilen Çözüm Yolları

Mobil workspace’e runtime’ı dependency olarak ilan et
apps/mobile/package.json içine (örn. dependencies veya devDependencies) "@babel/runtime": "^7.28.4" ekleyip kökten tekrar npm ci çalıştır. npm workspaces modülü yine köke kurar fakat Metro paket-bağımlılık ilişkisini görmüş olur. (Benzeri ihtiyaç varsa @babel/runtime kullanan diğer workspace’ler de deklarasyon eklemeli.)
Custom resolver yazarak kök node_modules’e yönlendir
Metro config’e resolver.resolveRequest fonksiyonu ekleyip @babel/runtime pattern’ini yakalayarak doğrudan path.join(monorepoRoot, 'node_modules', request.moduleName) döndür. Alias denemesi işe yaramasa da fonksiyon bazlı çözüm nested path problemini ortadan kaldırır.
Metro configini minimal hâle getirip test et
Geçici olarak extraNodeModules, nodeModulesPaths gibi özelleştirmeleri kaldırıp Metro’nun varsayılan çözümlemesini dene. Eğer hata kaybolursa Proxy/özel path yapılandırması sorunun kaynağıdır.
Hızlı ama geçici workaround
apps/mobile içinde npm install @babel/runtime çalıştırıp lokal node_modules oluşturmak, problemi çözer fakat eski “iki node_modules” kopyası sorununu geri getirir. Kalıcı çözüm değil fakat blokeri aşmak gerekirse denenebilir.
Sonraki Adım Önerisi

En düşük riskli yol olarak 1. seçeneği (workspace dependency deklarasyonu) dene; ardından npm ci → npm start -- --reset-cache → npx react-native run-android --config ./react-native.config.js --projectRoot apps/mobile.