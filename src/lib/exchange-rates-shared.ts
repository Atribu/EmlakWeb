export type SupportedCurrency = "TRY" | "USD" | "EUR" | "GBP";

export type ExchangeRateTable = Record<SupportedCurrency, number>;

export type ExchangeRateSnapshot = {
  rates: ExchangeRateTable;
  updatedAt: string;
  source: "tcmb-forex-selling" | "fallback";
  sourceLabel: string;
};

export const DEFAULT_EXCHANGE_RATE_TABLE: ExchangeRateTable = {
  TRY: 1,
  USD: Number((1 / 0.031).toFixed(6)),
  EUR: Number((1 / 0.029).toFixed(6)),
  GBP: Number((1 / 0.025).toFixed(6)),
};

export const DEFAULT_EXCHANGE_RATE_SNAPSHOT: ExchangeRateSnapshot = {
  rates: DEFAULT_EXCHANGE_RATE_TABLE,
  updatedAt: "fallback",
  source: "fallback",
  sourceLabel: "Yerel yedek kur",
};

export function convertAmountBetweenCurrencies(
  amount: number,
  sourceCurrency: SupportedCurrency,
  targetCurrency: SupportedCurrency,
  exchangeRates: ExchangeRateTable = DEFAULT_EXCHANGE_RATE_TABLE,
): number {
  if (!Number.isFinite(amount)) {
    return 0;
  }

  if (sourceCurrency === targetCurrency) {
    return amount;
  }

  const safeRates = {
    ...DEFAULT_EXCHANGE_RATE_TABLE,
    ...exchangeRates,
    TRY: 1,
  };

  const amountInTry = sourceCurrency === "TRY" ? amount : amount * safeRates[sourceCurrency];
  return targetCurrency === "TRY" ? amountInTry : amountInTry / safeRates[targetCurrency];
}
