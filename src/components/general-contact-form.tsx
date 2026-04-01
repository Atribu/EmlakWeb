"use client";

import { FormEvent, useState } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { generalContactFormCopy } from "@/lib/site-copy";

type PropertyOption = {
  slug: string;
  title: string;
};

type GeneralContactFormProps = {
  properties: PropertyOption[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function GeneralContactForm({ properties }: GeneralContactFormProps) {
  const { language } = useSitePreferences();
  const copy = generalContactFormCopy(language);
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
        propertySlug: data.get("propertySlug"),
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
    <section className="luxury-card p-6 sm:p-7">
      <span className="section-kicker">{copy.kicker}</span>
      <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#1f1a14]">
        {copy.title}
      </h2>
      <p className="mt-2 text-sm text-[#655b4f]">
        {copy.body}
      </p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <select name="propertySlug" required className="input">
          {properties.map((property) => (
            <option key={property.slug} value={property.slug}>
              {property.title}
            </option>
          ))}
        </select>
        <input required name="name" placeholder={copy.name} className="input" />
        <input required type="email" name="email" placeholder={copy.email} className="input" />
        <input required name="phone" placeholder={copy.phone} className="input" />
        <textarea required name="message" placeholder={copy.message} rows={4} className="input" />

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="cursor-pointer rounded-full bg-[#17140f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:bg-[#7d7365]"
        >
          {status.type === "loading" ? copy.submitting : copy.submit}
        </button>

        {status.type === "success" ? <p className="text-sm text-emerald-700">{status.message}</p> : null}
        {status.type === "error" ? <p className="text-sm text-rose-700">{status.message}</p> : null}
      </form>
    </section>
  );
}
