import type { ReactNode } from "react";

import { PropertyInfoIcon } from "@/components/property-info-icon";

type PropertyFieldShellProps = {
  label: string;
  icon: ReactNode;
  className?: string;
  hint?: string;
  children: ReactNode;
};

export function PropertyFieldShell({
  label,
  icon,
  className = "",
  hint,
  children,
}: PropertyFieldShellProps) {
  return (
    <label className={`flex min-w-0 flex-col gap-2 ${className}`}>
      <span className="inline-flex items-center gap-2.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
        <span className="flex h-8 w-8 items-center justify-center rounded-[0.95rem] border border-blue-100 bg-blue-50 text-blue-700 shadow-[0_14px_20px_-18px_rgba(37,99,235,0.42)]">
          {icon}
        </span>
        {label}
      </span>
      {children}
      {hint ? <span className="pl-1 text-[11px] text-slate-500">{hint}</span> : null}
    </label>
  );
}

export function TitleFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4.5 5.25h11M10 5.25v9.5M6.75 14.75h6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LocationFieldIcon() {
  return <PropertyInfoIcon icon="location" />;
}

export function TypeFieldIcon() {
  return <PropertyInfoIcon icon="building" />;
}

export function PriceFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5.25 5.5h9.5v9h-9.5z" stroke="currentColor" strokeWidth="1.5" rx="1.5" />
      <path d="M7.25 8.25h5.5M10 8.25v4.5M7.75 12.75h4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function CurrencyFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10 4v12M13.75 6.5c-.6-.9-1.7-1.5-3.25-1.5-1.93 0-3.25.94-3.25 2.38 0 1.41 1.06 2.03 3.25 2.37 2.11.33 3.25.87 3.25 2.38 0 1.49-1.4 2.37-3.5 2.37-1.62 0-2.85-.55-3.75-1.62" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoomFieldIcon() {
  return <PropertyInfoIcon icon="rooms" />;
}

export function AreaFieldIcon() {
  return <PropertyInfoIcon icon="area" />;
}

export function FloorFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4.5 16.25V7.5L10 3.75l5.5 3.75v8.75" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M7.75 16.25v-4h4.5v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function HeatingFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10.3 3.5c1.85 2.07 2.96 3.47 2.96 5.2a3.26 3.26 0 1 1-6.52 0c0-1.15.58-2.17 1.65-3.5.22 1.26 1.16 2.23 1.91 2.68.23-1.13.54-2.3 2-4.38Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function StatusFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M4.75 10 8 13.25 15.25 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="6.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

export function BuildingFieldIcon() {
  return <PropertyInfoIcon icon="building" />;
}

export function NoteFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M5 4.75h10v10.5H8.5L5 18.5V4.75Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="M7.25 8h5.5M7.25 11h5.5" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" />
    </svg>
  );
}

export function ShieldFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10 3.75 15 5.6v4.05c0 3.08-2.06 5.87-5 6.6-2.94-.73-5-3.52-5-6.6V5.6l5-1.85Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="m8.35 9.9 1.2 1.2 2.3-2.55" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PublishFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10 3.75 15.25 6.5v7L10 16.25 4.75 13.5v-7L10 3.75Z" stroke="currentColor" strokeWidth="1.45" strokeLinejoin="round" />
      <path d="m7.8 10.15 1.45 1.45 2.95-3.05" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AdvisorFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <circle cx="10" cy="6.25" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.25 15.5c.84-2.06 2.54-3.25 4.75-3.25s3.91 1.19 4.75 3.25" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function PaletteFieldIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden>
      <path d="M10 3.5c3.59 0 6.5 2.3 6.5 5.5 0 2.8-2.08 4.5-4.1 4.5h-.96a.84.84 0 0 0-.83.84c0 .46.22.8.22 1.31 0 .7-.5 1.35-1.42 1.35-3.55 0-6.44-2.5-6.44-5.91C2.97 6.09 6.01 3.5 10 3.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="6.25" cy="9" r=".85" fill="currentColor" />
      <circle cx="8.9" cy="6.8" r=".85" fill="currentColor" />
      <circle cx="12" cy="6.8" r=".85" fill="currentColor" />
      <circle cx="13.9" cy="9.4" r=".85" fill="currentColor" />
    </svg>
  );
}
