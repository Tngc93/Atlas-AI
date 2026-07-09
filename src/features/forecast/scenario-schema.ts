import { z } from "zod";
import { optionalMoney } from "@/features/finance/schema-utils";
import type { ForecastScenarioType } from "./types";

export const forecastScenarioTypes = [
  "salary_increase",
  "salary_decrease",
  "expense_decrease",
  "expense_increase",
  "extra_debt_payment",
  "new_debt",
] as const satisfies readonly ForecastScenarioType[];

export const forecastScenarioSchema = z
  .object({
    type: z.enum(forecastScenarioTypes, { error: "Senaryo türü seçilmelidir." }),
    amountKurus: optionalMoney("Tutar"),
    percent: z.preprocess(
      (value) => {
        if (value === "" || value === null) {
          return undefined;
        }

        if (typeof value === "string") {
          return Number(value.trim().replace(",", "."));
        }

        return value;
      },
      z.coerce
        .number()
        .finite("Yüzde geçerli bir sayı olmalı.")
        .min(0, "Yüzde negatif olamaz.")
        .max(100, "Yüzde 100 değerinden yüksek olamaz.")
        .optional(),
    ),
    minimumPaymentKurus: optionalMoney("Minimum ödeme"),
    interestRateMonthly: z.preprocess(
      (value) => {
        if (value === "" || value === null) {
          return undefined;
        }

        if (typeof value === "string") {
          return Number(value.trim().replace(",", "."));
        }

        return value;
      },
      z.coerce.number().finite("Faiz oranı geçerli bir sayı olmalı.").min(0, "Faiz oranı negatif olamaz.").optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (["salary_increase", "salary_decrease", "extra_debt_payment", "new_debt"].includes(data.type) && typeof data.amountKurus !== "number") {
      ctx.addIssue({
        code: "custom",
        message: "Bu senaryo için TL tutarı girilmelidir.",
        path: ["amountKurus"],
      });
    }

    if (["expense_decrease", "expense_increase"].includes(data.type) && typeof data.percent !== "number") {
      ctx.addIssue({
        code: "custom",
        message: "Bu senaryo için yüzde girilmelidir.",
        path: ["percent"],
      });
    }

    if (data.type === "new_debt" && typeof data.minimumPaymentKurus !== "number") {
      ctx.addIssue({
        code: "custom",
        message: "Yeni borç senaryosu için minimum ödeme girilmelidir.",
        path: ["minimumPaymentKurus"],
      });
    }
  });

export type ForecastScenarioFormInput = z.infer<typeof forecastScenarioSchema>;
