"use client";

import { FormEvent, useState } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import { appointmentFormCopy } from "@/lib/site-copy";

type AppointmentFormProps = {
  propertySlug: string;
  propertyTitle: string;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

export function AppointmentForm({ propertySlug, propertyTitle }: AppointmentFormProps) {
  const { language } = useSitePreferences();
  const copy = appointmentFormCopy(language);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        propertySlug,
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        preferredDate: data.get("preferredDate"),
        preferredTime: data.get("preferredTime"),
        visitType: data.get("visitType"),
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
        {copy.bodyPrefix
          ? `${copy.bodyPrefix} ${propertyTitle} ${copy.bodySuffix}`
          : `${propertyTitle} ${copy.bodySuffix}`}
      </p>

      <form onSubmit={onSubmit} className="mt-5 grid gap-3">
        <input required name="name" placeholder={copy.name} className="input" />
        <input required type="email" name="email" placeholder={copy.email} className="input" />
        <input required name="phone" placeholder={copy.phone} className="input" />

        <div className="grid gap-3 sm:grid-cols-2">
          <input required type="date" name="preferredDate" className="input" />
          <input required type="time" name="preferredTime" className="input" />
        </div>

        <select required name="visitType" className="input">
          {copy.visitTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>

        <textarea
          required
          name="message"
          placeholder={copy.message}
          rows={3}
          className="input"
        />

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
