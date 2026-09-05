import type { SiteLanguage } from "@/lib/site-preferences";

type LocationKind = "country" | "city";

type LocationTranslation = Record<SiteLanguage, string>;

type LocationDefinition = {
  aliases?: string[];
  labels: LocationTranslation;
};

const countryDefinitions: LocationDefinition[] = [
  {
    aliases: ["Turkey", "Turkiye", "Türkiye Cumhuriyeti"],
    labels: { TR: "Türkiye", EN: "Turkey", RU: "Турция", AR: "تركيا" },
  },
  {
    aliases: ["BAE", "UAE", "United Arab Emirates"],
    labels: { TR: "Birleşik Arap Emirlikleri", EN: "United Arab Emirates", RU: "ОАЭ", AR: "الإمارات العربية المتحدة" },
  },
  {
    aliases: ["Qatar"],
    labels: { TR: "Katar", EN: "Qatar", RU: "Катар", AR: "قطر" },
  },
  {
    aliases: ["Saudi Arabia"],
    labels: { TR: "Suudi Arabistan", EN: "Saudi Arabia", RU: "Саудовская Аравия", AR: "المملكة العربية السعودية" },
  },
  {
    aliases: ["KKTC", "Kıbrıs", "Kuzey Kıbrıs Türk Cumhuriyeti", "TRNC", "North Cyprus", "Northern Cyprus"],
    labels: { TR: "Kuzey Kıbrıs", EN: "Northern Cyprus", RU: "Северный Кипр", AR: "شمال قبرص" },
  },
  {
    aliases: ["Birleşik Krallık", "United Kingdom", "UK"],
    labels: { TR: "İngiltere", EN: "United Kingdom", RU: "Великобритания", AR: "المملكة المتحدة" },
  },
  {
    aliases: ["Germany", "Deutschland"],
    labels: { TR: "Almanya", EN: "Germany", RU: "Германия", AR: "ألمانيا" },
  },
  {
    aliases: ["Russia", "Russian Federation"],
    labels: { TR: "Rusya", EN: "Russia", RU: "Россия", AR: "روسيا" },
  },
];

const cityLabels: Array<[string, string, string?, string?]> = [
  ["Adana", "Адана"],
  ["Adıyaman", "Адыяман"],
  ["Afyonkarahisar", "Афьонкарахисар"],
  ["Ağrı", "Агры"],
  ["Amasya", "Амасья"],
  ["Ankara", "Анкара", "Ankara", "أنقرة"],
  ["Antalya", "Анталья", "Antalya", "أنطاليا"],
  ["Artvin", "Артвин"],
  ["Aydın", "Айдын"],
  ["Balıkesir", "Балыкесир"],
  ["Bilecik", "Биледжик"],
  ["Bingöl", "Бингёль"],
  ["Bitlis", "Битлис"],
  ["Bolu", "Болу"],
  ["Burdur", "Бурдур"],
  ["Bursa", "Бурса", "Bursa", "بورصة"],
  ["Çanakkale", "Чанаккале"],
  ["Çankırı", "Чанкыры"],
  ["Çorum", "Чорум"],
  ["Denizli", "Денизли"],
  ["Diyarbakır", "Диярбакыр"],
  ["Edirne", "Эдирне"],
  ["Elazığ", "Элязыг"],
  ["Erzincan", "Эрзинджан"],
  ["Erzurum", "Эрзурум"],
  ["Eskişehir", "Эскишехир"],
  ["Gaziantep", "Газиантеп"],
  ["Giresun", "Гиресун"],
  ["Gümüşhane", "Гюмюшхане"],
  ["Hakkari", "Хаккяри"],
  ["Hatay", "Хатай"],
  ["Isparta", "Ыспарта"],
  ["Mersin", "Мерсин"],
  ["İstanbul", "Стамбул", "Istanbul", "إسطنبول"],
  ["İzmir", "Измир", "Izmir", "إزمير"],
  ["Kars", "Карс"],
  ["Kastamonu", "Кастамону"],
  ["Kayseri", "Кайсери"],
  ["Kırklareli", "Кыркларели"],
  ["Kırşehir", "Кыршехир"],
  ["Kocaeli", "Коджаэли"],
  ["Konya", "Конья"],
  ["Kütahya", "Кютахья"],
  ["Malatya", "Малатья"],
  ["Manisa", "Маниса"],
  ["Kahramanmaraş", "Кахраманмараш"],
  ["Mardin", "Мардин"],
  ["Muğla", "Мугла", "Mugla", "موغلا"],
  ["Muş", "Муш"],
  ["Nevşehir", "Невшехир"],
  ["Niğde", "Нигде"],
  ["Ordu", "Орду"],
  ["Rize", "Ризе"],
  ["Sakarya", "Сакарья"],
  ["Samsun", "Самсун"],
  ["Siirt", "Сиирт"],
  ["Sinop", "Синоп"],
  ["Sivas", "Сивас"],
  ["Tekirdağ", "Текирдаг"],
  ["Tokat", "Токат"],
  ["Trabzon", "Трабзон"],
  ["Tunceli", "Тунджели"],
  ["Şanlıurfa", "Шанлыурфа"],
  ["Uşak", "Ушак"],
  ["Van", "Ван"],
  ["Yozgat", "Йозгат"],
  ["Zonguldak", "Зонгулдак"],
  ["Aksaray", "Аксарай"],
  ["Bayburt", "Байбурт"],
  ["Karaman", "Караман"],
  ["Kırıkkale", "Кырыккале"],
  ["Batman", "Батман"],
  ["Şırnak", "Шырнак"],
  ["Bartın", "Бартын"],
  ["Ardahan", "Ардахан"],
  ["Iğdır", "Ыгдыр"],
  ["Yalova", "Ялова"],
  ["Karabük", "Карабюк"],
  ["Kilis", "Килис"],
  ["Osmaniye", "Османие"],
  ["Düzce", "Дюздже"],
  ["Lefkoşa", "Никосия", "Nicosia", "نيقوسيا"],
  ["Girne", "Кирения", "Kyrenia", "كيرينيا"],
  ["Gazimağusa", "Фамагуста", "Famagusta", "فاماغوستا"],
  ["İskele", "Искеле", "Iskele", "إسكله"],
  ["Dubai", "Дубай", "Dubai", "دبي"],
  ["Abu Dhabi", "Абу-Даби", "Abu Dhabi", "أبو ظبي"],
  ["Doha", "Доха", "Doha", "الدوحة"],
  ["Riyad", "Эр-Рияд", "Riyadh", "الرياض"],
  ["Cidde", "Джидда", "Jeddah", "جدة"],
  ["Londra", "Лондон", "London", "لندن"],
  ["Berlin", "Берлин", "Berlin", "برلين"],
  ["Münih", "Мюнхен", "Munich", "ميونخ"],
  ["Moskova", "Москва", "Moscow", "موسكو"],
  ["St. Petersburg", "Санкт-Петербург", "Saint Petersburg", "سانت بطرسبرغ"],
];

