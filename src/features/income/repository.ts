import { getPrisma } from "@/lib/db/prisma";
import type { ProfileIncomeInput, SalaryRecordInput, UpdateSalaryRecordInput } from "./schemas";

export async function getProfile() {
  return getPrisma().profile.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export async function upsertProfileIncome(input: ProfileIncomeInput) {
  const prisma = getPrisma();
  const existingProfile = await getProfile();

  if (existingProfile) {
    return prisma.profile.update({
      where: { id: existingProfile.id },
      data: input,
    });
  }

  return prisma.profile.create({
    data: input,
  });
}

export async function listSalaryRecords() {
  return getPrisma().salaryRecord.findMany({
    orderBy: [{ effectiveDate: "desc" }, { createdAt: "desc" }],
  });
}

export async function createSalaryRecord(input: SalaryRecordInput) {
  return getPrisma().salaryRecord.create({
    data: {
      ...input,
      effectiveDate: new Date(input.effectiveDate),
    },
  });
}

export async function updateSalaryRecord(input: UpdateSalaryRecordInput) {
  const { id, ...data } = input;

  return getPrisma().salaryRecord.update({
    where: { id },
    data: {
      ...data,
      effectiveDate: new Date(data.effectiveDate),
    },
  });
}

export async function deleteSalaryRecord(id: string) {
  return getPrisma().salaryRecord.delete({
    where: { id },
  });
}
