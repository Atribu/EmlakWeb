"use client";

import { FormEvent, useState } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { contactFormCopy } from "@/lib/site-copy";

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
  const { language } = useSitePreferences();
  const copy = contactFormCopy(language);
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
        message: payload?.message ?? copy.fallbackError,
      });
      return;
    }

    const payload = (await response.json()) as { message: string };
    setStatus({ type: "success", message: payload.message });
    form.reset();
  }

  return (
    <section className="rounded-2xl border border-[#ddcfbc] bg-[#fffdf9] p-6 shadow-sm">
      <span className="section-kicker">{copy.kicker}</span>
      <h2 className="mt-3 text-[1.9rem] font-semibold leading-none text-[#221b13]">{copy.title}</h2>
      <p className="mt-2 text-sm text-[#665c4f]">
        {language === "TR"
          ? `${propertyTitle} ${copy.descriptionPrefix}`
          : `${copy.descriptionPrefix} ${propertyTitle} ${copy.descriptionSuffix}`}
      </p>

      <form onSubmit={onSubmit} className="mt-5 space-y-3">
        <input required name="name" placeholder={copy.name} className="input" />
        <input required type="email" name="email" placeholder={copy.email} className="input" />
        <input required name="phone" placeholder={copy.phone} className="input" />
        <textarea required name="message" placeholder={copy.message} rows={4} className="input" />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-full bg-[#1f1a14] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#786b59]"
        >
          {status.type === "loading" ? copy.submitting : copy.submit}
        </button>

        {status.type === "success" ? <p className="text-sm text-emerald-700">{status.message}</p> : null}
        {status.type === "error" ? <p className="text-sm text-rose-700">{status.message}</p> : null}
      </form>
    </section>
  );
}
