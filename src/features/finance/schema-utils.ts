import { z } from "zod";
import { liraToKurus } from "./money";

export const idSchema = z.string().trim().min(1, "Kayıt kimliği bulunamadı.");

function parseLocalizedMoneyInput(value: unknown): unknown {
  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  if (trimmed === "") {
    return value;
  }

  const compact = trimmed.replace(/\s/g, "");
  const isLikelyTurkishThousands = /^\d{1,3}(\.\d{3})+$/.test(compact);
  const normalized =
    compact.includes(",") || isLikelyTurkishThousands
      ? compact.replace(/\./g, "").replace(",", ".")
      : compact;

  return Number(normalized);
}

export function requiredText(fieldName: string, maxLength = 80) {
  return z
    .string()
    .trim()
    .min(2, `${fieldName} en az 2 karakter olmalı.`)
    .max(maxLength, `${fieldName} en fazla ${maxLength} karakter olabilir.`);
}

export function optionalText(maxLength = 300) {
  return z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().trim().max(maxLength, `Bu alan en fazla ${maxLength} karakter olabilir.`).optional(),
  );
}

export function requiredMoney(fieldName: string, minLira = 0.01) {
  return z.preprocess(
    parseLocalizedMoneyInput,
    z.coerce
      .number()
      .finite(`${fieldName} geçerli bir TL tutarı olmalı.`)
      .min(minLira, `${fieldName} ${minLira} TL veya üzerinde olmalı.`)
      .transform((value) => liraToKurus(value)),
  );
}

export function optionalMoney(fieldName: string) {
  return z.preprocess(
    (value) => (value === "" || value === null ? undefined : parseLocalizedMoneyInput(value)),
    z.coerce
      .number()
      .finite(`${fieldName} geçerli bir TL tutarı olmalı.`)
      .min(0, `${fieldName} negatif olamaz.`)
      .transform((value) => liraToKurus(value))
      .optional(),
  );
}

export function optionalDay(fieldName: string) {
  return z.preprocess(
    (value) => (value === "" || value === null ? undefined : value),
    z.coerce
      .number()
      .int(`${fieldName} tam sayı olmalı.`)
      .min(1, `${fieldName} 1 ile 31 arasında olmalı.`)
      .max(31, `${fieldName} 1 ile 31 arasında olmalı.`)
      .optional(),
  );
}

export function requiredDay(fieldName: string) {
  return z.coerce
    .number()
    .int(`${fieldName} tam sayı olmalı.`)
    .min(1, `${fieldName} 1 ile 31 arasında olmalı.`)
    .max(31, `${fieldName} 1 ile 31 arasında olmalı.`);
}

export function optionalPercent(fieldName: string, max = 100) {
  return z.preprocess(
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
      .finite(`${fieldName} geçerli bir yüzde olmalı.`)
      .min(0, `${fieldName} negatif olamaz.`)
      .max(max, `${fieldName} ${max} değerinden yüksek olamaz.`)
      .optional(),
  );
}
