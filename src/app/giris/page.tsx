import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [params, currentUser] = await Promise.all([searchParams, getCurrentUser()]);

  const candidate = firstValue(params.next);
  const nextPath = candidate.startsWith("/") ? candidate : "/panel";

  if (currentUser) {
    redirect(nextPath);
  }

  return (
    <div className="min-h-screen">
      <SiteHeader user={currentUser} />

      <main className="mx-auto w-full max-w-5xl px-4 pb-12 pt-8 sm:px-6">
        <LoginForm nextPath={nextPath} />
      </main>
    </div>
  );
}
