import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { AppointmentForm } from "@/components/appointment-form";
import { ContactForm } from "@/components/contact-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getAdvisorById, getPropertyBySlug } from "@/lib/data-store";
import { formatPhoneForHref, formatPrice } from "@/lib/format";
import { getProjectMeta } from "@/lib/project-meta";
import { listingMetadata, propertySchema } from "@/lib/seo";

type PropertyDetailProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PropertyDetailProps): Promise<Metadata> {
  const resolvedParams = await params;
  const property = getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    return { title: "İlan Bulunamadı | PortföySatış" };
  }

  return listingMetadata(property);
}

export default async function PropertyDetailPage({ params }: PropertyDetailProps) {
  const [resolvedParams, currentUser] = await Promise.all([params, getCurrentUser()]);

  const property = getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

  const advisor = getAdvisorById(property.advisorId);
  const projectMeta = getProjectMeta(property);
  const listingSchema = propertySchema(property);

  const phoneHref = advisor ? `tel:${formatPhoneForHref(advisor.phone)}` : null;
  const whatsappHref = advisor
    ? `https://wa.me/${formatPhoneForHref(advisor.whatsapp)}?text=${encodeURIComponent(
        `${property.title} (${property.listingRef}) için bilgi almak istiyorum.`,
      )}`
    : null;

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 sm:px-6">
        <Link href="/" className="text-sm font-semibold text-[#6f6558] transition hover:text-[#2a241c]">
          ← İlan listesine dön
        </Link>

        <section className="luxury-card mt-4 overflow-hidden">
          <div className="relative h-[320px] sm:h-[430px]">
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${property.coverImage})` }} />
            <div className="absolute inset-0 bg-gradient-to-t from-[#18120c]/85 via-[#18120c]/25 to-[#18120c]/18" />

            <div className="absolute bottom-0 left-0 right-0 p-5 text-white sm:p-8">
              <span className="section-kicker border-white/35 bg-white/15 text-[#ecd8b6]">{property.listingRef}</span>
              <h1 className="mt-3 max-w-3xl text-[2.4rem] leading-[1.02] font-semibold sm:text-[3.2rem]">{property.title}</h1>
              <p className="mt-2 text-sm text-[#e7dcc9]">
                {property.city} / {property.district} / {property.neighborhood}
              </p>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Fiyat" value={formatPrice(property.price)} highlight />
                <DetailItem label="Tip" value={property.type} />
                <DetailItem label="Oda" value={property.rooms} />
                <DetailItem label="Brüt m²" value={String(property.areaM2)} />
                <DetailItem label="Kat" value={property.floor} />
                <DetailItem label="Isıtma" value={property.heating} />
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <DetailItem label="Lansman" value={projectMeta.launchType} compact />
                <DetailItem label="Ödeme Planı" value={projectMeta.paymentPlan} compact />
                <DetailItem label="Teslim" value={projectMeta.deliveryDate} compact />
              </div>

              <p className="mt-6 text-sm leading-7 text-[#5f5649]">{property.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoList title="Öne Çıkanlar" items={property.highlights} />
                <InfoList title="Özellikler" items={property.features} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {property.galleryImages.map((image, index) => (
                  <article key={image} className="overflow-hidden rounded-xl border border-[#ddd0bd] bg-[#fbf8f3]">
                    <div className="h-32 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
                    <p className="px-3 py-2 text-xs font-medium text-[#6b6051]">
                      {property.imageLabels[index] ?? `Görsel ${index + 1}`}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {advisor ? (
                <aside className="rounded-2xl border border-[#dccfbc] bg-[#fcf8f2] p-5">
                  <h2 className="text-[1.8rem] font-semibold leading-none text-[#251e16]">Portföy Danışmanı</h2>
                  <p className="mt-2 text-sm font-semibold text-[#3a3228]">{advisor.name}</p>
                  <p className="text-sm text-[#655b4e]">{advisor.title}</p>
                  <p className="mt-2 text-sm text-[#726758]">Uzmanlık: {advisor.focusArea}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    {phoneHref ? (
                      <a
                        href={phoneHref}
                        className="rounded-full border border-[#d0c2ad] bg-white px-4 py-2 font-semibold text-[#4d4336] transition hover:bg-[#f5ebdc]"
                      >
                        Ara
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-full border border-[#b8d9c4] bg-[#ebf8ef] px-4 py-2 font-semibold text-[#2f7d4b] transition hover:bg-[#def2e5]"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </aside>
              ) : null}

              <AppointmentForm propertySlug={property.slug} propertyTitle={property.title} />
              <ContactForm propertySlug={property.slug} propertyTitle={property.title} />
            </div>
          </div>
        </section>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
        />
      </main>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
  highlight?: boolean;
  compact?: boolean;
};

function DetailItem({ label, value, highlight = false, compact = false }: DetailItemProps) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        highlight ? "border-[#deceae] bg-[#f9f0df]" : "border-[#ddd0bd] bg-[#fffdf9]"
      }`}
    >
      <p className="text-[10px] uppercase tracking-[0.18em] text-[#9a8d78]">{label}</p>
      <p
        className={`mt-1 font-semibold ${compact ? "text-base" : "text-xl"} ${
          highlight ? "text-[#6a4f22]" : "text-[#2f271d]"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

type InfoListProps = {
  title: string;
  items: string[];
};

function InfoList({ title, items }: InfoListProps) {
  return (
    <section className="rounded-xl border border-[#ddd0bd] bg-[#fffdf9] p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#8e7f67]">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-[#5b5145]">
        {items.map((item) => (
          <li key={item} className="rounded bg-[#f7f1e6] px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
