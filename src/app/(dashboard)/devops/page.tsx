import { GitBranch, Server, Database, Zap } from "lucide-react";
import { getLoadTestResults } from "@/lib/devops/deployment-tracker";
import { DeploymentTracker } from "@/components/devops/DeploymentTracker";
import { EnvironmentValidation } from "@/components/devops/EnvironmentValidation";
import { CacheMetrics } from "@/components/devops/CacheMetrics";
import { BackupStatus } from "@/components/backup/BackupStatus";

export default function DevOpsPage() {
  const loadTest = getLoadTestResults();
  const passedScenarios = loadTest.scenarios.filter((s) => s.passed).length;

  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl font-bold text-white">DevOps & Operations</h1>
        <p className="text-slate-400 mt-1 text-sm">Deployment history, environment validation, load testing, caching, and backup management</p>
      </div>

      {/* Load test summary */}
      <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="h-5 w-5 text-yellow-400" />
          <h2 className="text-base font-semibold text-white">Load & Scale Testing</h2>
          <span className="ml-auto text-xs text-slate-500">Test date: {loadTest.testDate}</span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
            <p className="text-lg font-bold text-green-400">{passedScenarios}/{loadTest.scenarios.length}</p>
            <p className="text-xs text-slate-400">Scenarios Passed</p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/10 px-3 py-2 text-center">
            <p className="text-lg font-bold text-blue-400">{loadTest.infrastructureCapacity.estimatedCapacity.toLocaleString()}</p>
            <p className="text-xs text-slate-400">Farm Capacity</p>
          </div>
          <div className="rounded-xl border border-slate-700 bg-slate-700/20 px-3 py-2 text-center">
            <p className="text-lg font-bold text-white">{loadTest.infrastructureCapacity.cpuHeadroom}</p>
            <p className="text-xs text-slate-400">CPU Headroom</p>
          </div>
        </div>

        <div className="space-y-2">
          {loadTest.scenarios.map((scenario) => (
            <div key={scenario.name} className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 ${scenario.passed ? "border-green-500/20 bg-green-500/5" : "border-red-500/20 bg-red-500/5"}`}>
              <div className={`h-2 w-2 rounded-full shrink-0 mt-1.5 ${scenario.passed ? "bg-green-400" : "bg-red-400"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white">{scenario.name}</p>
                <div className="flex gap-3 mt-1 text-[10px] text-slate-500">
                  <span>{scenario.rps} RPS</span>
                  <span>p95: {scenario.p95Ms}ms</span>
                  <span>p99: {scenario.p99Ms}ms</span>
                  <span className={scenario.errorRate > 2 ? "text-yellow-400" : ""}>{scenario.errorRate}% errors</span>
                </div>
              </div>
              <span className={`text-xs font-medium ${scenario.passed ? "text-green-400" : "text-red-400"}`}>
                {scenario.passed ? "PASS" : "FAIL"}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-3 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-3 py-2">
          <p className="text-xs text-yellow-300">
            <span className="font-semibold">Bottleneck:</span> {loadTest.infrastructureCapacity.bottleneck}
          </p>
        </div>
      </div>

      {/* Deployments + env validation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <GitBranch className="h-5 w-5 text-green-400" />
            <h2 className="text-base font-semibold text-white">Deployment History</h2>
          </div>
          <DeploymentTracker />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Server className="h-5 w-5 text-blue-400" />
            <h2 className="text-base font-semibold text-white">Environment Validation</h2>
          </div>
          <EnvironmentValidation />
        </div>
      </div>

      {/* Cache metrics + backup */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-5 w-5 text-purple-400" />
            <h2 className="text-base font-semibold text-white">Cache Layer Performance</h2>
          </div>
          <CacheMetrics />
        </div>

        <div className="rounded-2xl border border-slate-700 bg-slate-800/60 p-5">
          <div className="flex items-center gap-2 mb-4">
            <Database className="h-5 w-5 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Backup & Recovery</h2>
          </div>
          <BackupStatus />
        </div>
      </div>
    </div>
  );
}
