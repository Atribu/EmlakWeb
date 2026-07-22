import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { privatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = privatePageMetadata("Panel | RODINA Invest Co.");

export default function LegacyPanelPage() {
  redirect("/yonetim-ofisi");
}
