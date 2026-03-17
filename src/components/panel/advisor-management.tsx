"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import type { Advisor } from "@/lib/types";

type AdvisorWithStats = Advisor & {
  propertyCount: number;
  linkedUserCount: number;
};

type AdvisorManagementProps = {
  initialAdvisors: AdvisorWithStats[];
  canManage: boolean;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function AdvisorManagement({ initialAdvisors, canManage }: AdvisorManagementProps) {
  const router = useRouter();
  const [advisors, setAdvisors] = useState<AdvisorWithStats[]>(initialAdvisors);
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canManage) {
      return;
    }

    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/advisors", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
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
      setStatus({ type: "error", message: payload?.message ?? "Danışman eklenemedi." });
      return;
    }

    const payload = (await response.json()) as { advisor: Advisor };
    setAdvisors((previous) => [
      { ...payload.advisor, propertyCount: 0, linkedUserCount: 0 },
      ...previous,
    ]);
    setStatus({ type: "success", message: `${payload.advisor.name} eklendi.` });
    form.reset();
    router.refresh();
  }

  async function handleDelete(advisor: AdvisorWithStats) {
    if (!canManage) {
      return;
    }

    if (advisor.propertyCount > 0 || advisor.linkedUserCount > 0) {
      setStatus({
        type: "error",
        message:
          "Bu danışmanı silmek için önce bağlı portföy ve kullanıcı kayıtlarını kaldırmalısınız.",
      });
      return;
    }

    const confirmed = window.confirm(`${advisor.name} kaydını silmek istediğine emin misin?`);
    if (!confirmed) {
      return;
    }

    setDeletingId(advisor.id);
    const response = await fetch(`/api/advisors/${advisor.id}`, { method: "DELETE" });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Danışman silinemedi." });
      setDeletingId(null);
      return;
    }

    setAdvisors((previous) => previous.filter((item) => item.id !== advisor.id));
    setStatus({ type: "success", message: `${advisor.name} silindi.` });
    setDeletingId(null);
    router.refresh();
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold tracking-tight text-slate-900">Danışman Yönetimi</h2>
      <p className="mt-2 text-sm text-slate-600">
        Panelden danışman ekleyebilir, bağlı kaydı olmayan danışmanları silebilirsiniz.
      </p>

      {!canManage ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Danışman ekleme/silme yetkisi sadece admin hesabında açık.
        </p>
      ) : (
        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <input required name="name" placeholder="Ad Soyad" className="input" />
          <input required name="title" placeholder="Unvan" className="input" />
          <input required name="focusArea" placeholder="Uzmanlık alanı (örn. Kadıköy / Moda)" className="input" />
          <input required type="email" name="email" placeholder="E-posta" className="input" />
          <input required name="phone" placeholder="Telefon (+90 ...)" className="input" />
          <input required name="whatsapp" placeholder="WhatsApp (+90 ...)" className="input" />

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
          >
            {status.type === "loading" ? "Ekleniyor..." : "Danışman Ekle"}
          </button>
        </form>
      )}

      {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}

      <div className="mt-5 space-y-3">
        {advisors.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
            Henüz danışman kaydı yok.
          </p>
        ) : (
          advisors.map((advisor) => {
            const blockedReason =
              advisor.propertyCount > 0
                ? `${advisor.propertyCount} portföy bağlı`
                : advisor.linkedUserCount > 0
                  ? `${advisor.linkedUserCount} kullanıcı hesabı bağlı`
                  : null;

            return (
              <article key={advisor.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900">{advisor.name}</p>
                    <p className="text-sm text-slate-600">{advisor.title}</p>
                    <p className="text-sm text-slate-500">{advisor.focusArea}</p>
                    <p className="mt-1 text-xs text-slate-500">
                      Aktif portföy: {advisor.propertyCount} • Bağlı kullanıcı: {advisor.linkedUserCount}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={!canManage || Boolean(blockedReason) || deletingId === advisor.id}
                    onClick={() => void handleDelete(advisor)}
                    className="cursor-pointer rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                    title={blockedReason ?? (!canManage ? "Yalnızca admin silebilir" : "Danışmanı sil")}
                  >
                    {deletingId === advisor.id ? "Siliniyor..." : "Sil"}
                  </button>
                </div>

                {blockedReason ? (
                  <p className="mt-2 text-xs font-medium text-amber-700">Silme kilidi: {blockedReason}</p>
                ) : null}
              </article>
            );
          })
        )}
      </div>
    </article>
  );
}
