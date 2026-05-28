"use server";
import { NextResponse } from "next/server";
import { getCostHistory, getCostOptimizations, getMonthlyTotal, getScalingForecast } from "@/lib/cost/cost-tracker";

export async function GET() {
  const history = getCostHistory(6);
  const optimizations = getCostOptimizations();
  const current = getMonthlyTotal();
  const forecast = getScalingForecast();
  const totalSavings = optimizations.reduce((s, o) => s + o.estimatedSavingUSD, 0);

  return NextResponse.json({
    currentMonthUSD: current,
    history,
    optimizations,
    totalPotentialSavingUSD: parseFloat(totalSavings.toFixed(2)),
    scalingForecast: forecast,
    meta: { generatedAt: new Date().toISOString() },
  });
}
