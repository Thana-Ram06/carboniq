import type { AuditStatus } from "@/types";

const STATUS_CONFIG: Record<AuditStatus, { label: string; dot: string; bg: string; text: string }> = {
  pending: {
    label: "Pending Review",
    dot: "bg-yellow-400",
    bg: "bg-yellow-500/10 border-yellow-500/20",
    text: "text-yellow-400",
  },
  in_review: {
    label: "In Review",
    dot: "bg-blue-400",
    bg: "bg-blue-500/10 border-blue-500/20",
    text: "text-blue-400",
  },
  approved: {
    label: "Approved",
    dot: "bg-green-400",
    bg: "bg-green-500/10 border-green-500/20",
    text: "text-green-400",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    bg: "bg-red-500/10 border-red-500/20",
    text: "text-red-400",
  },
  requires_recheck: {
    label: "Requires Recheck",
    dot: "bg-orange-400",
    bg: "bg-orange-500/10 border-orange-500/20",
    text: "text-orange-400",
  },
};

interface AuditStatusBadgeProps {
  status: AuditStatus;
  size?: "sm" | "md";
}

export function AuditStatusBadge({ status, size = "md" }: AuditStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border ${cfg.bg} ${size === "sm" ? "text-[10px]" : "text-xs"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <span className={`font-medium ${cfg.text}`}>{cfg.label}</span>
    </div>
  );
}
