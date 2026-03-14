# PortföySatış Demo (DB'siz MVP)

Satış odaklı emlak sitesi için hazırlanmış Next.js demo sürümü.

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

## Çalıştırma

```bash
npm install
npm run dev
```

## Demo Hesaplar

- Admin: `admin / admin123`
- Danışman: `ayse / ayse123`
- İçerik yükleyici: `icerik / icerik123`

## Mail Akışı

Form gönderimleri her zaman demo store'a kaydedilir. Aşağıdaki ortam değişkenleri varsa ayrıca Resend ile e-posta gönderilir:

```bash
RESEND_API_KEY=...
CONTACT_TO_EMAIL=...
CONTACT_FROM_EMAIL="Emlak Demo <onboarding@resend.dev>"
```

Env yoksa sistem demo modunda çalışır ve form yanıtı buna göre bilgi verir.

## Not

Bu sürümde veriler bellek içinde tutulur, sunucu yeniden başlarsa sıfırlanır. Sonraki adımda data katmanı Prisma/PostgreSQL'e taşınabilir.
