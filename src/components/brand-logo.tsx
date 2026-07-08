type BrandLogoProps = {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ inverse = false, compact = false, className = "" }: BrandLogoProps) {
  return (
    <span
      className={`inline-flex items-center gap-[0.32em] leading-none ${inverse ? "text-white" : "text-[var(--brand-ink)]"} ${className}`}
      aria-label="Econi Invest"
    >
      <span className="font-normal tracking-normal">Econi.</span>
      <span
        className="relative inline-block shrink-0"
        style={{
          width: compact ? "0.68em" : "0.72em",
          height: compact ? "0.68em" : "0.72em",
          backgroundColor: "var(--brand-green)",
        }}
        aria-hidden
      >
        <span
          className="absolute bg-white"
          style={{
            right: "0.12em",
            bottom: "0.12em",
            width: "0.14em",
            height: "0.14em",
          }}
        />
      </span>
      <span className="font-normal tracking-normal">Invest</span>
    </span>
  );
}
