import type { InterestRateProvider, InterestRateSnapshot } from "./types";

export const TCMB_CREDIT_CARD_RATES_URL =
  "https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Bankacilik+Verileri/Kredi_Karti_Islemlerinde_Uygulanacak_Azami_Faiz_Oranlari";

export const sampleInterestRateSnapshot: InterestRateSnapshot = {
  source: "fallback",
  providerStatus: "fallback",
  country: "TR",
  currency: "TRY",
  effectiveDate: "Örnek güncel dönem",
  rateType: "credit_card",
  referenceRate: 3.11,
  maxContractualRate: 4.25,
  maxOverdueRate: 4.55,
  rawSourceUrl: TCMB_CREDIT_CARD_RATES_URL,
  retrievedAt: new Date("2026-07-01T09:00:00.000Z").toISOString(),
  isStale: true,
  note: "Örnek TCMB biçimli veri. Ağ erişimini etkinleştirdikten veya sağlayıcıyı yerel veritabanı önbelleğine bağladıktan sonra yenileyin.",
};

function parsePercentAfterLabel(html: string, label: string): number | undefined {
  const labelIndex = html.toLocaleLowerCase("tr-TR").indexOf(label.toLocaleLowerCase("tr-TR"));
  if (labelIndex === -1) {
    return undefined;
  }

  const window = html.slice(labelIndex, labelIndex + 900);
  const match = window.match(/%?\s*(\d{1,2}(?:[,.]\d{1,2})?)/);
  return match ? Number(match[1].replace(",", ".")) : undefined;
}

export function parseTCMBCreditCardRates(html: string): Partial<InterestRateSnapshot> {
  const parsed = {
    referenceRate: parsePercentAfterLabel(html, "Referans Oran"),
    maxContractualRate: parsePercentAfterLabel(html, "Azami Akdi Faiz Oranı"),
    maxOverdueRate: parsePercentAfterLabel(html, "Azami Gecikme Faiz Oranı"),
  };

  return Object.fromEntries(
    Object.entries(parsed).filter(([, value]) => typeof value === "number" && value > 0 && value <= 10),
  );
}

export class TCMBInterestRateProvider implements InterestRateProvider {
  async fetchLatest(): Promise<InterestRateSnapshot> {
    try {
      const response = await fetch(TCMB_CREDIT_CARD_RATES_URL, {
        next: { revalidate: 60 * 60 * 12 },
      });

      if (!response.ok) {
        throw new Error(`TCMB request failed with ${response.status}`);
      }

      const html = await response.text();
      const parsed = parseTCMBCreditCardRates(html);
      const hasUsableRates =
        typeof parsed.referenceRate === "number" ||
        typeof parsed.maxContractualRate === "number" ||
        typeof parsed.maxOverdueRate === "number";

      if (!hasUsableRates) {
        return {
          ...sampleInterestRateSnapshot,
          retrievedAt: new Date().toISOString(),
          providerStatus: "failed",
          isStale: true,
          note: "TCMB sayfasına ulaşıldı ancak mevcut HTML yapısı güvenli biçimde ayrıştırılamadı. Örnek yedek veri kullanılıyor.",
        };
      }

      return {
        ...sampleInterestRateSnapshot,
        ...parsed,
        source: "TCMB",
        providerStatus: "fresh",
        effectiveDate: new Date().toLocaleDateString("tr-TR", {
          month: "long",
          year: "numeric",
        }),
        retrievedAt: new Date().toISOString(),
        isStale: false,
        note: "Resmi TCMB sayfasından alındı. Kullanıcılar yine de gerçek karta özel faiz oranını girmelidir.",
      };
    } catch {
      return {
        ...sampleInterestRateSnapshot,
        retrievedAt: new Date().toISOString(),
        providerStatus: "failed",
        isStale: true,
      };
    }
  }
}
