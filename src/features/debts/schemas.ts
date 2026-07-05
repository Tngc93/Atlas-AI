import { z } from "zod";
import {
  idSchema,
  optionalDay,
  optionalMoney,
  optionalPercent,
  requiredDay,
  requiredMoney,
  requiredText,
} from "@/features/finance/schema-utils";

const debtTypeValues = ["credit_card", "personal_loan", "overdraft_account", "friend_debt", "other"] as const;
const debtStatusValues = ["active", "paused", "paid_off"] as const;

export const debtSchema = z
  .object({
    type: z.enum(debtTypeValues, { error: "Borç türü seçilmelidir." }),
    lender: requiredText("Banka veya alacaklı"),
    name: requiredText("Borç adı"),
    totalDebtKurus: requiredMoney("Toplam borç", 0),
    balanceKurus: requiredMoney("Kalan borç", 0),
    creditLimitKurus: optionalMoney("Kredi limiti"),
    interestRateMonthly: optionalPercent("Aylık faiz", 25),
    minimumPaymentKurus: requiredMoney("Minimum ödeme", 0),
    dueDay: requiredDay("Son ödeme günü"),
    statementDay: optionalDay("Hesap kesim günü"),
    installmentCount: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int("Taksit sayısı tam sayı olmalı.").min(1, "Taksit sayısı en az 1 olmalı.").optional(),
    ),
    remainingInstallments: z.preprocess(
      (value) => (value === "" || value === null ? undefined : value),
      z.coerce.number().int("Kalan taksit tam sayı olmalı.").min(0, "Kalan taksit negatif olamaz.").optional(),
    ),
    status: z.enum(debtStatusValues, { error: "Durum seçilmelidir." }),
  })
  .refine((data) => data.balanceKurus <= data.totalDebtKurus, {
    message: "Kalan borç toplam borçtan büyük olamaz.",
    path: ["balanceKurus"],
  })
  .refine((data) => data.minimumPaymentKurus <= data.balanceKurus, {
    message: "Minimum ödeme kalan borçtan büyük olamaz.",
    path: ["minimumPaymentKurus"],
  })
  .refine(
    (data) =>
      data.installmentCount === undefined ||
      data.remainingInstallments === undefined ||
      data.remainingInstallments <= data.installmentCount,
    {
      message: "Kalan taksit toplam taksit sayısından büyük olamaz.",
      path: ["remainingInstallments"],
    },
  );

export const updateDebtSchema = debtSchema.extend({
  id: idSchema,
});

export const deleteDebtSchema = z.object({
  id: idSchema,
});

export type DebtInput = z.infer<typeof debtSchema>;
export type UpdateDebtInput = z.infer<typeof updateDebtSchema>;
