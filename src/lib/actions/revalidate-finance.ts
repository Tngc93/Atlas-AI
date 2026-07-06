import { revalidatePath } from "next/cache";

export function revalidateFinancePages() {
  revalidatePath("/");
  revalidatePath("/income");
  revalidatePath("/debts");
  revalidatePath("/expenses");
  revalidatePath("/plan");
  revalidatePath("/decisions");
  revalidatePath("/forecast");
  revalidatePath("/memory");
}
