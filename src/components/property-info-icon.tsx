import type { PropertyInfoIconKey } from "@/lib/types";

export function PropertyInfoIcon({ icon }: { icon: PropertyInfoIconKey }) {
  switch (icon) {
    case "commission":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M12 4.5 6 7.5v5.25c0 3.25 2.33 6.2 6 6.75 3.67-.55 6-3.5 6-6.75V7.5l-6-3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M9.75 12h4.5M12 9.75v4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "location":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M12 20.25s5.25-4.7 5.25-9a5.25 5.25 0 1 0-10.5 0c0 4.3 5.25 9 5.25 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <circle cx="12" cy="11.25" r="1.8" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "building":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M5.25 19.5V6.75a1.5 1.5 0 0 1 1.5-1.5h4.5a1.5 1.5 0 0 1 1.5 1.5V19.5M13.5 19.5v-9a1.5 1.5 0 0 1 1.5-1.5h2.25a1.5 1.5 0 0 1 1.5 1.5v9" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M8.25 8.25h1.5M8.25 11.25h1.5M8.25 14.25h1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "rooms":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M4.5 13.5h15v4.5M4.5 18v-7.5A1.5 1.5 0 0 1 6 9h12a1.5 1.5 0 0 1 1.5 1.5V18" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M7.5 13.5v-1.5A1.5 1.5 0 0 1 9 10.5h2.25a1.5 1.5 0 0 1 1.5 1.5v1.5" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    case "bath":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M6.75 10.5V8.25a2.25 2.25 0 1 1 4.5 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4.5 12h15v1.5A4.5 4.5 0 0 1 15 18H9a4.5 4.5 0 0 1-4.5-4.5V12Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          <path d="M17.25 9.75v2.25" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "pool":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M6.75 9V6.75a2.25 2.25 0 1 1 4.5 0V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.75 15c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M3.75 18c1.5 0 1.5-1.5 3-1.5s1.5 1.5 3 1.5 1.5-1.5 3-1.5 1.5 1.5 3 1.5 1.5-1.5 3-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "calendar":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M6 5.25v3M18 5.25v3M4.5 9h15M6.75 19.5h10.5a1.5 1.5 0 0 0 1.5-1.5v-9a1.5 1.5 0 0 0-1.5-1.5H6.75a1.5 1.5 0 0 0-1.5 1.5v9a1.5 1.5 0 0 0 1.5 1.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      );
    case "plane":
      return <span aria-hidden className="text-[1.35rem] leading-none">✈</span>;
    case "beach":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M6 9.75a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M12 9.75V18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M8.25 20.25h7.5M4.5 16.5c1.2 0 1.2 1.5 2.4 1.5s1.2-1.5 2.4-1.5 1.2 1.5 2.4 1.5 1.2-1.5 2.4-1.5 1.2 1.5 2.4 1.5 1.2-1.5 2.4-1.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "area":
      return (
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
          <path d="M6.75 6.75h3m4.5 0h3m-10.5 10.5h3m4.5 0h3m-10.5-10.5v3m0 4.5v3m10.5-10.5v3m0 4.5v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <rect x="9" y="9" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      );
    default:
      return null;
  }
}
