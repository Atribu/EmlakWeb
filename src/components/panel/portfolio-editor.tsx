"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PortfolioFilterToolbar } from "@/components/panel/portfolio-filter-toolbar";
import { PropertyDescriptionFields } from "@/components/panel/property-description-fields";
import { PropertyOperationalFields } from "@/components/panel/property-operational-fields";
import {
  AdvisorFieldIcon,
  AreaFieldIcon,
  CurrencyFieldIcon,
  FloorFieldIcon,
  HeatingFieldIcon,
  LocationFieldIcon,
  PaletteFieldIcon,
  PriceFieldIcon,
  PropertyFieldShell,
  RoomFieldIcon,
  TypeFieldIcon,
} from "@/components/panel/property-field-shell";
import { PropertyInfoFields } from "@/components/panel/property-info-fields";
import { formatDateTimeTR, formatPrice } from "@/lib/format";
import {
  buildPanelCompanyOptions,
  buildPanelCountryOptions,
  defaultPropertyPanelFilters,
  filterPanelProperties,
  type PropertyPanelFilterState,
} from "@/lib/panel-property-filters";
import { exportPropertiesToCsv } from "@/lib/property-export";
import { propertyDisplayAmount, propertyDisplayCurrency } from "@/lib/property-pricing";
import {
  PROPERTY_COUNTRY_OPTIONS,
  PROPERTY_HEATING_OPTIONS,
  PROPERTY_PRICE_CURRENCY_OPTIONS,
  normalizePropertyPublicationStatus,
  PROPERTY_ROOM_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/property-panel-options";
import {
  propertyActivityActionBadgeClass,
  propertyActivityActionLabel,
  propertyActivityActorRoleLabel,
} from "@/lib/property-activity";
import { summarizePropertyQuality } from "@/lib/property-quality";
import {
  MAX_GALLERY_IMAGE_COUNT,
  MAX_PORTFOLIO_REQUEST_MB,
  MAX_WEBP_UPLOAD_MB,
  getFilesFromFormData,
  validatePortfolioImageFile,
  validateTotalUploadSize,
} from "@/lib/portfolio-images";
import type { Advisor, Property, PropertyActivityLog, UserRole } from "@/lib/types";

type PortfolioEditorProps = {
  initialProperties: Property[];
  advisors: Advisor[];
  currentUserRole: UserRole;
  initialSelectedSlug?: string;
  recentActivityLogs: PropertyActivityLog[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const typeOptions = [...PROPERTY_TYPE_OPTIONS];
const coverOptions = [
  { label: "Turkuaz", value: "linear-gradient(120deg, #0f766e, #2dd4bf)" },
  { label: "Mavi", value: "linear-gradient(120deg, #1d4ed8, #60a5fa)" },
  { label: "Turuncu", value: "linear-gradient(120deg, #7c2d12, #fb923c)" },
  { label: "Mor", value: "linear-gradient(120deg, #7e22ce, #c084fc)" },
  { label: "Yeşil", value: "linear-gradient(120deg, #166534, #4ade80)" },
];

function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function syncFileInput(input: HTMLInputElement | null, files: File[]) {
  if (!input) {
    return;
  }

  const dataTransfer = new DataTransfer();
  files.forEach((file) => dataTransfer.items.add(file));
  input.files = dataTransfer.files;
}

export function PortfolioEditor({
  initialProperties,
  advisors,
  currentUserRole,
  initialSelectedSlug,
  recentActivityLogs,
}: PortfolioEditorProps) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const lastSyncedSelectedSlugRef = useRef(initialSelectedSlug ?? "");
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selectedSlug, setSelectedSlug] = useState<string>(() => {
    if (initialSelectedSlug && initialProperties.some((property) => property.slug === initialSelectedSlug)) {
      return initialSelectedSlug;
    }

    return initialProperties[0]?.slug ?? "";
  });
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [coverFileName, setCoverFileName] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [removedGalleryImages, setRemovedGalleryImages] = useState<string[]>([]);
  const [filters, setFilters] = useState<PropertyPanelFilterState>(defaultPropertyPanelFilters);
  const [duplicateRoomSelections, setDuplicateRoomSelections] = useState<string[]>([]);
  const [duplicateStatus, setDuplicateStatus] = useState<{ type: "idle" | "loading" | "error" | "success"; message?: string }>({
    type: "idle",
  });

  const developerCompanyOptions = useMemo(() => buildPanelCompanyOptions(properties), [properties]);
  const countryOptions = useMemo(() => buildPanelCountryOptions(properties), [properties]);

  const filteredProperties = useMemo(() => {
    return filterPanelProperties(properties, filters);
  }, [filters, properties]);

  const selectedProperty = useMemo(
    () => properties.find((property) => property.slug === selectedSlug),
    [properties, selectedSlug],
  );
  const selectedPropertyQuality = useMemo(
    () => (selectedProperty ? summarizePropertyQuality(selectedProperty) : null),
    [selectedProperty],
  );
  const selectedPropertyActivityLogs = useMemo(
    () => recentActivityLogs.filter((activity) => activity.propertySlug === selectedSlug).slice(0, 8),
    [recentActivityLogs, selectedSlug],
  );

  const optionProperties = useMemo(() => {
    if (filteredProperties.length > 0) {
      return filteredProperties;
    }

    return selectedProperty ? [selectedProperty] : [];
  }, [filteredProperties, selectedProperty]);

  const availableCoverOptions = useMemo(() => {
    if (!selectedProperty) {
      return coverOptions;
    }

    const hasCurrent = coverOptions.some((item) => item.value === selectedProperty.coverColor);

    if (hasCurrent) {
      return coverOptions;
    }

    return [{ label: "Mevcut Renk", value: selectedProperty.coverColor }, ...coverOptions];
  }, [selectedProperty]);

  useEffect(() => {
    setProperties(initialProperties);
  }, [initialProperties]);

  useEffect(() => {
    setStatus({ type: "idle" });
    setCoverFileName("");
    setGalleryFiles([]);
    setRemovedGalleryImages([]);
    syncFileInput(galleryInputRef.current, []);
  }, [selectedSlug]);

  useEffect(() => {
    setDuplicateRoomSelections([]);
    setDuplicateStatus({ type: "idle" });
  }, [selectedSlug]);

  useEffect(() => {
    if (!initialSelectedSlug || lastSyncedSelectedSlugRef.current === initialSelectedSlug) {
      return;
    }

    if (!properties.some((property) => property.slug === initialSelectedSlug)) {
      return;
    }

    lastSyncedSelectedSlugRef.current = initialSelectedSlug;
    setSelectedSlug(initialSelectedSlug);
  }, [initialSelectedSlug, properties]);

  useEffect(() => {
    if (filteredProperties.length === 0) {
      return;
    }

    if (!filteredProperties.some((property) => property.slug === selectedSlug)) {
      setSelectedSlug(filteredProperties[0]?.slug ?? "");
    }
  }, [filteredProperties, selectedSlug]);

  function handleExportFiltered() {
    exportPropertiesToCsv(filteredProperties, advisors, {
      fileLabel: "portfoy-duzenleme-listesi",
    });
  }

  function handleGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    setGalleryFiles(Array.from(event.currentTarget.files ?? []));
  }

  function removeSelectedGalleryFile(index: number) {
    const nextFiles = galleryFiles.filter((_, fileIndex) => fileIndex !== index);
    setGalleryFiles(nextFiles);
    syncFileInput(galleryInputRef.current, nextFiles);
  }

  function toggleExistingGalleryImage(image: string) {
    setRemovedGalleryImages((current) =>
      current.includes(image) ? current.filter((item) => item !== image) : [...current, image],
    );
  }

  function toggleDuplicateRoom(room: string) {
    setDuplicateRoomSelections((current) =>
      current.includes(room) ? current.filter((item) => item !== room) : [...current, room],
    );
  }

  async function handleDuplicateSelection() {
    if (!selectedProperty) {
      return;
    }

    setDuplicateStatus({ type: "loading" });

    try {
      const response = await fetch(`/api/properties/${selectedProperty.slug}/duplicate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ roomSelections: duplicateRoomSelections }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { message?: string; properties?: Property[]; count?: number }
        | null;

      if (!response.ok) {
        throw new Error(payload?.message ?? "Kopya portföy oluşturulamadı.");
      }

      const createdProperties = payload?.properties ?? [];
      if (createdProperties.length > 0) {
        setProperties((current) => [...createdProperties, ...current]);
        setSelectedSlug(createdProperties[0].slug);
      }
      setDuplicateRoomSelections([]);
      setDuplicateStatus({
        type: "success",
        message: `${payload?.count ?? createdProperties.length} adet kopya portföy oluşturuldu.`,
      });
      router.refresh();
    } catch (error) {
      setDuplicateStatus({
        type: "error",
        message: error instanceof Error ? error.message : "Kopya portföy oluşturulamadı.",
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedProperty) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    try {
      const uploadFiles: File[] = [];
      const coverFile = data.get("coverImageFile");

      if (coverFile instanceof File && coverFile.size > 0) {
        validatePortfolioImageFile(coverFile, "Kapak görseli");
        uploadFiles.push(coverFile);
      }

      const selectedGalleryFiles = getFilesFromFormData(data, "galleryImageFiles");
      selectedGalleryFiles.forEach((file, index) => {
        validatePortfolioImageFile(file, `Yeni galeri görseli ${index + 1}`);
        uploadFiles.push(file);
      });

      const keptGalleryCount =
        selectedProperty.galleryImages.filter((image) => !removedGalleryImages.includes(image)).length +
        selectedGalleryFiles.length;

      if (keptGalleryCount === 0) {
        throw new Error("Kapak hariç en az bir galeri görseli bulunmalıdır.");
      }

      if (keptGalleryCount > MAX_GALLERY_IMAGE_COUNT) {
        throw new Error(`Galeri için en fazla ${MAX_GALLERY_IMAGE_COUNT} görsel yükleyebilirsiniz.`);
      }

      if (uploadFiles.length > 0) {
        validateTotalUploadSize(uploadFiles);
      }

      const response = await fetch(`/api/properties/${selectedProperty.slug}`, {
        method: "PATCH",
        body: data,
      });

      if (!response.ok) {
        if (response.status === 413) {
          setStatus({
            type: "error",
            message: `Hatalı işlem yaptınız. Yüklenen görseller sunucu limiti için çok büyük. Toplam yüklemeyi ${MAX_PORTFOLIO_REQUEST_MB} MB altına düşürün.`,
          });
          return;
        }

        const payload = (await response.json().catch(() => null)) as { message?: string } | null;
        const detail = payload?.message ?? "Portföy güncellenemedi.";
        setStatus({
          type: "error",
          message: `Hatalı işlem yaptınız. ${detail}`,
        });
        return;
      }

      const payload = (await response.json()) as { property: Property };

      setProperties((previous) =>
        previous.map((item) => (item.slug === payload.property.slug ? payload.property : item)),
      );
      setRemovedGalleryImages([]);
      setGalleryFiles([]);
      setCoverFileName("");
      syncFileInput(galleryInputRef.current, []);
      setStatus({
        type: "success",
        message: `${payload.property.listingRef} kodlu portföy güncellendi.`,
      });

      form.reset();
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görseller işlenemedi.";
      setStatus({ type: "error", message: `Hatalı işlem yaptınız. ${message}` });
    }
  }

  if (properties.length === 0 || !selectedProperty) {
    return (
      <section className="admin-card p-6 sm:p-7">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Portföy Düzenle</h2>
        <p className="mt-2 text-sm text-slate-600">Düzenlenecek portföy bulunamadı.</p>
      </section>
    );
  }

  const visibleGalleryCount =
    selectedProperty.galleryImages.filter((image) => !removedGalleryImages.includes(image)).length + galleryFiles.length;
  const availableHeatingOptions = PROPERTY_HEATING_OPTIONS.includes(selectedProperty.heating as (typeof PROPERTY_HEATING_OPTIONS)[number])
    ? [...PROPERTY_HEATING_OPTIONS]
    : [selectedProperty.heating, ...PROPERTY_HEATING_OPTIONS];
  const availableRoomOptions = PROPERTY_ROOM_OPTIONS.includes(selectedProperty.rooms as (typeof PROPERTY_ROOM_OPTIONS)[number])
    ? [...PROPERTY_ROOM_OPTIONS]
    : [selectedProperty.rooms, ...PROPERTY_ROOM_OPTIONS];

  return (
    <section className="admin-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <span className="admin-kicker">Portföy Yönetimi</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Portföy Düzenle</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Kapak ayrı, diğer görseller tek galeri alanında yönetilir. İsterseniz mevcut görselleri tek tek kaldırıp
            yenilerini ekleyebilirsiniz.
          </p>
        </div>
        <Link href={`/ilan/${selectedProperty.slug}`} className="admin-button-secondary px-4 py-2 text-sm font-semibold">
          İlanı aç
        </Link>
      </div>

      <PortfolioFilterToolbar
        advisors={advisors}
        companyOptions={developerCompanyOptions}
        countryOptions={countryOptions}
        disableExport={filteredProperties.length === 0}
        exportButtonLabel="CSV İndir"
        filteredCount={filteredProperties.length}
        filters={filters}
        idPrefix="portfolio-editor"
        internalSearchPlaceholder="Komisyon, özel not veya iç alanlarda ara"
        onExport={handleExportFiltered}
        publicSearchPlaceholder="Başlık, kod, şehir, mahalle veya oda tipi ile ara"
        setFilters={setFilters}
        totalCount={properties.length}
      />

      <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Düzenlenecek Portföy</p>
        <select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)} className="input mt-3">
          {optionProperties.map((property) => (
            <option key={property.id} value={property.slug}>
              [{normalizePropertyPublicationStatus(property.publicationStatus)}] {property.listingRef} • {property.title} • {formatPrice(
                propertyDisplayAmount(property),
                propertyDisplayCurrency(property),
                {
                  sourceCurrency: propertyDisplayCurrency(property),
                },
              )}{property.developerCompany ? ` • ${property.developerCompany}` : ""}
            </option>
          ))}
        </select>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <p>
            {filteredProperties.length > 0
              ? `${filteredProperties.length} portföy filtreye uygun bulundu.`
              : "Filtreye uyan portföy bulunamadı; mevcut seçim korunuyor."}
          </p>
        </div>
        <p className="mt-2 text-xs text-slate-500">
          Filtreler değiştikçe bu seçim listesi anlık olarak daralır; doğru portföye birkaç adımda ulaşabilirsiniz.
        </p>
      </div>

      {selectedPropertyQuality ? (
        <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kalite Kontrol</p>
              <h3 className="mt-2 text-lg font-semibold text-slate-900">Yayın öncesi hazır olma durumu</h3>
              <p className="mt-1 text-sm text-slate-600">
                Kritik alanlar tamamlandığında kayıt onaya daha hızlı alınır. Ek içerik uyarıları ise ilanı daha güçlü hale getirir.
              </p>
            </div>
            <span
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                selectedPropertyQuality.criticalIssues.length > 0
                  ? "border border-rose-200 bg-rose-50 text-rose-700"
                  : selectedPropertyQuality.advisoryIssues.length > 0
                    ? "border border-amber-200 bg-amber-50 text-amber-700"
                    : "border border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              {selectedPropertyQuality.criticalIssues.length > 0
                ? `${selectedPropertyQuality.criticalIssues.length} kritik eksik`
                : selectedPropertyQuality.advisoryIssues.length > 0
                  ? `${selectedPropertyQuality.advisoryIssues.length} içerik uyarısı`
                  : "Yayına hazır"}
            </span>
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">Kritik alanlar</p>
              {selectedPropertyQuality.criticalIssues.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPropertyQuality.criticalIssues.map((issue) => (
                    <span
                      key={`critical-${issue.id}`}
                      className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs text-rose-700"
                    >
                      {issue.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-emerald-700">Kritik eksik bulunmuyor.</p>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">İçerik ve zenginlik uyarıları</p>
              {selectedPropertyQuality.advisoryIssues.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedPropertyQuality.advisoryIssues.map((issue) => (
                    <span
                      key={`advisory-${issue.id}`}
                      className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs text-amber-700"
                    >
                      {issue.label}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-emerald-700">Ek içerik uyarısı bulunmuyor.</p>
              )}
            </article>
          </div>
        </section>
      ) : null}

      <section className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Aktivite Geçmişi</p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">Seçili portföyün son hareketleri</h3>
            <p className="mt-1 text-sm text-slate-600">
              Bu blokta seçili ilana ait son düzenleme, durum değişimi, danışman ataması ve kopyalama kayıtlarını görürsünüz.
            </p>
          </div>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
            {selectedPropertyActivityLogs.length} kayıt
          </span>
        </div>

        {selectedPropertyActivityLogs.length > 0 ? (
          <div className="mt-4 space-y-3">
            {selectedPropertyActivityLogs.map((activity) => (
              <article key={activity.id} className="rounded-2xl border border-slate-200 bg-white px-4 py-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${propertyActivityActionBadgeClass(
                          activity.actionType,
                        )}`}
                      >
                        {propertyActivityActionLabel(activity.actionType)}
                      </span>
                      <span className="text-xs text-slate-500">{formatDateTimeTR(activity.createdAt)}</span>
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-900">{activity.summary}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.actorName} • {propertyActivityActorRoleLabel(activity.actorRole)}
                    </p>
                    {activity.details.length > 0 ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {activity.details.slice(0, 4).map((detail) => (
                          <span
                            key={`${activity.id}-${detail}`}
                            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600"
                          >
                            {detail}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-4 text-sm text-slate-500">
            Bu portföy için henüz kaydedilmiş bir hareket bulunmuyor.
          </p>
        )}
      </section>

      <div id="kopyala-varyantlari" className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Kopyala</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">Bu portföyden oda varyantı üretin</h3>
          <p className="mt-1 text-sm text-slate-600">
            Aynı proje veya firma için mevcut ilanı baz alıp farklı oda tiplerinde yeni kopyalar oluşturabilirsiniz.
          </p>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-4">
          {PROPERTY_ROOM_OPTIONS.map((room) => {
            const isActive = duplicateRoomSelections.includes(room);
            const isCurrentRoom = room === selectedProperty.rooms;

            return (
              <button
                key={room}
                type="button"
                onClick={() => toggleDuplicateRoom(room)}
                className={`rounded-xl border px-3 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                } ${isCurrentRoom ? "ring-1 ring-amber-300" : ""}`}
              >
                {room}
                {isCurrentRoom ? <span className="ml-2 text-[11px] uppercase tracking-[0.14em]">mevcut</span> : null}
              </button>
            );
          })}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={duplicateStatus.type === "loading"}
            onClick={handleDuplicateSelection}
            className="admin-button-primary cursor-pointer px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60"
          >
            {duplicateStatus.type === "loading" ? "Kopyalanıyor..." : "Seçilen Oda Tiplerini Kopyala"}
          </button>
          <p className="text-xs text-slate-500">
            Mevcut oda tipi seçiliyse sistem onu tekrar üretmez, sadece farklı varyantları oluşturur.
          </p>
        </div>

        {duplicateStatus.type === "error" ? <p className="mt-3 text-sm text-rose-700">{duplicateStatus.message}</p> : null}
        {duplicateStatus.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{duplicateStatus.message}</p> : null}
      </div>

      <form
        key={`${selectedProperty.slug}-${selectedProperty.title}-${selectedProperty.coverImage}-${selectedProperty.galleryImages.length}`}
        onSubmit={handleSubmit}
        className="mt-5 grid gap-3 md:grid-cols-2"
      >
        <PropertyDescriptionFields
          defaultTitle={selectedProperty.title}
          defaultDescription={selectedProperty.description}
          defaultTranslations={selectedProperty.translations}
        />

        <PropertyFieldShell label="Ülke" icon={<LocationFieldIcon />}>
          <>
            <input
              required
              name="country"
              list="portfolio-editor-country-options"
              defaultValue={selectedProperty.country ?? "Türkiye"}
              placeholder="Ülke"
              className="input"
            />
            <datalist id="portfolio-editor-country-options">
              {PROPERTY_COUNTRY_OPTIONS.map((option) => (
                <option key={option} value={option} />
              ))}
            </datalist>
          </>
        </PropertyFieldShell>

        <PropertyFieldShell label="Şehir" icon={<LocationFieldIcon />}>
          <input required name="city" defaultValue={selectedProperty.city} placeholder="Şehir" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="İlçe" icon={<LocationFieldIcon />}>
          <input required name="district" defaultValue={selectedProperty.district} placeholder="İlçe" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Mahalle" icon={<LocationFieldIcon />}>
          <input
            required
            name="neighborhood"
            defaultValue={selectedProperty.neighborhood}
            placeholder="Mahalle"
            className="input"
          />
        </PropertyFieldShell>

        <PropertyFieldShell label="Portföy Tipi" icon={<TypeFieldIcon />}>
          <select required name="type" defaultValue={selectedProperty.type} className="input">
            {typeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <div className="grid gap-3 md:col-span-2 sm:grid-cols-[minmax(0,1fr)_180px]">
          <PropertyFieldShell
            label="Fiyat"
            icon={<PriceFieldIcon />}
            hint="Tutarı seçtiğiniz para biriminde düzenleyin."
          >
            <input
              required
              name="price"
              type="number"
              min={1000}
              defaultValue={selectedProperty.priceSourceAmount ?? selectedProperty.price}
              placeholder="Fiyat"
              className="input"
            />
          </PropertyFieldShell>

          <PropertyFieldShell label="Para Birimi" icon={<CurrencyFieldIcon />}>
            <select
              name="priceCurrency"
              defaultValue={selectedProperty.priceCurrency ?? "TRY"}
              className="input"
            >
              {PROPERTY_PRICE_CURRENCY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.symbol} {option.code}
                </option>
              ))}
            </select>
          </PropertyFieldShell>
        </div>

        <PropertyFieldShell label="Oda Sayısı" icon={<RoomFieldIcon />}>
          <select required name="rooms" defaultValue={selectedProperty.rooms} className="input">
            {availableRoomOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <PropertyFieldShell label="Metrekare" icon={<AreaFieldIcon />}>
          <input
            required
            name="areaM2"
            type="number"
            min={20}
            step="0.01"
            inputMode="decimal"
            defaultValue={selectedProperty.areaM2}
            placeholder="m²"
            className="input"
          />
        </PropertyFieldShell>

        <PropertyFieldShell label="Kat Bilgisi" icon={<FloorFieldIcon />} hint="Opsiyonel">
          <input name="floor" defaultValue={selectedProperty.floor} placeholder="Kat bilgisi (opsiyonel)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Isıtma" icon={<HeatingFieldIcon />}>
          <select required name="heating" defaultValue={selectedProperty.heating} className="input">
            {availableHeatingOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <PropertyFieldShell label="Enlem" icon={<LocationFieldIcon />} hint="Opsiyonel">
          <input
            name="latitude"
            type="number"
            step="any"
            defaultValue={selectedProperty.latitude}
            placeholder="Enlem"
            className="input"
          />
        </PropertyFieldShell>

        <PropertyFieldShell label="Boylam" icon={<LocationFieldIcon />} hint="Opsiyonel">
          <input
            name="longitude"
            type="number"
            step="any"
            defaultValue={selectedProperty.longitude}
            placeholder="Boylam"
            className="input"
          />
        </PropertyFieldShell>

        <PropertyFieldShell label="Danışman" icon={<AdvisorFieldIcon />} className="md:col-span-2">
          <select name="advisorId" defaultValue={selectedProperty.advisorId} className="input">
            <option value="">Danışman yok</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name} - {advisor.focusArea}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <PropertyFieldShell label="Vurgu Rengi" icon={<PaletteFieldIcon />} className="md:col-span-2">
          <select required name="coverColor" defaultValue={selectedProperty.coverColor} className="input">
            {availableCoverOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Vurgu Rengi: {option.label}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Kapak Görselini Değiştir
          </span>
          <input
            type="file"
            accept="image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png"
            name="coverImageFile"
            className="input"
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              setCoverFileName(file?.name ?? "");
            }}
          />
          <p className="mt-2 text-xs text-slate-500">
            {coverFileName ? `Yeni kapak: ${coverFileName}` : "Yeni dosya seçmezseniz mevcut kapak korunur."}
          </p>
        </label>

        <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${selectedProperty.coverImage})` }} />
          <p className="px-3 py-2 text-xs text-slate-600">Mevcut kapak görseli</p>
        </div>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Galeriye Yeni Görseller Ekle
          </span>
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/webp,image/jpeg,image/png,.webp,.jpg,.jpeg,.png"
            name="galleryImageFiles"
            multiple
            className="input"
            onChange={handleGalleryChange}
          />
        </label>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Galeri yönetimi</p>
              <p className="text-xs text-slate-500">
                İstemediğiniz mevcut görselleri kaldırabilir, yeni görselleri tek seferde ekleyebilirsiniz.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {visibleGalleryCount} / {MAX_GALLERY_IMAGE_COUNT} görsel
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {selectedProperty.galleryImages.map((image, index) => {
              const isRemoved = removedGalleryImages.includes(image);

              return (
                <article
                  key={`${image}-${index}`}
                  className={`overflow-hidden rounded-2xl border ${
                    isRemoved ? "border-rose-200 bg-rose-50/60" : "border-slate-200 bg-white"
                  }`}
                >
                  <div
                    className={`h-32 bg-cover bg-center ${isRemoved ? "opacity-40 grayscale" : ""}`}
                    style={{ backgroundImage: `url(${image})` }}
                  />
                  <div className="space-y-2 px-3 py-3">
                    <p className="text-sm font-medium text-slate-900">
                      {selectedProperty.imageLabels[index] ?? `Görsel ${index + 1}`}
                    </p>
                    <button
                      type="button"
                      onClick={() => toggleExistingGalleryImage(image)}
                      className={`cursor-pointer rounded-full px-3 py-1 text-xs font-semibold transition ${
                        isRemoved
                          ? "border border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          : "border border-rose-200 text-rose-700 hover:bg-rose-50"
                      }`}
                    >
                      {isRemoved ? "Geri al" : "Galeriden kaldır"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {removedGalleryImages.map((image) => (
            <input key={image} type="hidden" name="removeGalleryImages" value={image} />
          ))}

          <div className="mt-4">
            <p className="text-sm font-semibold text-slate-900">Yeni seçilen görseller</p>
            {galleryFiles.length > 0 ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {galleryFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${file.size}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSelectedGalleryFile(index)}
                      className="cursor-pointer rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                    >
                      Kaldır
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Henüz yeni galeri görseli seçilmedi.</p>
            )}
          </div>
        </div>

        <p className="md:col-span-2 text-xs text-slate-500">
          Sistem jpg, jpeg, png ve webp dosyalarını kabul eder; yükleme sırasında otomatik optimize eder. Dosya başına
          en fazla {MAX_WEBP_UPLOAD_MB} MB, toplam yükleme en fazla {MAX_PORTFOLIO_REQUEST_MB} MB.
        </p>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Öne Çıkanlar
          </span>
          <input
            name="highlights"
            defaultValue={selectedProperty.highlights.join(", ")}
            placeholder="Örn. Deniz manzarası, Vatandaşlığa uygun, Yatırıma hazır"
            className="input"
          />
          <p className="mt-2 text-xs text-slate-500">Virgülle ayırarak kısa vurgu maddeleri ekleyin.</p>
        </label>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Özellikler
          </span>
          <input
            name="features"
            defaultValue={selectedProperty.features.join(", ")}
            placeholder="Örn. Açık mutfak, Yerden ısıtma, Akıllı ev sistemi"
            className="input"
          />
          <p className="mt-2 text-xs text-slate-500">Virgülle ayırarak teknik veya sosyal özellikleri girin.</p>
        </label>

        <PropertyInfoFields defaultItems={selectedProperty.infoItems} />
        <PropertyOperationalFields
          currentUserRole={currentUserRole}
          defaults={selectedProperty}
          allowPublicationControl={currentUserRole === "portal_admin" || currentUserRole === "admin"}
        />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="admin-button-primary cursor-pointer px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {status.type === "loading" ? "Güncelleniyor..." : "Portföyü Güncelle"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}
    </section>
  );
}
