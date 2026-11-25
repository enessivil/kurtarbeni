[![Canlı Uygulama](https://img.shields.io/badge/Canl%C4%B1_Uygulama-GitHub_Pages-22C55E?style=for-the-badge)](https://enessivil.github.io/kurtarbeni/)
[![Deploy Durumu](https://github.com/enessivil/kurtarbeni/actions/workflows/deploy.yml/badge.svg)](https://github.com/enessivil/kurtarbeni/actions)
[![Lisans: MIT](https://img.shields.io/badge/Lisans-MIT-3B82F6.svg)](LICENSE)
# KurtarBeni — Çevrimdışı Sahte Arama & Mesaj (PWA)

İstemediğiniz bir sohbetten veya uzayan bir toplantıdan nazikçe ayrılmak için tasarlanmış, **%100 çevrimdışı çalışan**, **sıfır dış bağımlılıklı** ve **gizlilik odaklı** açık kaynak web uygulaması.

## Özellikler

- **Android & iOS Otomatik Algılama:** Cihazınıza göre gelen arama ve kilit ekranı arayüzünü otomatik uyarlar (isteğe bağlı manuel geçiş destekli).
- **Tam Çevrimdışı PWA Desteği:** Chrome (Android) ve Safari (iOS) üzerinden ana ekrana kısayol olarak eklenir; Service Worker sayesinde uçak modunda bile çalışır.
- **Akıllı Ses Motoru:** Harici ses dosyası indirmeden Web Audio API ile iOS/Android tarzı zil ve bildirim sesleri üretir. İsterseniz telefonunuzdaki kendi `.mp3`/`.wav`/`.m4a` dosyanızı cihaz içi (IndexedDB) olarak ekleyebilirsiniz.
- **AMOLED Gizli Bekleme Modu:** Geri sayım sırasında ekran saf siyaha geçer; Screen Wake Lock API ile telefonun uykuya dalmasını engeller.
- **KVKK & Güvenlik Odaklı:** Sıfır sunucu, sıfır çerez, sıfır izleyici, sıfır harici CDN ve katı Content Security Policy (CSP).

## Ücretsiz GitHub Pages ile Yayınlama

1. GitHub'da yeni bir **Public** depo (repository) oluşturun (ör. `kurtarbeni`).
2. Bu klasördeki tüm dosyaları (`.nojekyll` ve `icons/` klasörü dahil) deponun ana dizinine yükleyin.
3. Deponuzda **Settings → Pages** menüsüne gidin.
4. **Build and deployment → Source** bölümünden **Deploy from a branch** seçin.
5. Branch olarak **main** ve klasör olarak **/(root)** seçip **Save** butonuna tıklayın.
6. 1-2 dakika içinde uygulamanız `https://<kullanici-adin>.github.io/<depo-adin>/` adresinde HTTPS ile canlı olarak yayına girer.

## Yasal Uyarı

Bu proje yalnızca simülasyon, sosyal ortamlardan çıkış ve kişisel güvenlik hissi amaçlıdır. Acil durumlarda gerçek **112 Acil Çağrı Merkezi** yerine kullanılamaz. MIT Lisansı altında sunulmaktadır.
