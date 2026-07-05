import { describe, expect, it } from "vitest";
import { parseTCMBCreditCardRates } from "./tcmb-provider";

describe("TCMB credit card rate parser", () => {
  it("extracts TCMB-style rate fields from HTML", () => {
    const html = `
      <td>Referans Oran (%)</td><td>%3,11</td>
      <td>Azami Akdi Faiz Oranı (%)</td><td>4,25</td>
      <td>Azami Gecikme Faiz Oranı (%)</td><td>4,55</td>
    `;

    expect(parseTCMBCreditCardRates(html)).toEqual({
      referenceRate: 3.11,
      maxContractualRate: 4.25,
      maxOverdueRate: 4.55,
    });
  });
});
