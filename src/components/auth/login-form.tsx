"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  nextPath: string;
};

type Status = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };

const demoAccounts = [
  { label: "Admin", username: "admin", password: "admin123" },
  { label: "Danışman", username: "ayse", password: "ayse123" },
  { label: "İçerik", username: "icerik", password: "icerik123" },
];

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [credentials, setCredentials] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });

  const actionLabel = useMemo(
    () => (status.type === "loading" ? "Giriş yapılıyor..." : "Panel Girişi"),
    [status.type],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: data.get("username") ?? credentials.username,
        password: data.get("password") ?? credentials.password,
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Giriş başarısız." });
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Yönetim Paneli Girişi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Demo sürümde `admin`, `danışman` ve `içerik yükleyici` rollerini test edebilirsiniz.
        </p>

        <div className="mt-5 space-y-3">
          <input
            required
            name="username"
            value={credentials.username}
            onChange={(event) =>
              setCredentials((previous) => ({
                ...previous,
                username: event.target.value,
              }))
            }
            placeholder="Kullanıcı adı"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />
          <input
            required
            type="password"
            name="password"
            value={credentials.password}
            onChange={(event) =>
              setCredentials((previous) => ({
                ...previous,
                password: event.target.value,
              }))
            }
            placeholder="Şifre"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <button
          type="submit"
          disabled={status.type === "loading"}
          className="mt-4 cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500"
        >
          {actionLabel}
        </button>

        {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
      </form>

      <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-6">
        <h2 className="text-lg font-semibold text-slate-900">Demo Hesaplar</h2>
        <div className="mt-4 space-y-3">
          {demoAccounts.map((account) => (
            <button
              key={account.username}
              type="button"
              onClick={() =>
                setCredentials({ username: account.username, password: account.password })
              }
              className="w-full cursor-pointer rounded-lg border border-slate-200 bg-white px-3 py-3 text-left transition hover:border-slate-400"
            >
              <p className="text-sm font-semibold text-slate-900">{account.label}</p>
              <p className="mt-1 text-xs text-slate-600">
                {account.username} / {account.password}
              </p>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
