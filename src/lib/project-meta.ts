import type { Property } from "@/lib/types";

type ProjectMeta = {
  paymentPlan: string;
  deliveryDate: string;
  launchType: "Proje" | "Hazır Tapu";
};

const metaPool: ProjectMeta[] = [
  { paymentPlan: "60/40", deliveryDate: "Q4 2028", launchType: "Proje" },
  { paymentPlan: "50/50", deliveryDate: "Q2 2029", launchType: "Proje" },
  { paymentPlan: "10/40/50", deliveryDate: "Q1 2028", launchType: "Proje" },
  { paymentPlan: "Peşin + Kredi", deliveryDate: "Hemen Teslim", launchType: "Hazır Tapu" },
  { paymentPlan: "70/30", deliveryDate: "Q3 2027", launchType: "Proje" },
];

function indexFromRef(listingRef: string): number {
  const numeric = Number(listingRef.replace(/[^0-9]/g, ""));
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return 0;
  }

  return numeric - 1;
}

export function getProjectMeta(property: Property): ProjectMeta {
  const index = indexFromRef(property.listingRef);
  return metaPool[index % metaPool.length] ?? metaPool[0]!;
}
