"use client";

import Link from "next/link";
import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { PropertyTranslationFields } from "@/components/panel/property-translation-fields";
import {
  MAX_IMAGES_PER_ROOM,
  MAX_PORTFOLIO_REQUEST_MB,
  MAX_WEBP_UPLOAD_MB,
  PORTFOLIO_ROOM_FIELDS,
  getFilesFromFormData,
  validateTotalUploadSize,
  validateWebpFile,
} from "@/lib/portfolio-images";
import { formatPrice } from "@/lib/format";
import type { Advisor, Property } from "@/lib/types";

type PortfolioEditorProps = {
  initialProperties: Property[];
  advisors: Advisor[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

const typeOptions = ["Daire", "Villa", "Rezidans", "Arsa", "Ofis"];
const coverOptions = [
  { label: "Turkuaz", value: "linear-gradient(120deg, #0f766e, #2dd4bf)" },
  { label: "Mavi", value: "linear-gradient(120deg, #1d4ed8, #60a5fa)" },
  { label: "Turuncu", value: "linear-gradient(120deg, #7c2d12, #fb923c)" },
  { label: "Mor", value: "linear-gradient(120deg, #7e22ce, #c084fc)" },
  { label: "Yeşil", value: "linear-gradient(120deg, #166534, #4ade80)" },
];

export function PortfolioEditor({ initialProperties, advisors }: PortfolioEditorProps) {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [selectedSlug, setSelectedSlug] = useState<string>(initialProperties[0]?.slug ?? "");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  const selectedProperty = useMemo(
    () => properties.find((property) => property.slug === selectedSlug),
    [properties, selectedSlug],
  );

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
        validateWebpFile(coverFile, "Kapak görseli");
        uploadFiles.push(coverFile);
      }

      for (const field of PORTFOLIO_ROOM_FIELDS) {
        const files = getFilesFromFormData(data, field.name);
        if (files.length === 0) {
          continue;
        }

        if (files.length > MAX_IMAGES_PER_ROOM) {
          throw new Error(`${field.label} için en fazla ${MAX_IMAGES_PER_ROOM} görsel yükleyebilirsiniz.`);
        }

        for (const [index, file] of files.entries()) {
          validateWebpFile(file, `${field.label} ${index + 1} görseli`);
          uploadFiles.push(file);
        }
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
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Portföy Düzenle</h2>
        <p className="mt-2 text-sm text-slate-600">Düzenlenecek portföy bulunamadı.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Portföy Düzenle</h2>
          <p className="mt-2 text-sm text-slate-600">
            Oda görsellerini ayrı ayrı ve çoklu olarak güncelleyebilirsiniz. Yeni dosyalar sadece <strong>.webp</strong>{" "}
            olmalıdır.
          </p>
        </div>
        <Link href={`/ilan/${selectedProperty.slug}`} className="text-sm font-semibold text-slate-700 underline">
          İlanı aç
        </Link>
      </div>

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Düzenlenecek Portföy</p>
        <select
          value={selectedSlug}
          onChange={(event) => {
            setSelectedSlug(event.target.value);
            setStatus({ type: "idle" });
          }}
          className="input mt-2"
        >
          {properties.map((property) => (
            <option key={property.id} value={property.slug}>
              {property.listingRef} • {property.title} • {formatPrice(property.price)}
            </option>
          ))}
        </select>
      </div>

      <form key={selectedProperty.slug} onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <input required name="city" defaultValue={selectedProperty.city} placeholder="Şehir" className="input" />
        <input required name="district" defaultValue={selectedProperty.district} placeholder="İlçe" className="input" />
        <input
          required
          name="neighborhood"
          defaultValue={selectedProperty.neighborhood}
          placeholder="Mahalle"
          className="input"
        />

        <select required name="type" defaultValue={selectedProperty.type} className="input">
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input
          required
          name="price"
          type="number"
          min={1000}
          defaultValue={selectedProperty.price}
          placeholder="Fiyat (TRY)"
          className="input"
        />
        <input required name="rooms" defaultValue={selectedProperty.rooms} placeholder="Oda sayısı (örn. 3+1)" className="input" />
        <input
          required
          name="areaM2"
          type="number"
          min={20}
          defaultValue={selectedProperty.areaM2}
          placeholder="m²"
          className="input"
        />
        <input required name="floor" defaultValue={selectedProperty.floor} placeholder="Kat bilgisi" className="input" />
        <input required name="heating" defaultValue={selectedProperty.heating} placeholder="Isıtma" className="input" />
        <input
          name="latitude"
          type="number"
          step="any"
          defaultValue={selectedProperty.latitude}
          placeholder="Enlem"
          className="input"
        />
        <input
          name="longitude"
          type="number"
          step="any"
          defaultValue={selectedProperty.longitude}
          placeholder="Boylam"
          className="input"
        />

        <select required name="advisorId" defaultValue={selectedProperty.advisorId} className="input md:col-span-2">
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.name} - {advisor.focusArea}
            </option>
          ))}
        </select>

        <select required name="coverColor" defaultValue={selectedProperty.coverColor} className="input md:col-span-2">
          {availableCoverOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Vurgu Rengi: {option.label}
            </option>
          ))}
        </select>

        <label className="md:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            Kapak Görselini Değiştir (.webp)
          </span>
          <input type="file" accept=".webp,image/webp" name="coverImageFile" className="input" />
        </label>

        <div className="md:col-span-2 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
          <div className="h-44 bg-cover bg-center" style={{ backgroundImage: `url(${selectedProperty.coverImage})` }} />
          <p className="px-3 py-2 text-xs text-slate-600">Mevcut kapak görseli</p>
        </div>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-2">
          {PORTFOLIO_ROOM_FIELDS.map((field) => (
            <label key={field.name}>
              <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                {field.label} Görsellerini Güncelle (.webp)
              </span>
              <input type="file" accept=".webp,image/webp" name={field.name} multiple className="input" />
            </label>
          ))}
        </div>

        <p className="md:col-span-2 text-xs text-slate-500">
          Dosya kuralı: yalnızca `.webp`, dosya başına en fazla {MAX_WEBP_UPLOAD_MB} MB, oda başına en fazla{" "}
          {MAX_IMAGES_PER_ROOM} görsel, toplam yükleme en fazla {MAX_PORTFOLIO_REQUEST_MB} MB.
        </p>

        <div className="md:col-span-2 grid gap-3 sm:grid-cols-3">
          {selectedProperty.galleryImages.map((image, index) => (
            <article key={`${image}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="h-28 bg-cover bg-center" style={{ backgroundImage: `url(${image})` }} />
              <p className="px-3 py-2 text-xs text-slate-600">
                {selectedProperty.imageLabels[index] ?? `Görsel ${index + 1}`}
              </p>
            </article>
          ))}
        </div>

        <PropertyTranslationFields
          defaultTitle={selectedProperty.title}
          defaultDescription={selectedProperty.description}
          defaultHighlights={selectedProperty.highlights}
          defaultFeatures={selectedProperty.features}
          defaultTranslations={selectedProperty.translations}
        />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
        >
          {status.type === "loading" ? "Güncelleniyor..." : "Portföyü Güncelle"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}
    </section>
  );
}
