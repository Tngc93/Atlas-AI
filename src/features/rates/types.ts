export type InterestRateSnapshot = {
  source: "TCMB" | "mock" | "cache" | "fallback";
  providerStatus: "fresh" | "cached" | "stale" | "fallback" | "failed";
  country: "TR";
  currency: "TRY";
  effectiveDate: string;
  rateType: "credit_card";
  referenceRate?: number;
  maxContractualRate?: number;
  maxOverdueRate?: number;
  rawSourceUrl: string;
  retrievedAt: string;
  isStale?: boolean;
  note?: string;
};

export type InterestRateProvider = {
  fetchLatest: () => Promise<InterestRateSnapshot>;
};

export type InterestRateSource =
  | "manual"
  | "tcmb_contractual"
  | "tcmb_overdue"
  | "cached_contractual"
  | "cached_overdue"
  | "fallback_contractual"
  | "fallback_overdue"
  | "missing";

export type ResolvedInterestRate = {
  monthlyRate: number;
  source: InterestRateSource;
  resolvedAt: string;
  note?: string;
  snapshot?: InterestRateSnapshot;
};
