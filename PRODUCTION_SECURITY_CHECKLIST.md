# RODINA Production Security Checklist

Bu liste canlı yayına çıkmadan önce sunucuda uygulanması gereken güvenlik adımlarını özetler.

## Zorunlu Ortam Değişkenleri

- `NODE_ENV=production` olarak çalıştırılmalı.
- `NEXT_PUBLIC_SITE_URL` canlı HTTPS domain olmalı.
- `EMLAK_ALLOWED_ORIGINS` sadece güvenilen originleri içermeli.
- `EMLAK_SESSION_SECRET` en az 32 karakter, rastgele ve gizli olmalı.
- İlk canlı kurulumda `EMLAK_BOOTSTRAP_ADMIN_EMAIL` ve `EMLAK_BOOTSTRAP_ADMIN_PASSWORD` güçlü değerlerle set edilmeli.
- Canlı kurulum tamamlandıktan sonra varsayılan/demo kullanıcılarla giriş yapılmadığı doğrulanmalı.

Örnek secret üretimi:

```bash
openssl rand -base64 48
```

## Sunucu ve Dosya İzinleri

- Site yalnızca HTTPS üzerinden yayınlanmalı; HTTP istekleri HTTPS'e yönlendirilmeli.
- Firewall üzerinde sadece gerekli portlar açık kalmalı: genelde `80`, `443` ve kısıtlı `22`.
- `EMLAK_DB_PATH` ve `EMLAK_UPLOAD_DIR` klasörleri sadece uygulama kullanıcısı tarafından yazılabilir olmalı.
- SQLite dosyası ve upload klasörü web root içinde doğrudan servis edilmemeli; uygulama endpointleri üzerinden erişilmeli.
- Düzenli, şifreli DB ve upload yedeği alınmalı.

## Panel ve API

- Panel kullanıcıları kişiye özel açılmalı; ortak admin hesabı kullanılmamalı.
- Eski `admin@admin / admin` girişinin canlıda çalışmadığı test edilmeli.
- `/yonetim-ofisi`, `/panel`, `/yetkili-giris` sayfalarının indekslenmediği doğrulanmalı.
- Public formlarda bot/spam görülürse rate-limit'e ek olarak Turnstile veya reCAPTCHA eklenmeli.

## Yayın Sonrası Kontrol

- `npm run build` canlı ortam değişkenleriyle başarılı olmalı.
- Security header kontrolü için canlı domain üzerinde tarama yapılmalı.
- `robots.txt` ve `sitemap.xml` canlı domainde doğru domainle açılmalı.
- Hatalar için process manager logları düzenli izlenmeli.
