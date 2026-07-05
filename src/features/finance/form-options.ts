export const debtTypeOptions = [
  { value: "credit_card", label: "Kredi Kartı" },
  { value: "personal_loan", label: "İhtiyaç Kredisi" },
  { value: "overdraft_account", label: "Ek Hesap" },
  { value: "friend_debt", label: "Arkadaşa Borç" },
  { value: "other", label: "Diğer" },
] as const;

export const debtStatusOptions = [
  { value: "active", label: "Aktif" },
  { value: "paused", label: "Pasif" },
  { value: "paid_off", label: "Kapandı" },
] as const;

export const expenseCategoryOptions = [
  { value: "rent", label: "Kira" },
  { value: "groceries", label: "Market" },
  { value: "electricity", label: "Elektrik" },
  { value: "water", label: "Su" },
  { value: "internet", label: "İnternet" },
  { value: "phone", label: "Telefon" },
  { value: "natural_gas", label: "Doğalgaz" },
  { value: "fuel", label: "Yakıt" },
  { value: "insurance", label: "Sigorta" },
  { value: "education", label: "Eğitim" },
  { value: "health", label: "Sağlık" },
  { value: "other", label: "Diğer" },
] as const;

export type DbDebtType = (typeof debtTypeOptions)[number]["value"];
export type DbDebtStatus = (typeof debtStatusOptions)[number]["value"];
export type ExpenseCategory = (typeof expenseCategoryOptions)[number]["value"];

export function getDebtTypeLabel(value: string): string {
  return debtTypeOptions.find((option) => option.value === value)?.label ?? "Diğer";
}

export function getDebtStatusLabel(value: string): string {
  return debtStatusOptions.find((option) => option.value === value)?.label ?? "Pasif";
}

export function getExpenseCategoryLabel(value: string): string {
  return expenseCategoryOptions.find((option) => option.value === value)?.label ?? "Diğer";
}
