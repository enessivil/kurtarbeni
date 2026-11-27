# KurtarBeni / RescueMe

<p align="center">
  <img src="assets/banner.jpg" alt="KurtarBeni / RescueMe Banner" width="100%">
</p>

<p align="center">
  <a href="https://enessivil.github.io/kurtarbeni/"><img src="https://img.shields.io/badge/Live_Demo-GitHub_Pages-FF4D00?style=for-the-badge&logoColor=white" alt="Live Demo"></a>
  <a href="https://github.com/enessivil/kurtarbeni/actions/workflows/deploy.yml"><img src="https://github.com/enessivil/kurtarbeni/actions/workflows/deploy.yml/badge.svg" alt="Deploy Status"></a>
  <a href="https://github.com/enessivil/kurtarbeni/releases/latest"><img src="https://img.shields.io/github/v/release/enessivil/kurtarbeni?style=for-the-badge&color=111111" alt="Latest Release"></a>
  <a href="https://github.com/enessivil/kurtarbeni/blob/main/LICENSE"><img src="https://img.shields.io/github/license/enessivil/kurtarbeni?style=for-the-badge&color=111111" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/PWA-100%25_Offline-111111?style=for-the-badge" alt="Offline PWA">
  <img src="https://img.shields.io/badge/Dependencies-Zero-111111?style=for-the-badge" alt="Zero Dependencies">
</p>

<p align="center">
  <a href="#-türkçe"><strong>🇹🇷 Türkçe</strong></a> •
  <a href="#-english"><strong>🇬🇧 English</strong></a>
</p>

---

## 🇹🇷 Türkçe

**KurtarBeni**, istemediğin bir sohbetten ya da uzayan bir toplantıdan nazikçe sıyrılman için geliştirilmiş; **reklamsız, sunucusuz, sıfır dış bağımlılıklı ve %100 çevrimdışı çalışan** açık kaynak bir PWA (Progressive Web App) uygulamasıdır.

