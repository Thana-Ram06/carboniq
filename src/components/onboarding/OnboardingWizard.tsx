"use client";
import { CheckCircle2, Circle, Loader2, ChevronRight } from "lucide-react";
import type { OnboardingFlow, OnboardingStepStatus } from "@/types";
import { getOnboardingFlow } from "@/lib/onboarding/partner-onboarding";

const STATUS_CONFIG: Record<OnboardingStepStatus, { icon: React.ElementType; color: string }> = {
  completed:   { icon: CheckCircle2, color: "text-green-400" },
  in_progress: { icon: Loader2,      color: "text-blue-400" },
  pending:     { icon: Circle,       color: "text-slate-600" },
  skipped:     { icon: Circle,       color: "text-slate-500" },
};

export function OnboardingWizard({ orgId }: { orgId: string }) {
  const flow: OnboardingFlow = getOnboardingFlow(orgId);

  return (
    <div className="space-y-4">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-white">{flow.orgName}</p>
          <p className="text-xs text-slate-400 capitalize">{flow.partnerType} onboarding</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${flow.overallProgress >= 80 ? "text-green-400" : flow.overallProgress >= 40 ? "text-yellow-400" : "text-slate-400"}`}>
            {flow.overallProgress}%
          </p>
          <p className="text-xs text-slate-500">complete</p>
        </div>
      </div>

      <div className="w-full bg-slate-700/50 rounded-full h-1.5">
        <div
          className="h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
          style={{ width: `${flow.overallProgress}%` }}
        />
      </div>

      <div className="space-y-2">
        {flow.steps.map((step, i) => {
          const cfg = STATUS_CONFIG[step.status];
          const Icon = cfg.icon;
          return (
            <div
              key={step.id}
              className={`flex items-start gap-3 rounded-xl border p-3 transition-all ${
                step.status === "in_progress"
                  ? "border-blue-500/30 bg-blue-500/5"
                  : step.status === "completed"
                  ? "border-green-500/20 bg-green-500/5"
                  : "border-slate-700 bg-slate-700/10"
              }`}
            >
              <div className="flex items-center gap-2 w-6 shrink-0">
                <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                <Icon className={`h-4 w-4 ${cfg.color} ${step.status === "in_progress" ? "animate-spin" : ""}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-xs font-semibold ${step.status === "pending" ? "text-slate-500" : "text-white"}`}>
                    {step.title}
                  </p>
                  {step.required && (
                    <span className="text-[9px] text-red-400 border border-red-500/30 rounded px-1">required</span>
                  )}
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{step.description}</p>
                {step.completedAt && (
                  <p className="text-[9px] text-green-400 mt-0.5">
                    Completed {new Date(step.completedAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                  </p>
                )}
              </div>
              {step.status === "in_progress" && (
                <ChevronRight className="h-4 w-4 text-blue-400 shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      <p className="text-xs text-slate-500 text-center">
        Est. {flow.estimatedCompletionDays} days remaining · Started {new Date(flow.startedAt).toLocaleDateString("en-IN")}
      </p>
    </div>
  );
}
