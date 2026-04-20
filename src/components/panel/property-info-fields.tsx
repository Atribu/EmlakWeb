import { PropertyInfoIcon } from "@/components/property-info-icon";
import { PROPERTY_INFO_FIELD_COUNT, PROPERTY_SPECIAL_INFO_OPTIONS } from "@/lib/property-info-items";
import type { PropertyInfoItem } from "@/lib/types";

type PropertyInfoFieldsProps = {
  defaultItems?: PropertyInfoItem[];
};

export function PropertyInfoFields({ defaultItems }: PropertyInfoFieldsProps) {
  return (
    <section className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 sm:p-5">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">İkonlu Bilgiler</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">Sadece ekstra özel bilgileri ekleyin</h3>
        <p className="mt-1 text-sm text-slate-600">
          Konum, oda, m² ve kat gibi temel bilgiler ilk alandan zaten ikonlu gösterilir. Burada sadece havalimanı,
          sahil, havuz, komisyon gibi ekstra bilgileri ekleyin.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        {Array.from({ length: PROPERTY_INFO_FIELD_COUNT }).map((_, index) => {
          const item = defaultItems?.[index];

          return (
            <div key={index} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-900">Bilgi Satırı {index + 1}</p>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Opsiyonel
                </span>
              </div>

              <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                <label className="cursor-pointer">
                  <input type="radio" name={`infoIcon_${index}`} value="" defaultChecked={!item?.icon} className="peer sr-only" />
                  <span className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-3 text-center text-sm font-medium text-slate-500 transition peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
                    İkon yok
                  </span>
                </label>

                {PROPERTY_SPECIAL_INFO_OPTIONS.map((option) => (
                  <label key={option.key} className="cursor-pointer">
                    <input
                      type="radio"
                      name={`infoIcon_${index}`}
                      value={option.key}
                      defaultChecked={item?.icon === option.key}
                      className="peer sr-only"
                    />
                    <span className="flex min-h-[88px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white px-3 text-center text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 peer-checked:border-slate-900 peer-checked:bg-slate-900 peer-checked:text-white">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-current/20 bg-current/5">
                        <PropertyInfoIcon icon={option.key} />
                      </span>
                      <span className="mt-2 text-xs font-semibold uppercase tracking-[0.12em]">{option.label}</span>
                    </span>
                  </label>
                ))}
              </div>

              <input
                name={`infoValue_${index}`}
                defaultValue={item?.value ?? ""}
                placeholder="Örn. 5+1, Antalya / Kaş, Özel Havuz, 1-5 km"
                className="input mt-4"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
