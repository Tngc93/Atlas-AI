import { z } from "zod";
import { idSchema, optionalDay, optionalText, requiredMoney } from "@/features/finance/schema-utils";

export const profileIncomeSchema = z.object({
  monthlySalaryKurus: requiredMoney("Aylık maaş"),
  survivalThresholdKurus: requiredMoney("Hayatta kalma eşiği", 0),
  salaryDay: optionalDay("Maaş günü"),
});

export const salaryRecordSchema = z.object({
  amountKurus: requiredMoney("Maaş tutarı"),
  salaryDay: optionalDay("Maaş günü"),
  effectiveDate: z
    .string()
    .trim()
    .min(1, "Geçerlilik tarihi zorunludur.")
    .refine((value) => !Number.isNaN(Date.parse(value)), "Geçerlilik tarihi geçerli olmalı."),
  notes: optionalText(300),
});

export const updateSalaryRecordSchema = salaryRecordSchema.extend({
  id: idSchema,
});

export const deleteSalaryRecordSchema = z.object({
  id: idSchema,
});

export type ProfileIncomeInput = z.infer<typeof profileIncomeSchema>;
export type SalaryRecordInput = z.infer<typeof salaryRecordSchema>;
export type UpdateSalaryRecordInput = z.infer<typeof updateSalaryRecordSchema>;
