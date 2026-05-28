"use client";
import { useAuth } from "@/hooks/use-auth";
import { Building2 } from "lucide-react";
import { OrgWorkspaceDashboard } from "@/components/org/OrgWorkspaceDashboard";
import { SeasonalCalendar } from "@/components/forecast/SeasonalCalendar";

export default function OrganizationPage() {
  const { user } = useAuth();
  const userId = user?.uid ?? "demo-user";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-purple-500/10 border border-purple-500/20 p-2.5">
          <Building2 className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Organization</h1>
          <p className="text-sm text-slate-400">Enterprise workspace, members, and analytics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <OrgWorkspaceDashboard userId={userId} />
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">Seasonal Intelligence</p>
          <SeasonalCalendar state="Maharashtra" cropType="rice" />
        </div>
      </div>
    </div>
  );
}
