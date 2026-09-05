"use client";

import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyDescriptionFields } from "@/components/panel/property-description-fields";
import { PanelFormProgress, PanelFormStepHeader, PanelFormSummary } from "@/components/panel/panel-form-ui";
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
import {
  PROPERTY_COUNTRY_OPTIONS,
  PROPERTY_HEATING_OPTIONS,
  PROPERTY_PRICE_CURRENCY_OPTIONS,
  PROPERTY_ROOM_OPTIONS,
  PROPERTY_TYPE_OPTIONS,
} from "@/lib/property-panel-options";
import {
  MAX_GALLERY_IMAGE_COUNT,
  MAX_PORTFOLIO_REQUEST_MB,
  MAX_WEBP_UPLOAD_MB,
  getFilesFromFormData,
  validatePortfolioImageFile,
  validateTotalUploadSize,
} from "@/lib/portfolio-images";
import type { Advisor, UserRole } from "@/lib/types";

type PortfolioFormProps = {
  advisors: Advisor[];
  currentUserRole: UserRole;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; listingRef: string; slug: string; count: number };

const typeOptions = [...PROPERTY_TYPE_OPTIONS];
const coverOptions = [
  { label: "Turkuaz", value: "linear-gradient(120deg, #0f766e, #2dd4bf)" },
  { label: "Mavi", value: "linear-gradient(120deg, #1d4ed8, #60a5fa)" },
  { label: "Turuncu", value: "linear-gradient(120deg, #7c2d12, #fb923c)" },
  { label: "Mor", value: "linear-gradient(120deg, #7e22ce, #c084fc)" },
  { label: "Yeşil", value: "linear-gradient(120deg, #166534, #4ade80)" },
];

