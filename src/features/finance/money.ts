export function formatTry(kurus: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    maximumFractionDigits: 0,
  }).format(kurus / 100);
}

export function liraToKurus(value: number): number {
  return Math.round(value * 100);
}

export function kurusToLira(kurus: number): number {
  return Math.round(kurus / 100);
}

export function formatPercent(value: number): string {
  return new Intl.NumberFormat("tr-TR", {
    style: "percent",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value / 100);
}
