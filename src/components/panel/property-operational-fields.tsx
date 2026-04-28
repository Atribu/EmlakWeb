import {
  BuildingFieldIcon,
  CurrencyFieldIcon,
  NoteFieldIcon,
  PropertyFieldShell,
  PublishFieldIcon,
  ShieldFieldIcon,
  StatusFieldIcon,
} from "@/components/panel/property-field-shell";
import {
  PROPERTY_MARKET_STATUS_OPTIONS,
  PROPERTY_PRICE_CURRENCY_OPTIONS,
  PROPERTY_PUBLICATION_STATUS_OPTIONS,
} from "@/lib/property-panel-options";
import type { Property, UserRole } from "@/lib/types";

type PropertyOperationalFieldsProps = {
  currentUserRole: UserRole;
  allowPublicationControl?: boolean;
  defaults?: Pick<
    Property,
    | "priceCurrency"
    | "priceSourceAmount"
    | "marketStatus"
    | "publicationStatus"
    | "developerCompany"
    | "staffNotes"
    | "customerFeedbackNotes"
    | "adminCommissionNotes"
    | "adminPrivateNotes"
  >;
};

function canSeeAdminFields(role: UserRole): boolean {
  return role === "portal_admin" || role === "admin";
}

export function PropertyOperationalFields({
  currentUserRole,
  allowPublicationControl = false,
  defaults,
}: PropertyOperationalFieldsProps) {
  const showAdminFields = canSeeAdminFields(currentUserRole);

  return (
    <>
      <PropertyFieldShell label="Fiyat Para Birimi" icon={<CurrencyFieldIcon />}>
        <select
          name="priceCurrency"
          defaultValue={defaults?.priceCurrency ?? "TRY"}
          className="input"
        >
          {PROPERTY_PRICE_CURRENCY_OPTIONS.map((option) => (
            <option key={option.code} value={option.code}>
              {option.label} ({option.symbol})
            </option>
          ))}
        </select>
      </PropertyFieldShell>

      <PropertyFieldShell label="Portföy Durumu" icon={<StatusFieldIcon />}>
        <select
          name="marketStatus"
          defaultValue={defaults?.marketStatus ?? "Hazır"}
          className="input"
        >
          {PROPERTY_MARKET_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </PropertyFieldShell>

      <PropertyFieldShell label="İnşaat / Firma Bilgisi" icon={<BuildingFieldIcon />} className="md:col-span-2">
        <input
          name="developerCompany"
          defaultValue={defaults?.developerCompany ?? ""}
          placeholder="Firma adı, proje bilgisi veya yetkili notu"
          className="input"
        />
      </PropertyFieldShell>

      <PropertyFieldShell label="Çalışan Notu" icon={<NoteFieldIcon />} className="md:col-span-2">
        <textarea
          name="staffNotes"
          defaultValue={defaults?.staffNotes ?? ""}
          rows={3}
          placeholder="İç kullanım için süreç notu"
          className="input"
        />
      </PropertyFieldShell>

      <PropertyFieldShell label="Müşteri Geri Dönüşleri" icon={<NoteFieldIcon />} className="md:col-span-2">
        <textarea
          name="customerFeedbackNotes"
          defaultValue={defaults?.customerFeedbackNotes ?? ""}
          rows={3}
          placeholder="Müşteri talepleri, geri bildirimler, dönüş notları"
          className="input"
        />
      </PropertyFieldShell>

      {!allowPublicationControl ? (
        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-700">
          Yeni eklenen portföyler ilk etapta <strong>pasif</strong> kaydedilir. Yönetici onayı sonrası yayına alınır.
        </div>
      ) : null}

      {showAdminFields ? (
        <section className="md:col-span-2 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 sm:p-5">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700">Yöneticiye Özel Alan</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Bu alanlar sadece yönetici için görünür</h3>
            <p className="mt-1 text-sm text-slate-700">
              Komisyon, iç pazarlık veya dışarı açılmaması gereken özel notları buraya ekleyin.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {allowPublicationControl ? (
              <PropertyFieldShell label="Yayın Durumu" icon={<PublishFieldIcon />} className="md:col-span-2">
                <select
                  name="publicationStatus"
                  defaultValue={defaults?.publicationStatus ?? "Pasif"}
                  className="input"
                >
                  {PROPERTY_PUBLICATION_STATUS_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </PropertyFieldShell>
            ) : null}

            <PropertyFieldShell label="Komisyon / İç Finans Notu" icon={<ShieldFieldIcon />} className="md:col-span-2">
              <textarea
                name="adminCommissionNotes"
                defaultValue={defaults?.adminCommissionNotes ?? ""}
                rows={3}
                placeholder="Komisyon oranı, firma payı, kapalı finans notları"
                className="input"
              />
            </PropertyFieldShell>

            <PropertyFieldShell label="Yönetici Özel Notu" icon={<ShieldFieldIcon />} className="md:col-span-2">
              <textarea
                name="adminPrivateNotes"
                defaultValue={defaults?.adminPrivateNotes ?? ""}
                rows={3}
                placeholder="Sadece yönetici tarafından görülebilecek özel not"
                className="input"
              />
            </PropertyFieldShell>
          </div>
        </section>
      ) : null}
    </>
  );
}
