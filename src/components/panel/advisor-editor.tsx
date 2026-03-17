"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import type { Advisor } from "@/lib/types";

type AdvisorEditorProps = {
  initialAdvisors: Advisor[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function AdvisorEditor({ initialAdvisors, canManage }: AdvisorEditorProps) {
  const router = useRouter();
  const [advisors, setAdvisors] = useState<Advisor[]>(initialAdvisors);
  const [selectedId, setSelectedId] = useState<string>(initialAdvisors[0]?.id ?? "");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  const selectedAdvisor = useMemo(
    () => advisors.find((advisor) => advisor.id === selectedId),
    [advisors, selectedId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedAdvisor || !canManage) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus({ type: "loading" });

    const response = await fetch(`/api/advisors/${selectedAdvisor.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        title: data.get("title"),
        phone: data.get("phone"),
        whatsapp: data.get("whatsapp"),
        email: data.get("email"),
        focusArea: data.get("focusArea"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Danışman güncellenemedi." });
      return;
    }

    const payload = (await response.json()) as { advisor: Advisor };
    setAdvisors((previous) =>
      previous.map((advisor) => (advisor.id === payload.advisor.id ? payload.advisor : advisor)),
    );
    setStatus({ type: "success", message: `${payload.advisor.name} güncellendi.` });
    router.refresh();
  }

  if (!selectedAdvisor) {
    return (
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Danışman Düzenle</h2>
        <p className="mt-2 text-sm text-slate-600">Düzenlenecek danışman bulunamadı.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Danışman Düzenle</h2>
      <p className="mt-2 text-sm text-slate-600">Mevcut danışman bilgilerini güncelleyin.</p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Danışman düzenleme yetkisi sadece admin hesabında açık.
        </p>
      ) : null}

      <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Düzenlenecek Danışman</p>
        <select
          value={selectedId}
          onChange={(event) => {
            setSelectedId(event.target.value);
            setStatus({ type: "idle" });
          }}
          className="input mt-2"
        >
          {advisors.map((advisor) => (
            <option key={advisor.id} value={advisor.id}>
              {advisor.name} • {advisor.focusArea}
            </option>
          ))}
        </select>
      </div>

      <form key={selectedAdvisor.id} onSubmit={handleSubmit} className="mt-5 grid gap-3 md:grid-cols-2">
        <input required name="name" defaultValue={selectedAdvisor.name} placeholder="Ad Soyad" className="input" />
        <input required name="title" defaultValue={selectedAdvisor.title} placeholder="Unvan" className="input" />
        <input required name="focusArea" defaultValue={selectedAdvisor.focusArea} placeholder="Uzmanlık alanı" className="input" />
        <input required type="email" name="email" defaultValue={selectedAdvisor.email} placeholder="E-posta" className="input" />
        <input required name="phone" defaultValue={selectedAdvisor.phone} placeholder="Telefon (+90 ...)" className="input" />
        <input required name="whatsapp" defaultValue={selectedAdvisor.whatsapp} placeholder="WhatsApp (+90 ...)" className="input" />

        <button
          type="submit"
          disabled={status.type === "loading" || !canManage}
          className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
        >
          {status.type === "loading" ? "Güncelleniyor..." : "Danışmanı Güncelle"}
        </button>
      </form>

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}
    </section>
  );
}
