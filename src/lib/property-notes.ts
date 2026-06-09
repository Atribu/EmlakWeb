import type { Property } from "@/lib/types";

export type PropertyNoteSummary = {
  adminOnly: boolean;
  count: number;
  key: "staffNotes" | "customerFeedbackNotes" | "adminCommissionNotes" | "adminPrivateNotes";
  label: string;
  preview: string;
};

const noteDefinitions: Array<{
  adminOnly: boolean;
  key: PropertyNoteSummary["key"];
  label: string;
}> = [
  {
    adminOnly: false,
    key: "staffNotes",
    label: "Çalışan Notu",
  },
  {
    adminOnly: false,
    key: "customerFeedbackNotes",
    label: "Müşteri Geri Dönüşü",
  },
  {
    adminOnly: true,
    key: "adminCommissionNotes",
    label: "Komisyon Notu",
  },
  {
    adminOnly: true,
    key: "adminPrivateNotes",
    label: "Yönetici Notu",
  },
];

export function splitPropertyNoteLines(value: string | undefined) {
  return (value ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export function buildPropertyNoteSummaries(
  property: Pick<
    Property,
    "staffNotes" | "customerFeedbackNotes" | "adminCommissionNotes" | "adminPrivateNotes"
  >,
  options: { includeAdmin?: boolean } = {},
): PropertyNoteSummary[] {
  const includeAdmin = options.includeAdmin ?? false;

  return noteDefinitions
    .filter((definition) => includeAdmin || !definition.adminOnly)
    .map((definition) => {
      const lines = splitPropertyNoteLines(property[definition.key]);

      return {
        adminOnly: definition.adminOnly,
        count: lines.length,
        key: definition.key,
        label: definition.label,
        preview: lines.at(-1) ?? "",
      };
    })
    .filter((summary) => summary.count > 0);
}
