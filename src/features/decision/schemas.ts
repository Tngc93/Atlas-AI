import { z } from "zod";
import { optionalMoney } from "@/features/finance/schema-utils";
import type { DecisionScenarioType } from "./types";

export const decisionScenarioTypes = [
  "extra_debt_payment",
  "salary_increase",
  "one_time_bonus",
  "reduce_expenses_percent",
  "specific_debt_payment",
  "no_extra_payment",
] as const satisfies readonly DecisionScenarioType[];

export const decisionScenarioSchema = z
  .object({
    type: z.enum(decisionScenarioTypes, { error: "Senaryo türü seçilmelidir." }),
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
    debtAccountId: z.preprocess(
      (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
      z.string().trim().optional(),
    ),
  })
  .superRefine((data, ctx) => {
    if (
      ["extra_debt_payment", "salary_increase", "one_time_bonus", "specific_debt_payment"].includes(data.type) &&
      typeof data.amountKurus !== "number"
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Bu senaryo için TL tutarı girilmelidir.",
        path: ["amountKurus"],
      });
    }

    if (data.type === "reduce_expenses_percent" && typeof data.percent !== "number") {
      ctx.addIssue({
        code: "custom",
        message: "Bu senaryo için gider azaltma yüzdesi girilmelidir.",
        path: ["percent"],
      });
    }

    if (data.type === "specific_debt_payment" && !data.debtAccountId) {
      ctx.addIssue({
        code: "custom",
        message: "Belirli borç ödemesi için aktif borç seçilmelidir.",
        path: ["debtAccountId"],
      });
    }
  });

export type DecisionScenarioFormInput = z.infer<typeof decisionScenarioSchema>;