const cityDefinitions: LocationDefinition[] = cityLabels.map(([tr, ru, en = tr, ar = tr]) => ({
  labels: { TR: tr, EN: en, RU: ru, AR: ar },
}));

export function normalizeLocationKey(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("tr-TR")
    .replace(/ı/g, "i")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/&/g, " ve ")
    .replace(/[^\p{Letter}\p{Number}]+/gu, " ")
    .trim();
}

function buildDefinitionMap(definitions: LocationDefinition[]) {
  const output = new Map<string, LocationDefinition>();

  for (const definition of definitions) {
    const names = [...Object.values(definition.labels), ...(definition.aliases ?? [])];
    for (const name of names) {
      output.set(normalizeLocationKey(name), definition);
    }
  }

  return output;
}

const countryDefinitionMap = buildDefinitionMap(countryDefinitions);
const cityDefinitionMap = buildDefinitionMap(cityDefinitions);

function definitionFor(value: string, kind: LocationKind) {
  const definitions = kind === "country" ? countryDefinitionMap : cityDefinitionMap;
  return definitions.get(normalizeLocationKey(value));
}

export function canonicalLocationName(value: string, kind: LocationKind): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  return definitionFor(cleaned, kind)?.labels.TR ?? cleaned;
}

export function locationsMatch(left: string, right: string, kind: LocationKind): boolean {
  return normalizeLocationKey(canonicalLocationName(left, kind)) === normalizeLocationKey(canonicalLocationName(right, kind));
}

export function isCountryLikeCityValue(value: string): boolean {
  return countryDefinitionMap.has(normalizeLocationKey(value));
}

export function uniqueLocationValues(values: string[], kind: LocationKind): string[] {
  const uniqueValues = new Map<string, string>();

  for (const value of values) {
    const canonicalValue = canonicalLocationName(value, kind);
    if (!canonicalValue || (kind === "city" && isCountryLikeCityValue(canonicalValue))) {
      continue;
    }

    const key = normalizeLocationKey(canonicalValue);
    if (!uniqueValues.has(key)) {
      uniqueValues.set(key, canonicalValue);
    }
  }

  return Array.from(uniqueValues.values()).sort((left, right) => left.localeCompare(right, "tr"));
}

const russianCharacterMap: Record<string, string> = {
  a: "а", b: "б", c: "дж", ç: "ч", d: "д", e: "е", f: "ф", g: "г", ğ: "г",
  h: "х", ı: "ы", i: "и", j: "ж", k: "к", l: "л", m: "м", n: "н", o: "о",
  ö: "ё", p: "п", r: "р", s: "с", ş: "ш", t: "т", u: "у", ü: "ю", v: "в",
  y: "й", z: "з",
};

function transliterateToRussian(value: string): string {
  return Array.from(value).map((character) => {
    const replacement = russianCharacterMap[character.toLocaleLowerCase("tr-TR")];
    if (!replacement) {
      return character;
    }

    return character === character.toLocaleUpperCase("tr-TR")
      ? replacement.charAt(0).toLocaleUpperCase("ru-RU") + replacement.slice(1)
      : replacement;
  }).join("");
}

export function translateLocationName(value: string, language: SiteLanguage, kind: LocationKind): string {
  const cleaned = value.trim().replace(/\s+/g, " ");
  const definition = definitionFor(cleaned, kind);
  if (definition) {
    return definition.labels[language];
  }

  if (language === "RU") {
    return transliterateToRussian(cleaned);
  }

  return cleaned;
}

export function translateCountryName(value: string, language: SiteLanguage): string {
  return translateLocationName(value, language, "country");
}

export function translateCityName(value: string, language: SiteLanguage): string {
  return translateLocationName(value, language, "city");
}
