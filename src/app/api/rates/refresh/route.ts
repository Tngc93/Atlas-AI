import { NextResponse } from "next/server";
import { refreshInterestRates } from "@/features/rates/service";
import { TCMBInterestRateProvider } from "@/features/rates/tcmb-provider";

export async function GET() {
  const provider = new TCMBInterestRateProvider();
  const snapshot = await refreshInterestRates(provider);

  return NextResponse.json(snapshot);
}
