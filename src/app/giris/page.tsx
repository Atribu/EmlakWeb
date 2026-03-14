import { redirect } from "next/navigation";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LegacyLoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const nextParam = firstValue(params.next);
  const safeNext = nextParam.startsWith("/") ? nextParam : "/yonetim-ofisi";

  redirect(`/yetkili-giris?next=${encodeURIComponent(safeNext)}`);
}
