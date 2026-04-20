type BrandLogoMarkProps = {
  className?: string;
};

export function BrandLogoMark({ className = "" }: BrandLogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center rounded-[0.95rem] bg-[linear-gradient(135deg,var(--brand-primary)_0%,#315682_100%)] text-white shadow-[0_18px_34px_-26px_rgba(29,56,92,0.62)] ${className}`}
    >
      <svg viewBox="0 0 44 44" fill="none" className="h-[68%] w-[68%]">
        <path
          d="M13 31.5V15.8L22 10l9 5.8v15.7"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M17.5 31.5V21h9c3 0 5 1.9 5 4.6 0 2.8-2 4.8-5 4.8h-4.1"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M22.4 30.4 31 35"
          stroke="currentColor"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
