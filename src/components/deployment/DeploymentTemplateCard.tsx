import { Package, Users, Clock, ChevronRight } from "lucide-react";
import { getDeploymentTemplates, getTemplateTypeConfig } from "@/lib/deployment/template-engine";

export function DeploymentTemplateCard() {
  const templates = getDeploymentTemplates();

  return (
    <div className="space-y-3">
      {templates.map((tmpl) => {
        const cfg = getTemplateTypeConfig(tmpl.type);
        return (
          <div key={tmpl.id} className={`rounded-xl border p-4 ${cfg.bg} ${cfg.border}`}>
            <div className="flex items-start gap-3">
              <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg} border ${cfg.border}`}>
                <Package className={`h-5 w-5 ${cfg.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-sm font-semibold text-white">{tmpl.name}</span>
                  <span className={`rounded-full border px-2 text-[10px] uppercase font-medium ${cfg.color} ${cfg.border}`}>{tmpl.type}</span>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-2">{tmpl.description}</p>
                <div className="flex gap-4 text-[10px] text-slate-500">
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />Up to {tmpl.estimatedFarms.toLocaleString()} farms</span>
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{tmpl.setupDays}d setup</span>
                  <span>{tmpl.usedBy} deployments</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {tmpl.featuresIncluded.slice(0, 4).map((f) => (
                    <span key={f} className="rounded border border-slate-600 bg-slate-700/30 px-1.5 py-0.5 text-[9px] text-slate-400">{f}</span>
                  ))}
                  {tmpl.featuresIncluded.length > 4 && (
                    <span className="text-[9px] text-slate-500">+{tmpl.featuresIncluded.length - 4} more</span>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-slate-500 shrink-0" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