const formProgressSteps = [
  { label: "İçerik", helper: "4 dil başlık ve açıklama" },
  { label: "Temel Bilgiler", helper: "Konum, fiyat, oda" },
  { label: "Görseller", helper: "Kapak ve tek galeri" },
  { label: "Yayın", helper: "Notlar ve onay akışı" },
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

export function PortfolioForm({ advisors, currentUserRole }: PortfolioFormProps) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement | null>(null);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [coverFileName, setCoverFileName] = useState("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);

  function handleGalleryChange(event: ChangeEvent<HTMLInputElement>) {
    setGalleryFiles(Array.from(event.currentTarget.files ?? []));
  }

  function removeGalleryFile(index: number) {
    const nextFiles = galleryFiles.filter((_, fileIndex) => fileIndex !== index);
    setGalleryFiles(nextFiles);
    syncFileInput(galleryInputRef.current, nextFiles);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    try {
      const coverFile = data.get("coverImageFile");
      if (!(coverFile instanceof File) || coverFile.size === 0) {
        throw new Error("Kapak görseli yüklemek zorunludur.");
      }

      validatePortfolioImageFile(coverFile, "Kapak görseli");

      const selectedGalleryFiles = getFilesFromFormData(data, "galleryImageFiles");

      if (selectedGalleryFiles.length === 0) {
        throw new Error("Kapak hariç en az bir galeri görseli yükleyin.");
      }

      if (selectedGalleryFiles.length > MAX_GALLERY_IMAGE_COUNT) {
        throw new Error(`Galeri için en fazla ${MAX_GALLERY_IMAGE_COUNT} görsel yükleyebilirsiniz.`);
      }

      const uploadFiles = [coverFile, ...selectedGalleryFiles];
      selectedGalleryFiles.forEach((file, index) => validatePortfolioImageFile(file, `Galeri ${index + 1}`));
      validateTotalUploadSize(uploadFiles);

      const response = await fetch("/api/properties", {
        method: "POST",
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
        const detail = payload?.message ?? "Portföy kaydedilemedi.";
        setStatus({
          type: "error",
          message: `Hatalı işlem yaptınız. ${detail}`,
        });
        return;
      }

      const payload = (await response.json()) as {
        property: { listingRef: string; slug: string };
        count?: number;
      };

      setStatus({
        type: "success",
        listingRef: payload.property.listingRef,
        slug: payload.property.slug,
        count: payload.count ?? 1,
      });

      form.reset();
      setCoverFileName("");
      setGalleryFiles([]);
      syncFileInput(galleryInputRef.current, []);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Görseller işlenemedi.";
      setStatus({ type: "error", message: `Hatalı işlem yaptınız. ${message}` });
    }
  }

  return (
    <section className="admin-card p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <span className="admin-kicker">Portföy Girişi</span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-900">Yeni Portföy Yükle</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Ortak alanları tek formda doldurun; başlık ve açıklamayı tüm aktif site dillerine göre yönetin. Birden
            fazla oda tipi seçerseniz sistem aynı bilgilerle ayrı ilanlar oluşturur.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="admin-chip">4 Dil Girişi</span>
          <span className="admin-chip">Tek Galeri Akışı</span>
          <span className="admin-chip">Onay Kuyruğu</span>
        </div>
      </div>

      <div className="mt-6">
        <PanelFormProgress steps={formProgressSteps} />
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_310px]">
        <div className="grid gap-4 md:grid-cols-2">
          <PanelFormStepHeader
            step="01"
            title="İlan İçeriği"
            description="Başlık ve açıklamayı önce netleştirin; ek diller boş kalırsa Türkçe içerik yedek olarak kullanılır."
          />

          <PropertyDescriptionFields />

          <PanelFormStepHeader
            step="02"
            title="Konum ve Temel Bilgiler"
            description="Müşterinin ilk kararını etkileyen şehir, tip, fiyat, oda ve metrekare bilgilerini sade şekilde girin."
          />

          <PropertyFieldShell label="Ülke" icon={<LocationFieldIcon />}>
            <>
              <input
                required
                name="country"
                list="portfolio-country-options"
                defaultValue="Türkiye"
                placeholder="Ülke"
                className="input"
              />
              <datalist id="portfolio-country-options">
                {PROPERTY_COUNTRY_OPTIONS.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </>
          </PropertyFieldShell>

        <PropertyFieldShell label="Şehir" icon={<LocationFieldIcon />}>
          <input required name="city" placeholder="Şehir" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="İlçe" icon={<LocationFieldIcon />}>
          <input required name="district" placeholder="İlçe" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Mahalle" icon={<LocationFieldIcon />}>
          <input required name="neighborhood" placeholder="Mahalle" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Portföy Tipi" icon={<TypeFieldIcon />}>
          <select required name="type" className="input">
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
            hint="Tutarı seçtiğiniz para biriminde girin."
          >
            <input required name="price" type="number" min={1000} placeholder="Fiyat" className="input" />
          </PropertyFieldShell>

          <PropertyFieldShell label="Para Birimi" icon={<CurrencyFieldIcon />}>
            <select name="priceCurrency" defaultValue="TRY" className="input">
              {PROPERTY_PRICE_CURRENCY_OPTIONS.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.symbol} {option.code}
                </option>
              ))}
            </select>
          </PropertyFieldShell>
        </div>

        <PropertyFieldShell label="Metrekare" icon={<AreaFieldIcon />}>
          <input required name="areaM2" type="number" min={20} step="0.01" inputMode="decimal" placeholder="m²" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Kat Bilgisi" icon={<FloorFieldIcon />} className="md:col-span-2" hint="Opsiyonel">
          <input name="floor" placeholder="Kat bilgisi (opsiyonel)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Oda Sayıları" icon={<RoomFieldIcon />} className="md:col-span-2">
          <div className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 sm:grid-cols-3 xl:grid-cols-4">
            {PROPERTY_ROOM_OPTIONS.map((option) => (
              <label key={option} className="cursor-pointer">
                <input type="checkbox" name="roomSelections" value={option} className="peer sr-only" />
                <span className="flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
                  {option}
                </span>
              </label>
            ))}
          </div>
          <p className="text-xs text-slate-500">Birden fazla oda seçerseniz sistem her oda tipi için ayrı ilan oluşturur.</p>
        </PropertyFieldShell>

        <PropertyFieldShell label="Isıtma" icon={<HeatingFieldIcon />}>
          <select required name="heating" className="input">
            {PROPERTY_HEATING_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

        <PropertyFieldShell label="Enlem" icon={<LocationFieldIcon />} hint="Opsiyonel">
          <input name="latitude" type="number" step="any" placeholder="Enlem (opsiyonel)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Boylam" icon={<LocationFieldIcon />} hint="Opsiyonel">
          <input name="longitude" type="number" step="any" placeholder="Boylam (opsiyonel)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Danışman" icon={<AdvisorFieldIcon />} className="md:col-span-2">
          <select name="advisorId" defaultValue="" className="input">
            <option value="">Danışman yok</option>
            {advisors.map((advisor) => (
              <option key={advisor.id} value={advisor.id}>
                {advisor.name} - {advisor.focusArea}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

          <PropertyFieldShell label="Vurgu Rengi" icon={<PaletteFieldIcon />} className="md:col-span-2">
          <select required name="coverColor" className="input">
            {coverOptions.map((option) => (
              <option key={option.value} value={option.value}>
                Vurgu Rengi: {option.label}
              </option>
            ))}
          </select>
        </PropertyFieldShell>

          <PanelFormStepHeader
            step="03"
            title="Görsel Akışı"
            description="Kapak görseli ayrı kalır; salon, oda, banyo ve balkon gibi tüm diğer görseller tek galeriden yönetilir."
          />

        <label className="admin-upload-panel md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Kapak Görseli
          </span>
          <input
            required
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
            {coverFileName ? `Seçilen dosya: ${coverFileName}` : "jpg, jpeg, png veya webp yükleyebilirsiniz."}
          </p>
        </label>

        <label className="admin-upload-panel md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Galeri Görselleri
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
              <p className="text-sm font-semibold text-slate-900">Galeri seçimi</p>
              <p className="text-xs text-slate-500">
                Kapak hariç tüm oda, salon, banyo ve balkon fotoğraflarını bu alandan ekleyin.
              </p>
            </div>
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              {galleryFiles.length} / {MAX_GALLERY_IMAGE_COUNT} görsel
            </span>
          </div>

          {galleryFiles.length > 0 ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
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
                    onClick={() => removeGalleryFile(index)}
                    className="cursor-pointer rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    Kaldır
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Henüz galeri görseli seçilmedi.</p>
          )}
        </div>

        <p className="md:col-span-2 text-xs text-slate-500">
          Sistem jpg, jpeg, png ve webp dosyalarını kabul eder; yükleme sırasında otomatik olarak optimize eder.
          Dosya başına en fazla {MAX_WEBP_UPLOAD_MB} MB, toplam yükleme en fazla {MAX_PORTFOLIO_REQUEST_MB} MB.
        </p>

          <PanelFormStepHeader
            step="04"
            title="Öne Çıkanlar ve İç Notlar"
            description="Müşteriye görünecek kısa özellikleri ve ekip/yönetici notlarını ayrı tutarak daha kontrollü bir kayıt oluşturun."
          />

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Öne Çıkanlar
          </span>
          <input
            name="highlights"
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
            placeholder="Örn. Açık mutfak, Yerden ısıtma, Akıllı ev sistemi"
            className="input"
          />
          <p className="mt-2 text-xs text-slate-500">Virgülle ayırarak teknik veya sosyal özellikleri girin.</p>
        </label>

        <PropertyInfoFields />
        <PropertyOperationalFields currentUserRole={currentUserRole} allowPublicationControl={false} />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="admin-button-primary cursor-pointer px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 md:col-span-2"
        >
          {status.type === "loading" ? "Kaydediliyor..." : "Portföyü Onay Kuyruğuna Gönder"}
        </button>
        </div>

        <PanelFormSummary
          title="Yeni portföy akışı"
          description="Bu kayıt önce onay kuyruğuna düşer. Yönetici onayından sonra yayına alınabilir."
          items={[
            { label: "Dil", value: "4 dil" },
            { label: "Yayın", value: "Onay Bekliyor", tone: "warning" },
            { label: "Görsel", value: `${galleryFiles.length} galeri` },
            { label: "Format", value: "JPG / PNG / WebP" },
          ]}
        />
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}

      {status.type === "success" ? (
        <p className="mt-3 text-sm text-emerald-700">
          {status.count > 1
            ? `${status.count} adet portföy onay kuyruğuna alındı. İlk ilan kodu: ${status.listingRef}. Yönetici onayı sonrası yayına alınabilir.`
            : `${status.listingRef} kodlu portföy onay kuyruğuna alındı. Yönetici onayı sonrası yayına alınabilir.`}
        </p>
      ) : null}
    </section>
  );
}
