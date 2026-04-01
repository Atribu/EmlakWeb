"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type LoginFormProps = {
  nextPath: string;
};

type Status = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };

export function LoginForm({ nextPath }: LoginFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>({ type: "idle" });
  const [credentials, setCredentials] = useState<{ identifier: string; password: string }>({
    identifier: "",
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
        identifier: data.get("identifier") ?? credentials.identifier,
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
    <div className="max-w-xl">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Yönetim Paneli Girişi</h1>
        <p className="mt-2 text-sm text-slate-600">
          Yetkili hesabınızın e-posta adresi ve şifresi ile giriş yapın.
        </p>

        <div className="mt-5 space-y-3">
          <input
            required
            type="email"
            name="identifier"
            value={credentials.identifier}
            onChange={(event) =>
              setCredentials((previous) => ({
                ...previous,
                identifier: event.target.value,
              }))
            }
            placeholder="E-posta adresi"
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
    </div>
  );
}
