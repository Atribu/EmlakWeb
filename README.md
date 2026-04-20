# PortföySatış

Satış odaklı emlak sitesi için hazırlanmış Next.js uygulaması.

## Kapsam

- İlan listeleme ve filtreleme
- İlan detay sayfası
- WhatsApp ve telefonla hızlı iletişim
- İlan iletişim formu (mail entegrasyonlu)
- Rol bazlı demo giriş (`admin`, `advisor`, `editor`)
- Admin panelinde portföy yükleme
- Portföy yüklerken hazır danışman listesinden manuel danışman seçimi

## Teknoloji

- Next.js (App Router)
- React
- Tailwind CSS v4
- TypeScript
- SQLite (`better-sqlite3`)

## Çalıştırma

```bash
npm install
npm run dev
```

## Demo Hesaplar

- Admin: `admin@admin / admin`
- Danışman: `ayse / ayse123`
- İçerik yükleyici: `icerik / icerik123`

## Kalıcı Veri Yapısı

Panelden girilen portföy, blog, danışman, kullanıcı ve lead kayıtları SQLite içine yazılır.
Panelden yüklenen görseller de kalıcı upload klasörüne kaydedilir.

Local varsayılan yollar:

```bash
DB:      .demo-data/emlak.db
Uploads: .demo-data/uploads
```

Canlı sunucuda kullanacağımız yollar:

```bash
EMLAK_DB_PATH=/home/dgtl/EmlakWeb/.demo-data/emlak.db
EMLAK_UPLOAD_DIR=/home/dgtl/EmlakWeb/.demo-data/uploads
```

Deploy işlemi `/home/dgtl/EmlakWeb/.demo-data` klasörünü silmezse panelden girilen veriler ve görseller korunur.

## Mail Akışı

Form gönderimleri her zaman demo store'a kaydedilir. Aşağıdaki ortam değişkenleri varsa ayrıca Resend ile e-posta gönderilir:

```bash
RESEND_API_KEY=...
CONTACT_TO_EMAIL=...
CONTACT_FROM_EMAIL="Emlak Demo <onboarding@resend.dev>"
```

Env yoksa sistem demo modunda çalışır ve form yanıtı buna göre bilgi verir.

## Not

`.demo-data/` repoya dahil edilmez. Canlı sunucuda bu klasör kalıcı veri alanı olarak korunmalıdır.
