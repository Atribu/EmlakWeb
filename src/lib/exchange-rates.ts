import { unstable_cache } from "next/cache";

import {
  DEFAULT_EXCHANGE_RATE_SNAPSHOT,
  type ExchangeRateSnapshot,
  type ExchangeRateTable,
  type SupportedCurrency,
} from "@/lib/exchange-rates-shared";

const TCMB_TODAY_XML_URL = "https://www.tcmb.gov.tr/kurlar/today.xml";
const TRACKED_CURRENCIES: SupportedCurrency[] = ["USD", "EUR", "GBP"];

function extractTagValue(segment: string, tagName: string): string | undefined {
  const match = segment.match(new RegExp(`<${tagName}>([^<]+)</${tagName}>`, "i"));
  return match?.[1]?.trim();
}

function parseXmlNumber(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }

  const normalized = value.replace(",", ".").trim();
  const numeric = Number(normalized);
  return Number.isFinite(numeric) && numeric > 0 ? numeric : undefined;
}

function extractCurrencySegment(xml: string, currency: SupportedCurrency): string | undefined {
  const match = xml.match(new RegExp(`<Currency[^>]*CurrencyCode="${currency}"[^>]*>[\\s\\S]*?</Currency>`, "i"));
  return match?.[0];
}

function parseCurrencyRate(xml: string, currency: SupportedCurrency): number | undefined {
  const segment = extractCurrencySegment(xml, currency);

  if (!segment) {
    return undefined;
  }

  return parseXmlNumber(extractTagValue(segment, "ForexSelling"))
    ?? parseXmlNumber(extractTagValue(segment, "ForexBuying"));
}

async function loadExchangeRateSnapshot(): Promise<ExchangeRateSnapshot> {
  try {
    const response = await fetch(TCMB_TODAY_XML_URL, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`TCMB response ${response.status}`);
    }

    const xml = await response.text();
    const rates = TRACKED_CURRENCIES.reduce<ExchangeRateTable>(
      (accumulator, currency) => {
        const rate = parseCurrencyRate(xml, currency);

        if (!rate) {
          throw new Error(`Missing ${currency} rate`);
        }

        accumulator[currency] = rate;
        return accumulator;
      },
      {
        ...DEFAULT_EXCHANGE_RATE_SNAPSHOT.rates,
        TRY: 1,
      },
    );

    const date =
      extractTagValue(xml, "Date")
      ?? new Date().toISOString().slice(0, 10);

    return {
      rates,
      updatedAt: date,
      source: "tcmb-forex-selling",
      sourceLabel: "TCMB Forex Selling",
    };
  } catch {
    return {
      ...DEFAULT_EXCHANGE_RATE_SNAPSHOT,
      updatedAt: new Date().toISOString(),
    };
  }
}

const getCachedExchangeRateSnapshot = unstable_cache(loadExchangeRateSnapshot, ["tcmb-exchange-rates"], {
  revalidate: 3600,
});

export async function getExchangeRateSnapshot(): Promise<ExchangeRateSnapshot> {
  return getCachedExchangeRateSnapshot();
}
