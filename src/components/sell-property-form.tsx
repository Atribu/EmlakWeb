"use client";

import { FormEvent, useMemo, useState } from "react";

import { useSitePreferences } from "@/components/use-site-preferences";
import {
  sellPropertyFormCopy,
  translateCompoundOption,
  translateFloorLabel,
  translatePropertyType,
  translateRoomLabel,
  translateSellerSubType,
} from "@/lib/site-copy";

type SellPropertyFormProps = {
  cityDistrictMap: Record<string, string[]>;
  defaultIntent?: string;
};

type SubmitState =
  | { type: "idle" }
  | { type: "loading" }
  | { type: "success"; message: string }
  | { type: "error"; message: string };

const propertyTypes = ["Daire", "Villa", "Rezidans", "Ticari Gayrimenkul", "Arsa"];
const subTypes = ["Lüks", "Yeni Proje", "Müstakil", "Dublex", "Bahçeli", "Yatırımlık"];
const roomOptions = ["Stüdyo", "1+1", "2+1", "3+1", "4+1", "5+1", "6+1+"];
const buildingAgeOptions = ["0", "1-3", "4-7", "8-12", "13-20", "20+"];
const floorOptions = ["Giriş", "1", "2", "3", "4", "5", "6", "7+"];
const compoundOptions = ["Evet", "Hayır", "Kısmen"];

export function SellPropertyForm({ cityDistrictMap, defaultIntent = "sat" }: SellPropertyFormProps) {
  const { language } = useSitePreferences();
  const copy = sellPropertyFormCopy(language);
  const cities = useMemo(() => Object.keys(cityDistrictMap).sort((a, b) => a.localeCompare(b, "tr")), [cityDistrictMap]);
  const [selectedCity, setSelectedCity] = useState(cities[0] ?? "");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [status, setStatus] = useState<SubmitState>({ type: "idle" });

  const districtOptions = useMemo(
    () => (selectedCity ? cityDistrictMap[selectedCity] ?? [] : []),
    [cityDistrictMap, selectedCity],
  );

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    setStatus({ type: "loading" });

    const response = await fetch("/api/seller-leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        city: data.get("city"),
        district: data.get("district"),
        neighborhood: data.get("neighborhood"),
        propertyType: data.get("propertyType"),
        subType: data.get("subType"),
        areaM2: data.get("areaM2"),
        rooms: data.get("rooms"),
        buildingAge: data.get("buildingAge"),
        floor: data.get("floor"),
        inCompound: data.get("inCompound"),
        preferredDateTime: data.get("preferredDateTime"),
        message: data.get("message"),
      }),
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { message?: string } | null;
      setStatus({
        type: "error",
        message: payload?.message ?? copy.fallbackError,
      });
      return;
    }

    const payload = (await response.json()) as { message: string };
    setStatus({ type: "success", message: payload.message });
    form.reset();
    setSelectedCity(cities[0] ?? "");
    setSelectedDistrict("");
  }

  return (
    <section className="luxury-card p-5 sm:p-7">
      <span className="section-kicker">{copy.kicker}</span>
      <h2 className="mt-3 text-[2rem] leading-none font-semibold text-[#1f1a14]">
        {copy.title}
      </h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-[#665c4f]">
        {defaultIntent === "degerleme"
          ? copy.valuationBody
          : copy.saleBody}
      </p>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.35fr]">
          <div className="grid gap-3">
            <input required name="name" placeholder={copy.name} className="input" />
            <input required name="phone" placeholder={copy.phone} className="input" />
            <input required type="email" name="email" placeholder={copy.email} className="input" />
          </div>

          <textarea
            required
            name="message"
            rows={6}
            placeholder={copy.message}
            className="input min-h-[11.5rem] resize-none"
            defaultValue={
              defaultIntent === "degerleme"
                ? copy.defaultValuationMessage
                : undefined
            }
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.cityLabel}
            <select
              required
              name="city"
              value={selectedCity}
              onChange={(event) => {
                setSelectedCity(event.target.value);
                setSelectedDistrict("");
              }}
              className="input"
            >
              <option value="">{copy.cityPlaceholder}</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.districtLabel}
            <select
              required
              name="district"
              className="input"
              value={selectedDistrict}
              onChange={(event) => setSelectedDistrict(event.target.value)}
            >
              <option value="">{copy.districtPlaceholder}</option>
              {districtOptions.map((district) => (
                <option key={`${selectedCity}-${district}`} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.neighborhoodLabel}
            <input name="neighborhood" placeholder={copy.neighborhoodPlaceholder} className="input" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.propertyTypeLabel}
            <select required name="propertyType" className="input" defaultValue="">
              <option value="">{copy.propertyTypePlaceholder}</option>
              {propertyTypes.map((item) => (
                <option key={item} value={item}>
                  {translatePropertyType(item, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.subTypeLabel}
            <select name="subType" className="input" defaultValue="">
              <option value="">{copy.propertyTypePlaceholder}</option>
              {subTypes.map((item) => (
                <option key={item} value={item}>
                  {translateSellerSubType(item, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.areaLabel}
            <input name="areaM2" type="number" min={0} placeholder={copy.areaPlaceholder} className="input" />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.roomsLabel}
            <select name="rooms" className="input" defaultValue="">
              <option value="">{copy.roomsPlaceholder}</option>
              {roomOptions.map((item) => (
                <option key={item} value={item}>
                  {translateRoomLabel(item, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.buildingAgeLabel}
            <select name="buildingAge" className="input" defaultValue="">
              <option value="">{copy.buildingAgePlaceholder}</option>
              {buildingAgeOptions.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.floorLabel}
            <select name="floor" className="input" defaultValue="">
              <option value="">{copy.floorPlaceholder}</option>
              {floorOptions.map((item) => (
                <option key={item} value={item}>
                  {translateFloorLabel(item, language)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <label className="grid gap-2 text-sm font-semibold text-[#2c241b]">
            {copy.compoundLabel}
            <select name="inCompound" className="input" defaultValue="">
              <option value="">{copy.compoundPlaceholder}</option>
              {compoundOptions.map((item) => (
                <option key={item} value={item}>
                  {translateCompoundOption(item, language)}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold text-[#2c241b] md:col-span-2">
            {copy.dateTimeLabel}
            <input
              name="preferredDateTime"
              type="datetime-local"
              className="input"
            />
          </label>
        </div>

        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm">
            {status.type === "success" ? <p className="text-emerald-700">{status.message}</p> : null}
            {status.type === "error" ? <p className="text-rose-700">{status.message}</p> : null}
            {status.type === "idle" ? (
              <p className="text-[#756b5d]">{copy.idleMessage}</p>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={status.type === "loading"}
            className="cursor-pointer rounded-full bg-[#d91f2d] px-7 py-3 text-sm font-semibold tracking-[0.08em] text-white uppercase transition hover:bg-[#bc1422] disabled:cursor-not-allowed disabled:bg-[#c88b92]"
          >
            {status.type === "loading" ? copy.submitting : copy.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