🌐 **Canlı Uygulama:** [https://enessivil.github.io/kurtarbeni/](https://enessivil.github.io/kurtarbeni/)

### Öne Çıkan Özellikler (v4.0.0)

- **Endüstriyel Minimalist Arayüz (`KB-04`):** Saf AMOLED siyah (`#000000`), `1px` mimari çizgiler, tek sinyal rengi (`#FF4D00`), OLED telemetri şeridi ve 3 net sekme (`01 Senaryo` · `02 Görünüm & Ses` · `03 Güvenlik`).
- **Tırmanan Senaryo Zinciri (`Zincir` Modu):** Önce sakin bir mesaj, ardından acil ikinci mesaj ve hemen üstüne aynı kişiden gerçekçi gelen arama akışı.
- **Hesap Makinesi Kılığı (Kamufle Mod):** Gerçek çalışan hesap makinesine bürünür. İşlem girmeden sadece sayı + `=` yazdığında (ör. `15=`) kimse fark etmeden gizli geri sayım başlar. `AC`'ye çift dokunarak iptal edebilir, `AC`'ye `1.5 sn` basılı tutarak ayarlara dönebilirsin.
- **Ahize Filtreli Karşı Taraf Sesi & Fısıltı Kaydırıcısı:** Aramayı cevapladığında `300–3400 Hz` telefon filtresinden geçirilmiş GSM hat ortam sesi veya kendi ses kaydın çalar. Varsayılan `%8` fısıltı seviyesi canlı kaydırıcıyla (`%2–%30`) ayarlanabilir; görüşmede *Hoparlör* ve *Beklet* butonlarına anında tepki verir.
- **Sessiz Güvenlik Köprüsü (Acil SMS):** Güvenlik sekmesinde güvendiğin bir kişinin numarasını kaydettiysen, aktif görüşme ekranında **Beklet** tuşuna `2.5 sn` basılı tutarak cihazının SMS uygulamasını önceden doldurulmuş yardım mesajıyla açabilirsin.
- **Stüdyo DSP Ses Motoru & Kişiselleştirme:** Harici dosya indirmeden tarayıcı içinde anlık `16-bit PCM WAV` zil/bildirim sesleri üretir. İstersen kendi duvar kağıdını (kilit ekranı + bulanık arama arka planı) ve kendi ses dosyalarını tamamen cihaz içi (`IndexedDB`) olarak ekleyebilirsin.
- **Android & iOS Otomatik Algılama + TR / EN Dil Desteği:** Simülasyon ekranlarını (kilit ekranı, gelen arama, hesap makinesi) cihazına göre otomatik uyarlar ve tek dokunuşla Türkçe / İngilizce arasında geçiş yapar.
- **Güvenlik Sertleştirmesi:** Katı Content Security Policy (`default-src 'self'`, `script-src 'self'`, `connect-src 'self'`), sıfır `innerHTML`/`eval`, sıfır harici CDN/font/çerez ve her push'ta çalışan otomatik GitHub Actions güvenlik denetimi.

### Nasıl Kullanılır?

1. **[Canlı Uygulamayı Aç](https://enessivil.github.io/kurtarbeni/)** ve telefonunda **Ana Ekrana Ekle** ile kısayol oluştur (uçak modunda bile çalışır).
2. `01 Senaryo` sekmesinden modu (*Arama / Mesaj / Zincir*), arayanı ve süreyi seç.
3. İstersen `02 Görünüm & Ses` sekmesinden kendi duvar kağıdını/zil sesini, `03 Güvenlik` sekmesinden karşı taraf fısıltı sesini veya Sessiz SOS numaranı ayarla.
4. En alttaki **Başlat ve Karart** butonuna dokun (ya da Hesap Makinesi kılığında `15=` yaz).
5. **Önemli Notlar:** Güç tuşuyla ekranı kilitleme; 2 saniye içinde açılan AMOLED saf siyah ekran kapalıymış gibi görünür. Başlatmadan önce telefonun *Medya* ses düzeyini kontrol et.

### Ekran Görüntüleri

<table align="center">
  <tr>
    <td align="center" width="50%">
      <strong>01 · Endüstriyel Kurulum Arayüzü</strong><br>
      <img src="assets/ayarlar.jpg" alt="KurtarBeni Kurulum Ekranı" width="100%">
    </td>
    <td align="center" width="50%">
      <strong>02 · Gelen Arama Simülasyonu</strong><br>
      <img src="assets/gelen-arama.jpg" alt="KurtarBeni Gelen Arama Ekranı" width="100%">
    </td>
  </tr>
</table>

### Gizlilik, KVKK & Yasal Uyarı

- **Sıfır Veri İletimi:** Uygulama kodu geliştiriciye veya üçüncü taraflara hiçbir veri göndermez. Ayarlar ve seçtiğin medya dosyaları yalnızca kendi tarayıcının yerel deposunda (`localStorage` / `IndexedDB`) tutulur ve uygulama içinden tek tıkla kalıcı olarak silinebilir. Statik barındırma sağlayan **GitHub Pages (GitHub, Inc.)**, kendi güvenlik politikaları kapsamında ziyaretçi IP adreslerini loglayabilir.
- **Sessiz SOS Sınırı:** Sessiz SOS özelliği gerçek bir acil çağrı merkezi veya otomatik yardım sistemi değildir; yalnızca cihazın SMS uygulamasını hazır taslakla açar. Gerçek acil durumlarda doğrudan **112 Acil Çağrı Merkezi**'ni arayın.
- **Yasal Kullanım:** Uygulama MIT Lisansı ile "olduğu gibi" sunulur; dolandırıcılık, tehdit, taciz veya hukuka aykırı herhangi bir amaçla kullanılamaz.
- **Marka Feragatnamesi:** iPhone, iOS, Android, Samsung, One UI, Xiaomi, Google Pixel ve Huawei adları yalnızca uyumluluk ve bilgilendirme amacıyla anılmıştır; ilgili hak sahiplerinin tescilli markalarıdır ve bu projenin bu markalarla resmi bağlantısı yoktur.

---

## 🇬🇧 English

**RescueMe (KurtarBeni)** is an open-source, **ad-free, serverless, zero-dependency, 100% offline PWA** built to help you politely exit awkward conversations or endless meetings.

🌐 **Try Live:** [https://enessivil.github.io/kurtarbeni/](https://enessivil.github.io/kurtarbeni/)

### Key Features (v4.0.0)

- **Industrial Hardware-Minimalist UI (`KB-04`):** Pure AMOLED black (`#000000`), crisp `1px` architectural borders, a single functional signal accent (`#FF4D00`), OLED telemetry bar, and 3 clean tabs (`01 Scenario` · `02 Look & Sound` · `03 Safety`).
- **Escalating Scenario Chain (`Chain` Mode):** Delivers a calm first notification, followed by an urgent second message, and finishes with a realistic incoming call from the same person.
- **Calculator Disguise (Stealth Mode):** Looks and works like a real calculator. Type a plain number + `=` (e.g. `15=`) to silently arm a 15-second countdown. Double-tap `AC` to cancel, or press and hold `AC` for `1.5s` to return to setup.
- **Earpiece-Filtered Caller Audio & Whisper Fader:** Plays subtle GSM line ambience or your own uploaded audio clip filtered through a `300–3400 Hz` telephone bandpass filter. Defaults to a quiet `8%` whisper level with a live calibration fader (`2%–30%`) and responds live to *Speaker* and *Hold*.
- **Silent Safety Bridge (Emergency SMS):** Save an optional trusted contact under `03 Safety`; holding the **Hold** button for `2.5s` during an active call opens your native SMS app pre-filled with your help draft.
- **Studio DSP Synth & Local Customization:** Synthesizes `16-bit PCM WAV` ringtones and alerts directly in the browser with zero external assets. Custom wallpapers (lock screen + blurred call screen) and audio files stay strictly offline on your device (`IndexedDB`).
- **Auto Android/iOS Native Simulation + Bilingual (`TR | EN`):** Adapts lock screen, incoming call, and calculator themes to iOS or Android and switches instantly between Turkish and English.
- **Hardened Security & Privacy:** Strict CSP (`default-src 'self'`, `script-src 'self'`, `connect-src 'self'`), zero `innerHTML`/`eval`, zero external CDNs/fonts/cookies, and automated CI security checks on every push.

### Privacy & Legal Notice

- **Client-Side Only:** The app sends zero user data to any server. Preferences and custom media stay strictly in your device's browser storage (`localStorage` / `IndexedDB`) and can be wiped in one tap. Note that **GitHub Pages (GitHub, Inc.)**, as the static host, may log visitor IP addresses under its own security and privacy policy.
- **Emergency Disclaimer:** Silent SOS is not an emergency dispatch service — it only opens a pre-filled SMS draft. In any real emergency, call **112 / 911** immediately.
- **Trademarks:** iPhone, iOS, Android, Samsung, One UI, Xiaomi, Google Pixel, and Huawei are trademarks of their respective owners, mentioned solely for compatibility with no official affiliation.

---

## 🤝 Katkıda Bulunma / Contributing

Detaylı kurallar için [`CONTRIBUTING.md`](CONTRIBUTING.md) ve güvenlik bildirimleri için [`SECURITY.md`](SECURITY.md) dosyalarına göz atabilirsin. Her değişiklikte **sıfır dış bağımlılık**, **katı CSP uyumu** ve `sw.js` önbellek sürüm artışı zorunludur.

📜 Lisans / License: **[MIT](LICENSE)**
