import Link from "next/link";
import { notFound } from "next/navigation";

import { ContactForm } from "@/components/contact-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";
import { getAdvisorById, getPropertyBySlug } from "@/lib/data-store";
import { formatPhoneForHref, formatPrice } from "@/lib/format";

type PropertyDetailProps = {
  params: Promise<{ slug: string }>;
};

export default async function PropertyDetailPage({ params }: PropertyDetailProps) {
  const [resolvedParams, currentUser] = await Promise.all([params, getCurrentUser()]);

  const property = getPropertyBySlug(resolvedParams.slug);

  if (!property) {
    notFound();
  }

  const advisor = getAdvisorById(property.advisorId);

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
        <Link href="/" className="text-sm font-semibold text-slate-600 transition hover:text-slate-900">
          ← İlan listesine dön
        </Link>

        <section className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="p-8 text-white" style={{ background: property.coverColor }}>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] opacity-90">{property.listingRef}</p>
            <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight">{property.title}</h1>
            <p className="mt-3 text-sm opacity-90">
              {property.city} / {property.district} / {property.neighborhood}
            </p>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <div className="grid gap-3 sm:grid-cols-2">
                <DetailItem label="Fiyat" value={formatPrice(property.price)} highlight />
                <DetailItem label="Tip" value={property.type} />
                <DetailItem label="Oda" value={property.rooms} />
                <DetailItem label="Brüt m²" value={String(property.areaM2)} />
                <DetailItem label="Kat" value={property.floor} />
                <DetailItem label="Isıtma" value={property.heating} />
              </div>

              <p className="mt-6 text-sm leading-7 text-slate-700">{property.description}</p>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <InfoList title="Öne Çıkanlar" items={property.highlights} />
                <InfoList title="Özellikler" items={property.features} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {property.imageLabels.map((label) => (
                  <div
                    key={label}
                    className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Görsel Alanı</p>
                    <p className="mt-2 font-semibold text-slate-800">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {advisor ? (
                <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h2 className="text-lg font-semibold text-slate-900">Portföy Danışmanı</h2>
                  <p className="mt-2 text-sm text-slate-700">{advisor.name}</p>
                  <p className="text-sm text-slate-500">{advisor.title}</p>
                  <p className="mt-2 text-sm text-slate-600">Uzmanlık: {advisor.focusArea}</p>

                  <div className="mt-4 flex flex-wrap gap-2 text-sm">
                    {phoneHref ? (
                      <a
                        href={phoneHref}
                        className="rounded-lg border border-slate-300 px-3 py-2 text-slate-700 transition hover:bg-white"
                      >
                        Ara
                      </a>
                    ) : null}
                    {whatsappHref ? (
                      <a
                        href={whatsappHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg border border-emerald-300 bg-emerald-100 px-3 py-2 text-emerald-700 transition hover:bg-emerald-200"
                      >
                        WhatsApp
                      </a>
                    ) : null}
                  </div>
                </aside>
              ) : null}

              <ContactForm propertySlug={property.slug} propertyTitle={property.title} />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

type DetailItemProps = {
  label: string;
  value: string;
  highlight?: boolean;
};

function DetailItem({ label, value, highlight = false }: DetailItemProps) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className={`mt-2 text-lg font-semibold ${highlight ? "text-orange-800" : "text-slate-900"}`}>{value}</p>
    </div>
  );
}

type InfoListProps = {
  title: string;
  items: string[];
};

function InfoList({ title, items }: InfoListProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm text-slate-700">
        {items.map((item) => (
          <li key={item} className="rounded bg-slate-50 px-3 py-2">
            {item}
          </li>
        ))}
      </ul>
    </section>
  );
}
