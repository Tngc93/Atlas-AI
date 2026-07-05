import { liraToKurus } from "@/features/finance/money";
import type { DebtAccount, MandatoryExpense, Profile } from "@/features/finance/types";

export const sampleProfile: Profile = {
  id: "sample-profile",
  currency: "TRY",
  monthlySalaryKurus: liraToKurus(85000),
  survivalThresholdKurus: liraToKurus(12000),
};

export const sampleDebts: DebtAccount[] = [
  {
    id: "card-market",
    type: "credit_card",
    name: "Örnek Market Kartı",
    lender: "Örnek Banka",
    balanceKurus: liraToKurus(42000),
    creditLimitKurus: liraToKurus(90000),
    interestRateMonthly: 4.25,
    interestRateAnnual: 64.8,
    minimumPaymentKurus: liraToKurus(8500),
    dueDay: 12,
    statementDay: 2,
    status: "active",
  },
  {
    id: "card-travel",
    type: "credit_card",
    name: "Örnek Seyahat Kartı",
    lender: "Demo Finans",
    balanceKurus: liraToKurus(28500),
    creditLimitKurus: liraToKurus(65000),
    interestRateMonthly: 3.89,
    interestRateAnnual: 58.1,
    minimumPaymentKurus: liraToKurus(5700),
    dueDay: 20,
    statementDay: 10,
    status: "active",
  },
  {
    id: "installment-phone",
    type: "installment",
    name: "Örnek Telefon Taksidi",
    lender: "Teknoloji Mağazası",
    balanceKurus: liraToKurus(18000),
    interestRateMonthly: 0,
    minimumPaymentKurus: liraToKurus(3000),
    dueDay: 5,
    installmentCount: 12,
    remainingInstallments: 6,
    status: "active",
  },
];

export const sampleExpenses: MandatoryExpense[] = [
  {
    id: "rent",
    name: "Örnek Kira",
    category: "Barınma",
    amountKurus: liraToKurus(25000),
    dueDay: 1,
    isFixed: true,
  },
  {
    id: "utilities",
    name: "Örnek Faturalar",
    category: "Faturalar",
    amountKurus: liraToKurus(6500),
    dueDay: 15,
    isFixed: false,
  },
  {
    id: "food",
    name: "Örnek Temel Gıda",
    category: "Yaşam",
    amountKurus: liraToKurus(14000),
    isFixed: false,
  },
  {
    id: "transport",
    name: "Örnek Ulaşım",
    category: "Ulaşım",
    amountKurus: liraToKurus(4500),
    isFixed: false,
  },
];
