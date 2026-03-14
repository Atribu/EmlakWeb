"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = {
  propertySlug: string;
  propertyTitle: string;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function ContactForm({ propertySlug, propertyTitle }: ContactFormProps) {
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertySlug,
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        message: data.get("message"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({
        type: "error",
        message: payload?.message ?? "Talep iletilirken hata oluştu. Lütfen tekrar deneyin.",
      });
      return;
    }

    const payload = (await response.json()) as { message: string };
    setStatus({ type: "success", message: payload.message });
    form.reset();
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Bu İlan İçin Bilgi Al</h2>
      <p className="mt-2 text-sm text-slate-600">{propertyTitle} için formu doldurun, talebiniz e-posta ile iletilsin.</p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input
          required
          name="name"
          placeholder="Ad Soyad"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-500"
        />
        <input
          required
          type="email"
          name="email"
          placeholder="E-posta"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-500"
        />
        <input
          required
          name="phone"
          placeholder="Telefon"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-500"
        />
        <textarea
          required
          name="message"
          placeholder="Talebinizi kısaca yazın"
          rows={4}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-0 transition focus:border-slate-500"
        />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {status.type === "loading" ? "Gönderiliyor..." : "Talep Gönder"}
        </button>

        {status.type === "success" ? <p className="text-sm text-emerald-700">{status.message}</p> : null}
        {status.type === "error" ? <p className="text-sm text-rose-700">{status.message}</p> : null}
      </form>
    </section>
  );
}
