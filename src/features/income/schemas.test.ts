import { describe, expect, it } from "vitest";
import { profileIncomeSchema, salaryRecordSchema } from "./schemas";

describe("income validation schemas", () => {
  it("validates current income and converts TL to kurus", () => {
    const parsed = profileIncomeSchema.parse({
      monthlySalaryKurus: "85.000,50",
      survivalThresholdKurus: "12.000,25",
      salaryDay: "1",
    });

    expect(parsed.monthlySalaryKurus).toBe(8_500_050);
    expect(parsed.survivalThresholdKurus).toBe(1_200_025);
    expect(parsed.salaryDay).toBe(1);
  });

  it("treats Turkish thousands separators as TL grouping", () => {
    const parsed = salaryRecordSchema.parse({
      amountKurus: "80.000",
      salaryDay: "",
      effectiveDate: "2026-07-01",
      notes: "",
    });

    expect(parsed.amountKurus).toBe(8_000_000);
  });

  it("rejects invalid salary day", () => {
    const parsed = salaryRecordSchema.safeParse({
      amountKurus: "75000",
      salaryDay: "40",
      effectiveDate: "2026-07-01",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.salaryDay?.[0]).toBe("Maaş günü 1 ile 31 arasında olmalı.");
  });
});
