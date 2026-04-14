"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyDescriptionFields } from "@/components/panel/property-description-fields";
import {
  AdvisorFieldIcon,
  AreaFieldIcon,
  FloorFieldIcon,
  HeatingFieldIcon,
  LocationFieldIcon,
  PaletteFieldIcon,
  PriceFieldIcon,
  PropertyFieldShell,
  RoomFieldIcon,
  TitleFieldIcon,
  TypeFieldIcon,
} from "@/components/panel/property-field-shell";
import { PropertyInfoFields } from "@/components/panel/property-info-fields";
import {
  MAX_GALLERY_IMAGE_COUNT,
  MAX_PORTFOLIO_REQUEST_MB,
  MAX_WEBP_UPLOAD_MB,
  getFilesFromFormData,
  validatePortfolioImageFile,
  validateTotalUploadSize,
} from "@/lib/portfolio-images";
import type { Advisor } from "@/lib/types";

type PortfolioFormProps = {
  advisors: Advisor[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; listingRef: string; slug: string };

const typeOptions = ["Daire", "Villa", "Rezidans", "Arsa", "Ofis"];
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

export function PortfolioForm({ advisors }: PortfolioFormProps) {
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
      };

      setStatus({
        type: "success",
        listingRef: payload.property.listingRef,
        slug: payload.property.slug,
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Yeni Portföy Yükle</h2>
      <p className="mt-2 text-sm text-slate-600">
        Ortak alanları tek formda doldurun; açıklamayı Türkçe ana metne ek olarak İngilizce ve Rusça girebilirsiniz.
        Kapak hariç tüm görselleri tek galeri alanından topluca yükleyebilirsiniz.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <PropertyFieldShell label="Portföy Başlığı" icon={<TitleFieldIcon />} className="md:col-span-2">
          <input required name="title" placeholder="Portföy başlığı" className="input" />
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

        <PropertyFieldShell label="Fiyat" icon={<PriceFieldIcon />}>
          <input required name="price" type="number" min={1000} placeholder="Fiyat (TRY)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Oda Sayısı" icon={<RoomFieldIcon />}>
          <input required name="rooms" placeholder="Oda sayısı (örn. 3+1)" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Metrekare" icon={<AreaFieldIcon />}>
          <input required name="areaM2" type="number" min={20} placeholder="m²" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Kat Bilgisi" icon={<FloorFieldIcon />}>
          <input required name="floor" placeholder="Kat bilgisi" className="input" />
        </PropertyFieldShell>

        <PropertyFieldShell label="Isıtma" icon={<HeatingFieldIcon />}>
          <input required name="heating" placeholder="Isıtma" className="input" />
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

        <label className="md:col-span-2">
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

        <label className="md:col-span-2">
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

        <PropertyDescriptionFields />

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

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
        >
          {status.type === "loading" ? "Kaydediliyor..." : "Portföyü Yayına Al"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}

      {status.type === "success" ? (
        <p className="mt-3 text-sm text-emerald-700">
          {status.listingRef} kodlu portföy eklendi.
          <Link href={`/ilan/${status.slug}`} className="ml-1 font-semibold underline">
            İlanı görüntüle
          </Link>
        </p>
      ) : null}
    </section>
  );
}
