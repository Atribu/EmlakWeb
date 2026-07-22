import Image from "next/image";

type BrandLogoProps = {
  inverse?: boolean;
  compact?: boolean;
  className?: string;
};

export function BrandLogo({ inverse = false, compact = false, className = "" }: BrandLogoProps) {
  const markClassName = compact ? "h-14 w-[4.35rem] sm:h-16 sm:w-20" : "h-16 w-20 sm:h-20 sm:w-24";
  const titleClassName = compact ? "text-[1.15rem] sm:text-[1.42rem]" : "text-[1.45rem] sm:text-[1.85rem]";
  const subtitleClassName = compact ? "text-[0.55rem] sm:text-[0.68rem]" : "text-[0.68rem] sm:text-[0.82rem]";

  return (
    <span
      className={`inline-flex items-center gap-2.5 leading-none ${inverse ? "rounded-xl bg-white/95 px-2.5 py-1.5" : ""} ${className}`}
      aria-label="RODINA Invest Co."
    >
      <Image
        src="/brand/rodina-mark.webp"
        alt=""
        width={420}
        height={311}
        priority
        className={`${markClassName} shrink-0 object-contain`}
      />
      <span className="flex min-w-0 flex-col justify-center">
        <span
          className={`${titleClassName} font-semibold tracking-[0.22em] text-[var(--brand-ink)]`}
        >
          RODINA
        </span>
        <span
          className={`${subtitleClassName} mt-1 font-medium tracking-[0.36em] text-[var(--brand-ink)]`}
        >
          INVEST CO.
        </span>
      </span>
    </span>
  );
}
