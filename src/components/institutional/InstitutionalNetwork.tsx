import { Building2, FlaskConical, Globe, Users, DollarSign } from "lucide-react";
import { getInstitutionalPartners } from "@/lib/institutional/institutional-network";

const TYPE_ICON: Record<string, typeof Building2> = {
  government: Building2, research: FlaskConical, multilateral: Globe, ngo: Users, finance: DollarSign,
};
const TYPE_STYLE: Record<string, string> = {
  government: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  research: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  multilateral: "text-green-400 bg-green-500/10 border-green-500/20",
  ngo: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
  finance: "text-orange-400 bg-orange-500/10 border-orange-500/20",
};
const GOV_STYLE: Record<string, string> = {
  governing_body: "text-green-400 bg-green-500/10 border-green-500/30",
  validator: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  contributor: "text-slate-300 bg-slate-700/30 border-slate-600",
  observer: "text-slate-500 bg-slate-800/30 border-slate-700",
};

export function InstitutionalNetwork() {
  const partners = getInstitutionalPartners();
  return (
    <div className="space-y-2">
      {partners.map((p) => {
        const Icon = TYPE_ICON[p.type] ?? Building2;
        const TypeCls = TYPE_STYLE[p.type] ?? TYPE_STYLE.government;
        const GovCls = GOV_STYLE[p.governanceLevel] ?? GOV_STYLE.observer;
        return (
          <div key={p.id} className="rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
            <div className="flex items-start gap-3">
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${TypeCls}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <span className={`rounded-full border px-1.5 py-0.5 text-[9px] font-medium ${GovCls}`}>{p.governanceLevel.replace(/_/g, " ")}</span>
                </div>
                <p className="text-[10px] text-slate-400">{p.role}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{p.farmsOverseen.toLocaleString()} farms</span>
                  <span>{p.workspacesActive} workspaces</span>
                  {p.state && <span>{p.state}</span>}
                  <span>Joined {p.joinedAt}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
