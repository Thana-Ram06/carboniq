import { ClipboardList, Clock, ChevronDown } from "lucide-react";
import { FIELD_SOPS } from "@/lib/field/field-operations";

const CATEGORY_CONFIG: Record<string, { label: string; color: string }> = {
  evidence_collection: { label: "Evidence Collection", color: "text-green-400" },
  boundary_survey:     { label: "Boundary Survey",     color: "text-blue-400" },
  audit_review:        { label: "Audit Review",        color: "text-purple-400" },
  crop_assessment:     { label: "Crop Assessment",     color: "text-yellow-400" },
  soil_sampling:       { label: "Soil Sampling",       color: "text-orange-400" },
};

export function SOPDashboard() {
  return (
    <div className="space-y-3">
      {FIELD_SOPS.map((sop) => {
        const catCfg = CATEGORY_CONFIG[sop.category] ?? { label: sop.category, color: "text-slate-400" };
        const required = sop.steps.filter((s) => s.required).length;
        return (
          <div key={sop.id} className="rounded-xl border border-slate-700 bg-slate-700/20 p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <ClipboardList className={`h-4 w-4 ${catCfg.color}`} />
                <span className="text-sm font-semibold text-white">{sop.title}</span>
              </div>
              <span className="text-[10px] text-slate-500">{sop.version}</span>
            </div>
            <div className="flex gap-3 text-[10px] text-slate-500 mb-3">
              <span className={`font-medium ${catCfg.color}`}>{catCfg.label}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{sop.estimatedMinutes}min</span>
              <span>{sop.steps.length} steps · {required} required</span>
              <span>Rev. {sop.lastRevised}</span>
            </div>
            <div className="space-y-1.5">
              {sop.steps.slice(0, 3).map((step) => (
                <div key={step.step} className="flex items-start gap-2">
                  <span className={`text-[10px] font-bold w-4 shrink-0 mt-0.5 ${catCfg.color}`}>{step.step}.</span>
                  <p className={`text-[10px] line-clamp-1 ${step.required ? "text-slate-300" : "text-slate-500"}`}>
                    {step.instruction}
                    {!step.required && <span className="text-slate-600 ml-1">(optional)</span>}
                  </p>
                </div>
              ))}
              {sop.steps.length > 3 && (
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <ChevronDown className="h-3 w-3" />
                  <span>+{sop.steps.length - 3} more steps</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
