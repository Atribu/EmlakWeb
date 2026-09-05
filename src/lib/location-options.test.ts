import assert from "node:assert/strict";
import test from "node:test";

import {
  locationsMatch,
  translateCityName,
  translateCountryName,
  uniqueLocationValues,
} from "@/lib/location-options";

test("city options are normalized, deduplicated, and exclude country values", () => {
  const cities = uniqueLocationValues(
    [" İstanbul ", "Istanbul", "İSTANBUL", "İzmir", "Izmir", "KKTC", "Kuzey Kıbrıs"],
    "city",
  );

  assert.deepEqual(cities, ["İstanbul", "İzmir"]);
});

test("country aliases use a single canonical option", () => {
  const countries = uniqueLocationValues(["Türkiye", "Turkey", "Turkiye", "UAE", "Birleşik Arap Emirlikleri"], "country");

  assert.deepEqual(countries, ["Birleşik Arap Emirlikleri", "Türkiye"]);
  assert.equal(locationsMatch("Turkey", "Türkiye", "country"), true);
});

test("country and city labels follow the selected language", () => {
  assert.equal(translateCityName("İstanbul", "RU"), "Стамбул");
  assert.equal(translateCityName("Izmir", "RU"), "Измир");
  assert.equal(translateCountryName("Türkiye", "RU"), "Турция");
  assert.equal(translateCountryName("Kuzey Kıbrıs", "EN"), "Northern Cyprus");
});
