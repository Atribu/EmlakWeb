import Link from "next/link";

import { adminNotificationTotal, type AdminNotification } from "@/lib/admin-notifications";

type AdminNotificationCenterProps = {
  notifications: AdminNotification[];
};

const notificationToneClass: Record<AdminNotification["tone"], string> = {
  urgent: "border-rose-200 bg-rose-50 text-rose-800",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  info: "border-sky-200 bg-sky-50 text-sky-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

const notificationDotClass: Record<AdminNotification["tone"], string> = {
  urgent: "bg-rose-500",
  warning: "bg-amber-500",
  info: "bg-sky-500",
  success: "bg-emerald-500",
};

export function AdminNotificationCenter({ notifications }: AdminNotificationCenterProps) {
  const total = adminNotificationTotal(notifications);
  const visibleNotifications = notifications.slice(0, 5);

  return (
    <details className="group relative">
      <summary
        className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-[1rem] border border-[#e2e8f0] bg-white text-[#475569] shadow-[0_10px_20px_-18px_rgba(15,23,42,0.35)] transition hover:border-[#cbd5e1] hover:text-[#0f172a] group-open:border-[#1d4ed8] group-open:text-[#1d4ed8] [&::-webkit-details-marker]:hidden"
        aria-label="Bildirim merkezini aç"
      >
        <BellIcon />
        {total > 0 ? (
          <span className="absolute right-2 top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#fb7185] px-1 text-[0.68rem] font-bold leading-none text-white">
            {total > 99 ? "99+" : total}
          </span>
        ) : (
          <span className="absolute right-3 top-3 h-2.5 w-2.5 rounded-full bg-emerald-500" />
        )}
      </summary>

      <div className="absolute right-0 top-[calc(100%+0.75rem)] z-50 w-[min(380px,calc(100vw-2rem))] overflow-hidden rounded-[1.25rem] border border-[#e2e8f0] bg-white shadow-[0_24px_70px_-28px_rgba(15,23,42,0.35)]">
        <div className="border-b border-[#e2e8f0] px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#1d4ed8]">Bildirim Merkezi</p>
              <h2 className="mt-1 text-base font-semibold text-[#0f172a]">Bekleyen işler</h2>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-[#475569]">
              {total > 0 ? `${total} açık` : "Temiz"}
            </span>
          </div>
        </div>

        <div className="max-h-[430px] overflow-y-auto p-3">
          <div className="space-y-2">
            {visibleNotifications.map((notification) => (
              <Link
                key={notification.id}
                href={notification.href}
                className={`block rounded-2xl border px-4 py-3 transition hover:-translate-y-0.5 hover:shadow-[0_16px_28px_-24px_rgba(15,23,42,0.45)] ${notificationToneClass[notification.tone]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${notificationDotClass[notification.tone]}`} />
                      <p className="truncate text-sm font-semibold">{notification.title}</p>
                    </div>
                    <p className="mt-1 text-sm leading-5 text-[#475569]">{notification.description}</p>
                    {notification.meta ? <p className="mt-2 text-xs font-medium text-[#64748b]">{notification.meta}</p> : null}
                  </div>
                  {notification.count > 0 ? (
                    <span className="shrink-0 rounded-full bg-white/80 px-2.5 py-1 text-xs font-bold text-[#0f172a]">
                      {notification.count}
                    </span>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="border-t border-[#e2e8f0] bg-[#f8fafc] px-5 py-3">
          <Link href="/yonetim-ofisi?tab=overview" className="text-sm font-semibold text-[#1d4ed8] hover:text-[#1e40af]">
            Genel bakışa git
          </Link>
        </div>
      </div>
    </details>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4.5 w-4.5" aria-hidden>
      <path
        d="M10 3.75a3.25 3.25 0 0 0-3.25 3.25v1.05c0 .78-.23 1.54-.66 2.2l-.92 1.4a1 1 0 0 0 .84 1.55h8a1 1 0 0 0 .84-1.55l-.92-1.4a4 4 0 0 1-.66-2.2V7A3.25 3.25 0 0 0 10 3.75Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path d="M8.5 15a1.75 1.75 0 0 0 3 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
