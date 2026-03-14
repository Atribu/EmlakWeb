"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

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

export function PortfolioForm({ advisors }: PortfolioFormProps) {
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.get("title"),
        city: data.get("city"),
        district: data.get("district"),
        neighborhood: data.get("neighborhood"),
        type: data.get("type"),
        price: Number(data.get("price")),
        rooms: data.get("rooms"),
        areaM2: Number(data.get("areaM2")),
        floor: data.get("floor"),
        heating: data.get("heating"),
        description: data.get("description"),
        advisorId: data.get("advisorId"),
        coverColor: data.get("coverColor"),
        highlights: String(data.get("highlights") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        features: String(data.get("features") ?? "")
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        imageLabels: ["Salon", "Mutfak", "Yatak Odası"],
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({
        type: "error",
        message: payload?.message ?? "Portföy kaydedilemedi.",
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
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Yeni Portföy Yükle</h2>
      <p className="mt-2 text-sm text-slate-600">
        Her portföy için bir danışman seçmek zorunludur. Veriler demo bellekte saklanır.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <input required name="title" placeholder="Portföy başlığı" className="input" />
        <input required name="city" placeholder="Şehir" className="input" />
        <input required name="district" placeholder="İlçe" className="input" />
        <input required name="neighborhood" placeholder="Mahalle" className="input" />

        <select required name="type" className="input">
          {typeOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>

        <input required name="price" type="number" min={1000} placeholder="Fiyat (TRY)" className="input" />
        <input required name="rooms" placeholder="Oda sayısı (örn. 3+1)" className="input" />
        <input required name="areaM2" type="number" min={20} placeholder="m²" className="input" />
        <input required name="floor" placeholder="Kat bilgisi" className="input" />
        <input required name="heating" placeholder="Isıtma" className="input" />

        <select required name="advisorId" className="input md:col-span-2">
          <option value="">Danışman seçin</option>
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.name} - {advisor.focusArea}
            </option>
          ))}
        </select>

        <select required name="coverColor" className="input md:col-span-2">
          {coverOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Kapak Rengi: {option.label}
            </option>
          ))}
        </select>

        <textarea required name="description" rows={4} placeholder="İlan açıklaması" className="input md:col-span-2" />
        <input
          required
          name="highlights"
          placeholder="Öne çıkanlar (virgülle)"
          className="input md:col-span-2"
        />
        <input required name="features" placeholder="Özellikler (virgülle)" className="input md:col-span-2" />

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
