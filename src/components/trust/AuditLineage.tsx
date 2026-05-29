import { getAuditLineage, getVerificationRecords } from "@/lib/trust/verification-registry";

export function AuditLineage() {
  const records = getVerificationRecords(3);
  const lineage = getAuditLineage(records[0]?.id ?? "VR-2024000");

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-mono text-blue-300">{lineage.recordId}</span>
        <span className="text-[10px] text-slate-500">Farm {lineage.farmId}</span>
      </div>
      <div className="relative">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-700" />
        <div className="space-y-3">
          {lineage.events.map((ev, i) => (
            <div key={i} className="flex items-start gap-3 pl-7 relative">
              <div className="absolute left-2.5 top-1.5 w-2 h-2 rounded-full bg-slate-600 border border-slate-500 -translate-x-1/2" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-[10px] font-mono text-green-400">{ev.action}</span>
                  <span className="text-[9px] text-slate-600">{new Date(ev.timestamp).toLocaleDateString("en-IN")}</span>
                </div>
                <p className="text-xs text-slate-400">{ev.detail}</p>
                <div className="flex gap-2 mt-0.5">
                  <span className="text-[9px] text-slate-600">by {ev.actor}</span>
                  <span className="text-[9px] font-mono text-slate-700">{ev.hash}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
