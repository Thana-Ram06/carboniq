import { NextRequest, NextResponse } from "next/server";
import { getUserFarms } from "@/lib/firestore";
import { isScanDue, formatNextScan } from "@/lib/monitoring/scheduler";
import type { MonitoringConfig } from "@/types";

export async function GET(req: NextRequest) {
  const userId = req.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  try {
    const farms = await getUserFarms(userId);

    const farmStatus = farms.map((farm) => {
      const config = (farm as typeof farm & { monitoring?: MonitoringConfig })
        .monitoring;
      const due = config?.autoEnabled ? isScanDue(config.nextScanAt) : false;
      return {
        farmId: farm.id,
        farmName: farm.name,
        due,
        interval: config?.interval ?? "weekly",
        autoEnabled: config?.autoEnabled ?? false,
        lastScanAt: config?.lastScanAt,
        nextScanAt: config?.nextScanAt,
        nextScanLabel: formatNextScan(config?.nextScanAt),
      };
    });

    const dueFarms = farmStatus.filter((f) => f.due);

    return NextResponse.json({
      totalFarms: farms.length,
      dueFarms: dueFarms.length,
      farmStatus,
      checkedAt: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Check failed" },
      { status: 500 }
    );
  }
}
