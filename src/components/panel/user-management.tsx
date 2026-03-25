"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { canDeleteManagedUser } from "@/lib/access-control";
import { roleLabel } from "@/lib/format";
import type { SafeUser, UserRole } from "@/lib/types";

type UserManagementProps = {
  currentUser: SafeUser;
  initialUsers: SafeUser[];
  assignableRoles: UserRole[];
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "error"; message: string }
  | { type: "success"; message: string };

export function UserManagement({
  currentUser,
  initialUsers,
  assignableRoles,
}: UserManagementProps) {
  const router = useRouter();
  const [users, setUsers] = useState<SafeUser[]>(initialUsers);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("tr");

    if (!normalizedQuery) {
      return users;
    }

    return users.filter((user) =>
      [user.name, user.email, user.phone, roleLabel(user.role)]
        .join(" ")
        .toLocaleLowerCase("tr")
        .includes(normalizedQuery),
    );
  }, [query, users]);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        email: data.get("email"),
        phone: data.get("phone"),
        password: data.get("password"),
        role: data.get("role"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Kullanıcı oluşturulamadı." });
      return;
    }

    const payload = (await response.json()) as { user: SafeUser };
    setUsers((previous) => [payload.user, ...previous]);
    setStatus({ type: "success", message: `${payload.user.name} oluşturuldu.` });
    form.reset();
    router.refresh();
  }

  async function handleDelete(user: SafeUser) {
    const confirmed = window.confirm(`${user.name} hesabını silmek istediğine emin misin?`);
    if (!confirmed) {
      return;
    }

    setDeletingUserId(user.id);

    const response = await fetch(`/api/users/${user.id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({ type: "error", message: payload?.message ?? "Kullanıcı silinemedi." });
      setDeletingUserId(null);
      return;
    }

    setUsers((previous) => previous.filter((item) => item.id !== user.id));
    setStatus({ type: "success", message: `${user.name} silindi.` });
    setDeletingUserId(null);
    router.refresh();
  }

  return (
    <section className="space-y-6">
      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">Kullanıcı Yönetimi</h2>
        <p className="mt-2 text-sm text-slate-600">
          Panel kullanıcılarını oluşturun, rollerini belirleyin ve görünür hesapları yönetin.
        </p>

        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
          {currentUser.role === "portal_admin"
            ? "Portal admin tüm rolleri atayabilir."
            : "Admin yeni admin, portföy yetkilisi ve içerik yükleyici hesapları oluşturabilir. Portal admin hesaplarını göremez."}
        </div>

        <form onSubmit={handleCreate} className="mt-5 grid gap-3 md:grid-cols-2">
          <input required name="name" placeholder="Ad Soyad" className="input" />
          <input required type="email" name="email" placeholder="E-posta" className="input" />
          <input required name="phone" placeholder="Telefon (+90 ...)" className="input" />
          <input required minLength={6} type="password" name="password" placeholder="Şifre" className="input" />
          <label className="md:col-span-2">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
              Rol
            </span>
            <select required name="role" defaultValue={assignableRoles[0] ?? ""} className="input">
              {assignableRoles.map((role) => (
                <option key={role} value={role}>
                  {roleLabel(role)}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="cursor-pointer rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-500 md:col-span-2"
          >
            {status.type === "loading" ? "Kullanıcı Oluşturuluyor..." : "Kullanıcı Oluştur"}
          </button>
        </form>

        {status.type === "error" ? <p className="mt-3 text-sm text-rose-700">{status.message}</p> : null}
        {status.type === "success" ? <p className="mt-3 text-sm text-emerald-700">{status.message}</p> : null}
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Mevcut Kullanıcılar</h3>
            <p className="mt-1 text-sm text-slate-600">Yalnızca bu hesabın görme yetkisi olan kullanıcılar listelenir.</p>
          </div>

          <div className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 md:w-[240px]">
            Toplam kayıt: <strong className="text-slate-900">{users.length}</strong>
          </div>
        </div>

        <div className="mt-4">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Kullanıcı ara (ad, e-posta, telefon, rol)"
            className="input"
          />
        </div>

        <div className="mt-5 space-y-3">
          {filteredUsers.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 p-4 text-sm text-slate-500">
              {users.length === 0 ? "Henüz kullanıcı kaydı yok." : "Aramana uygun kullanıcı bulunamadı."}
            </p>
          ) : (
            filteredUsers.map((user) => {
              const canDelete = canDeleteManagedUser(currentUser, user);
              const isSelf = currentUser.id === user.id;

              return (
                <article key={user.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                          {roleLabel(user.role)}
                        </span>
                        {isSelf ? (
                          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">
                            Aktif Hesap
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{user.name}</p>
                      <p className="text-sm text-slate-600">{user.email}</p>
                      <p className="text-sm text-slate-500">{user.phone || "Telefon bilgisi yok"}</p>
                    </div>

                    <button
                      type="button"
                      disabled={!canDelete || deletingUserId === user.id}
                      onClick={() => void handleDelete(user)}
                      className="cursor-pointer rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                      title={
                        isSelf
                          ? "Kendi hesabını silemezsin"
                          : canDelete
                            ? "Kullanıcıyı sil"
                            : "Bu kullanıcıyı silme yetkin yok"
                      }
                    >
                      {deletingUserId === user.id ? "Siliniyor..." : "Sil"}
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </article>
    </section>
  );
}
