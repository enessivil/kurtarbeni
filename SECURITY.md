# Güvenlik Politikası

## Mimari Güvenlik Özeti

**KurtarBeni**, sıfır sunucu ve sıfır dış bağımlılık prensibiyle geliştirilmiş tamamen statik bir PWA (Progressive Web App) uygulamasıdır:

- **Sıfır Harici CDN / Kütüphane:** Uygulama içinde Google Fonts, analitik scripti veya harici JS/CSS kütüphanesi bulunmaz.
- **Katı Content Security Policy (CSP):** `script-src 'self'`, `style-src 'self'`, `connect-src 'self'`, `object-src 'none'` kurallarıyla inline script/style ve dış veri sızıntısı engellenir.
- **DOM-XSS Koruması:** Kod tabanında `innerHTML`, `outerHTML`, `eval` veya `document.write` kullanılmaz; tüm kullanıcı girdileri yalnızca `textContent` ile işlenir.
- **Sıfır Sunucu Saldırı Yüzeyi:** Backend, veritabanı veya kullanıcı oturumu bulunmadığından sunucu kaynaklı zafiyetler oluşmaz.

## Güvenlik Açığı Bildirimi

Bir güvenlik açığı tespit ederseniz, lütfen herkese açık Issue açmak yerine GitHub deposundaki **Security → Advisories → Report a vulnerability** (Private Vulnerability Reporting) özelliğini kullanarak bildirin.
