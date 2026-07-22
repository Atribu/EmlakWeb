import Image from "next/image";

type BrandLogoMarkProps = {
  className?: string;
};

export function BrandLogoMark({ className = "" }: BrandLogoMarkProps) {
  return (
    <span
      aria-hidden
      className={`flex items-center justify-center overflow-hidden rounded-[0.95rem] bg-white shadow-[0_18px_34px_-26px_rgba(29,56,92,0.28)] ${className}`}
    >
      <Image
        src="/brand/rodina-mark.webp"
        alt=""
        width={420}
        height={311}
        className="h-[82%] w-[82%] object-contain"
      />
    </span>
  );
}
