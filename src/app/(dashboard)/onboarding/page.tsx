import { Users, Building2, CheckCircle, Clock } from "lucide-react";
import { getPartnerOrgs } from "@/lib/onboarding/partner-onboarding";
import { PartnerInvitePanel } from "@/components/onboarding/PartnerInvitePanel";
import { OnboardingWizard } from "@/components/onboarding/OnboardingWizard";

export default function OnboardingPage() {
  const partners = getPartnerOrgs();
  const active = partners.filter((p) => p.status === "active").length;
  const onboarding = partners.filter((p) => p.status === "onboarding" || p.status === "pending").length;
  const firstOnboardingOrg = partners.find((p) => p.status === "onboarding") ?? partners[1];

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Partner Onboarding</h1>
        <p className="text-slate-400 mt-1 text-sm">NGO, government, cooperative, and enterprise partner management and setup flows</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{partners.length}</p>
          <p className="text-xs text-slate-400">Total Partners</p>
        </div>
        <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-green-400">{active}</p>
          <p className="text-xs text-slate-400">Active</p>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
          <p className="text-2xl font-bold text-blue-400">{onboarding}</p>
          <p className="text-xs text-slate-400">In Onboarding</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-4 py-3">
          <p className="text-2xl font-bold text-white">{partners.reduce((s, p) => s + p.farmCount, 0).toLocaleString()}</p>
          <p className="text-xs text-slate-400">Partner Farms</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Partner registry */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Partner Registry</h2>
          </div>
          <PartnerInvitePanel />
        </div>

        {/* Onboarding wizard */}
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <h2 className="text-base font-semibold text-white">Onboarding Progress</h2>
            <span className="text-xs text-slate-500 ml-auto">{firstOnboardingOrg.name}</span>
          </div>
          <OnboardingWizard orgId={firstOnboardingOrg.id} />
        </div>
      </div>

      {/* Partner type breakdown */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-5 w-5 text-purple-400" />
          <h2 className="text-base font-semibold text-white">Ecosystem Composition</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(["ngo", "government", "enterprise", "cooperative", "research"] as const).map((type) => {
            const count = partners.filter((p) => p.type === type).length;
            const typeLabels = { ngo: "NGOs", government: "Government", enterprise: "Enterprise", cooperative: "Cooperative", research: "Research" };
            const typeColors = { ngo: "text-green-400", government: "text-blue-400", enterprise: "text-orange-400", cooperative: "text-teal-400", research: "text-purple-400" };
            return (
              <div key={type} className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-3 text-center">
                <p className={`text-xl font-bold ${typeColors[type]}`}>{count}</p>
                <p className="text-xs text-slate-400 mt-0.5">{typeLabels[type]}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Setup steps overview */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Onboarding Timeline</h2>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { day: "Day 1–2", title: "Org Setup",         desc: "Profile, contacts, legal docs" },
            { day: "Day 2–4", title: "Team Invite",        desc: "Agents, auditors, managers" },
            { day: "Day 3–6", title: "Farm Import",        desc: "CSV upload or portal sync" },
            { day: "Day 5–8", title: "Boundary Setup",     desc: "GPS polygon verification" },
            { day: "Day 7–9", title: "Pilot Scan",         desc: "5-farm test satellite scan" },
            { day: "Day 9–12", title: "Compliance Map",    desc: "Standard & methodology" },
            { day: "Day 12+", title: "Go Live",            desc: "Full platform access" },
          ].map((step, i) => (
            <div key={i} className="flex-shrink-0 w-32 rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-2.5 text-center">
              <p className="text-[9px] text-green-400 font-semibold">{step.day}</p>
              <p className="text-xs font-semibold text-white mt-1">{step.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
