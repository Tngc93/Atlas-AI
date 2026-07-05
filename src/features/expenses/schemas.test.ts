import { describe, expect, it } from "vitest";
import { expenseSchema } from "./schemas";

describe("expense validation schema", () => {
  it("accepts allowed Turkish expense categories and stores TL as kurus", () => {
    const parsed = expenseSchema.parse({
      name: "Elektrik faturası",
      category: "electricity",
      amountKurus: "1.250,50",
      dueDay: "20",
      isFixed: "on",
      notes: "",
    });

    expect(parsed.amountKurus).toBe(125_050);
    expect(parsed.isFixed).toBe(true);
  });

  it("rejects unknown categories", () => {
    const parsed = expenseSchema.safeParse({
      name: "Bilinmeyen gider",
      category: "not_allowed",
      amountKurus: "1000",
      dueDay: "",
      isFixed: "on",
      notes: "",
    });

    expect(parsed.success).toBe(false);
    expect(parsed.error?.flatten().fieldErrors.category?.[0]).toBe("Kategori seçilmelidir.");
  });
});
