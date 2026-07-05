import { z } from "zod";
import { idSchema, optionalDay, optionalText, requiredMoney, requiredText } from "@/features/finance/schema-utils";

const expenseCategoryValues = [
  "rent",
  "groceries",
  "electricity",
  "water",
  "internet",
  "phone",
  "natural_gas",
  "fuel",
  "insurance",
  "education",
  "health",
  "other",
] as const;

export const expenseSchema = z.object({
  name: requiredText("Gider adı"),
  category: z.enum(expenseCategoryValues, { error: "Kategori seçilmelidir." }),
  amountKurus: requiredMoney("Tutar"),
  dueDay: optionalDay("Son ödeme günü"),
  isFixed: z.preprocess((value) => value === "on" || value === "true" || value === true, z.boolean()),
  notes: optionalText(300),
});

export const updateExpenseSchema = expenseSchema.extend({
  id: idSchema,
});

export const deleteExpenseSchema = z.object({
  id: idSchema,
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
