import type { Metadata } from "next";
import Link from "next/link";

import { PropertyMap } from "@/components/map/property-map";
import { PropertyCard } from "@/components/property-card";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { listAdvisors, listCities, listProperties, listRoomOptions, listTypes } from "@/lib/data-store";
import { formatPrice } from "@/lib/format";
import { getProjectMeta } from "@/lib/project-meta";

export const metadata: Metadata = {
  title: "PortföySatış | Satış Odaklı Emlak İlanları",
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

type HomePageProps = {
  searchParams: SearchParams;
};

function readString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function toNumber(value: string): number | undefined {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUser()]);

  const query = readString(params.q).trim();
  const city = readString(params.city).trim();
  const type = readString(params.type).trim();
  const rooms = readString(params.rooms).trim();
  const minPriceValue = readString(params.minPrice);
  const maxPriceValue = readString(params.maxPrice);

  const properties = listProperties({
    query: query || undefined,
    city: city || undefined,
    type: type || undefined,
    rooms: rooms || undefined,
    minPrice: toNumber(minPriceValue),
    maxPrice: toNumber(maxPriceValue),
  });

  const advisors = listAdvisors();
  const advisorMap = new Map(advisors.map((advisor) => [advisor.id, advisor]));
  const mapPortfolios = properties.map((property) => ({
    id: property.id,
    slug: property.slug,
    title: property.title,
    city: property.city,
    district: property.district,
    neighborhood: property.neighborhood,
    listingRef: property.listingRef,
    price: property.price,
    latitude: property.latitude,
    longitude: property.longitude,
    advisorName: advisorMap.get(property.advisorId)?.name,
  }));

  const heroProperty = properties[0];
  const featured = properties.slice(0, 3);
  const spotlight = featured[0];
  const spotlightAside = featured.slice(1, 3);

  const heroImage = heroProperty?.coverImage ?? "/next.svg";
  const cities = listCities();
  const types = listTypes();
  const roomOptions = listRoomOptions();

  const regionCards = [
    {
      label: "Boğaz Hattı",
      text: "Üst segment konut ve rezidans portföyleri",
      image: properties[1]?.coverImage ?? heroImage,
    },
    {
      label: "Merkezi İş Alanları",
      text: "Kira getirili ofis ve ticari fırsatlar",
      image: properties[2]?.coverImage ?? heroImage,
    },
    {
      label: "Sahil ve Yatırım",
      text: "Arsa, villa ve uzun vadeli değer bölgesi",
      image: properties[3]?.coverImage ?? heroImage,
    },
  ];

  const trustStats = [
    { label: "Aktif Portföy", value: String(properties.length) },
    { label: "Ortalama Satış Süresi", value: "21 Gün" },
    { label: "Mutlu Alıcı", value: "%96" },
  ];

  const tickerItems = [
    "Ödeme Planı 60/40",
    "Dubai ve İstanbul Benchmark Tasarım",
    "Premium Portföy Vitrini",
    "Hızlı Satış Operasyonu",
    "Teslim Q4 2028",
    "VIP Portföy Turu",
  ];

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-16 pt-6 sm:px-6">
        <section className="fade-up luxury-card relative overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster={heroImage}
            className="absolute inset-0 h-full w-full object-cover"
          >
            <source src="/videos/hero-loop.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(178,137,72,0.22),transparent_42%)]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a1510]/90 via-[#1a1510]/58 to-[#1a1510]/22" />

          <div className="relative z-10 grid gap-8 px-5 py-6 sm:px-8 sm:py-10 lg:grid-cols-[1fr_360px] lg:items-end">
            <div className="max-w-2xl text-white">
              <span className="section-kicker border-white/35 bg-white/10 text-[#f0dec0]">Curated Collection</span>
              <h1 className="mt-4 text-[2.2rem] leading-[1.04] font-semibold sm:text-[3.6rem]">
                İstanbul&apos;un değerli lokasyonlarında seçili satış portföyleri
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-7 text-[#ebe2d5] sm:text-base">
                Prestijli yaşam ve doğru yatırım hedefleyen alıcılar için uzman ekip tarafından doğrulanmış ilanlar.
              </p>

              <div className="mt-6 flex flex-wrap gap-2 text-sm">
                {heroProperty ? (
                  <Link
                    href={`/ilan/${heroProperty.slug}`}
                    className="rounded-full bg-white px-4 py-2 font-semibold text-[#2b2217] transition hover:bg-[#f4e7d4]"
                  >
                    Öne Çıkan İlanı İncele • {formatPrice(heroProperty.price)}
                  </Link>
                ) : null}
                <a
                  href="#ilanlar"
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-2 font-semibold text-white backdrop-blur transition hover:bg-white/18"
                >
                  Tüm Portföyler
                </a>
              </div>

              <div className="mt-6 grid gap-2 sm:grid-cols-3">
                {trustStats.map((item, index) => (
                  <article
                    key={item.label}
                    className={`rounded-xl border border-white/20 bg-white/10 px-3 py-2 backdrop-blur fade-up ${index === 0 ? "stagger-1" : index === 1 ? "stagger-2" : "stagger-3"}`}
                  >
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#ead9bf]">{item.label}</p>
                    <p className="mt-1 text-lg font-semibold text-white">{item.value}</p>
                  </article>
                ))}
              </div>
            </div>

            <div id="iletisim" className="rounded-2xl border border-white/28 bg-[#fffdf9]/92 p-4 backdrop-blur">
              <h2 className="text-[1.55rem] font-semibold tracking-tight text-[#241d14]">Premium Portföy Arama</h2>
              <p className="mt-1 text-xs text-[#6f665a]">Kriterlerini seç, uygun ilanları anında gör.</p>

              <form className="mt-4 grid gap-2" method="GET">
                <input name="q" defaultValue={query} placeholder="İlan, bölge veya kod" className="input" />

                <div className="grid grid-cols-2 gap-2">
                  <select name="city" defaultValue={city} className="input">
                    <option value="">Şehir</option>
                    {cities.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <select name="type" defaultValue={type} className="input">
                    <option value="">Tip</option>
                    {types.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <select name="rooms" defaultValue={rooms} className="input">
                    <option value="">Oda</option>
                    {roomOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>

                  <input name="minPrice" defaultValue={minPriceValue} type="number" min={0} placeholder="Min fiyat" className="input" />
                </div>

                <input name="maxPrice" defaultValue={maxPriceValue} type="number" min={0} placeholder="Max fiyat" className="input" />

                <button
                  type="submit"
                  className="cursor-pointer rounded-full bg-[#1f1a14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
                >
                  Uygun İlanları Listele
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="mt-4 overflow-hidden rounded-full border border-[#ddcfbc] bg-[#fbf7ef]">
          <div className="ticker-track flex w-max gap-8 px-5 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#866b42]">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span key={`${item}-${index}`}>
                {item}
              </span>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <PropertyMap portfolios={mapPortfolios} />
        </section>

        <section id="bolgeler" className="mt-8 grid gap-4 md:grid-cols-3">
          {regionCards.map((item, index) => (
            <article key={item.label} className={`luxury-card soft-raise fade-up overflow-hidden ${index === 1 ? "stagger-1" : index === 2 ? "stagger-2" : ""}`}>
              <div className="relative h-40">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${item.image})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1510]/75 via-[#1a1510]/20 to-transparent" />
                <p className="absolute bottom-3 left-3 text-sm font-semibold uppercase tracking-[0.16em] text-[#f4dfbe]">{item.label}</p>
              </div>
              <p className="px-4 py-4 text-sm text-[#645b50]">{item.text}</p>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="luxury-card overflow-hidden">
            <div className="relative h-72 sm:h-80">
              <video
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 h-full w-full object-cover"
              >
                <source src="/videos/hero-showcase.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-[#17120c]/80 via-[#17120c]/30 to-transparent" />

              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="section-kicker border-white/35 bg-white/15 text-[#f2dec0]">Video Showcase</span>
                <h2 className="mt-3 text-[2.1rem] leading-[1.02] font-semibold">
                  Proje anlatımını statik görsellerden öteye taşıyan vitrin
                </h2>
                <p className="mt-2 text-sm text-[#e9ddca]">
                  Premium emlak sitelerindeki hareketli içerik dili ile daha güçlü ilk izlenim.
                </p>
              </div>
            </div>
          </article>

          <article className="luxury-card p-5 sm:p-6">
            <span className="section-kicker">V2 Tasarım Dili</span>
            <h3 className="mt-3 text-[2rem] leading-none font-semibold text-[#201a13]">Dubai Odaklı Premium UX</h3>
            <ul className="mt-4 space-y-3 text-sm text-[#665c4f]">
              <li className="rounded-xl border border-[#e3d7c4] bg-white px-3 py-2">Cinematic hero video + üst segment tipografi</li>
              <li className="rounded-xl border border-[#e3d7c4] bg-white px-3 py-2">Ödeme planı / teslim tarihi odaklı proje dili</li>
              <li className="rounded-xl border border-[#e3d7c4] bg-white px-3 py-2">Marquee, animasyonlu geçiş ve rafine kart etkileşimleri</li>
            </ul>
            <a
              href="#ilanlar"
              className="mt-5 inline-flex rounded-full bg-[#1f1a14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black"
            >
              Portföyleri Keşfet
            </a>
          </article>
        </section>

        {spotlight ? (
          <section className="mt-8 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
            <article className="luxury-card soft-raise overflow-hidden">
              <div className="relative h-72 sm:h-80">
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${spotlight.coverImage})` }} />
                <div className="absolute inset-0 bg-gradient-to-t from-[#18130d]/80 via-[#18130d]/20 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <span className="section-kicker border-white/35 bg-white/15 text-[#f2dec0]">Editor&apos;s Pick</span>
                  <h2 className="mt-3 text-[2rem] leading-[1.05] font-semibold">{spotlight.title}</h2>
                  <p className="mt-2 text-sm text-[#e9ddca]">{spotlight.city} / {spotlight.district} / {spotlight.neighborhood}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <p className="text-2xl font-semibold text-[#f4e3c7]">{formatPrice(spotlight.price)}</p>
                    <Link
                      href={`/ilan/${spotlight.slug}`}
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#2b2217] transition hover:bg-[#f5e9d8]"
                    >
                      Portföye Git
                    </Link>
                  </div>
                </div>
              </div>
            </article>

            <div className="grid gap-4">
              {spotlightAside.map((item) => {
                const itemMeta = getProjectMeta(item);
                return (
                  <article key={item.id} className="luxury-card soft-raise grid grid-cols-[140px_1fr] gap-3 overflow-hidden">
                    <div className="h-full min-h-36 bg-cover bg-center" style={{ backgroundImage: `url(${item.coverImage})` }} />
                    <div className="p-4">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6d3d]">{item.listingRef}</p>
                      <h3 className="mt-1 text-2xl font-semibold leading-tight text-[#1f1a14]">{item.title}</h3>
                      <p className="mt-1 text-sm text-[#665d50]">{item.city} / {item.district}</p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#5f4825]">{formatPrice(item.price)}</p>
                        <Link href={`/ilan/${item.slug}`} className="text-sm font-semibold text-[#5f4825] underline underline-offset-4">
                          İncele
                        </Link>
                      </div>
                      <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#8d7c62]">
                        Ödeme: {itemMeta.paymentPlan} • Teslim: {itemMeta.deliveryDate}
                      </p>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ) : null}

        <section id="ilanlar" className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <span className="section-kicker">Satılık Portföyler</span>
              <h2 className="mt-2 text-[2.25rem] leading-none font-semibold text-[#1d1812]">Tüm İlanlar</h2>
            </div>
            <p className="text-sm text-[#74695b]">{properties.length} aktif sonuç</p>
          </div>

          {properties.length === 0 ? (
            <div className="luxury-card p-8 text-center text-sm text-[#645b50]">
              Filtreye uygun ilan bulunamadı. Arama kriterlerini genişletip tekrar deneyin.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} advisor={advisorMap.get(property.advisorId)} />
              ))}
            </div>
          )}
        </section>

        <section id="danismanlar" className="mt-10 luxury-card p-6 sm:p-7">
          <span className="section-kicker">Ekibimiz</span>
          <h2 className="mt-2 text-[2.2rem] leading-none font-semibold text-[#1c1712]">Satış Danışmanlarımız</h2>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {advisors.map((advisor) => (
              <article key={advisor.id} className="rounded-2xl border border-[#ddcfbd] bg-white p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8d7143]">Portföy Danışmanı</p>
                <h3 className="mt-1 text-[1.7rem] font-semibold leading-none text-[#1f1a14]">{advisor.name}</h3>
                <p className="mt-1 text-sm text-[#62594d]">{advisor.title}</p>
                <p className="mt-2 text-sm text-[#7a6e5e]">Uzmanlık: {advisor.focusArea}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Yatırım Danışmanlığı",
              desc: "Lokasyon, kira getirisi ve çıkış senaryolarına göre uçtan uca yönlendirme.",
            },
            {
              title: "VIP Portföy Turu",
              desc: "Kişiselleştirilmiş portföy shortlist ve aynı gün saha turu planlaması.",
            },
            {
              title: "Hızlı Satış Operasyonu",
              desc: "Doğru fiyatlama, görünürlük ve müzakere yönetimi ile daha hızlı kapanış.",
            },
          ].map((service, index) => (
            <article
              key={service.title}
              className={`luxury-card soft-raise p-5 fade-up ${
                index === 1 ? "stagger-1" : index === 2 ? "stagger-2" : ""
              }`}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8a6f45]">Hizmet</p>
              <h3 className="mt-2 text-[1.85rem] leading-none font-semibold text-[#201a13]">{service.title}</h3>
              <p className="mt-2 text-sm text-[#655c4f]">{service.desc}</p>
            </article>
          ))}
        </section>

        <footer className="mt-10 flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#dccfbc] bg-[#fcf8f2] px-5 py-4 text-sm text-[#675c4e] sm:flex-row sm:items-center">
          <p>PortföySatış V2 • Premium vitrin deneyimi</p>
          <Link
            href="/yetkili-giris"
            className="rounded-full border border-[#cfbd9f] px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#6f5b3c] transition hover:bg-[#f0e4d2]"
          >
            Yetkili Girişi
          </Link>
        </footer>
      </main>
    </div>
  );
}
