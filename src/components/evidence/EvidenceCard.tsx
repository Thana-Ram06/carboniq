import { Camera, FileText, Ruler, File, MapPin, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import type { FarmEvidence } from "@/types";
import { formatGpsValidation } from "@/lib/verification/evidence-validator";

const TYPE_ICONS = {
  photo: Camera,
  field_note: FileText,
  measurement: Ruler,
  document: File,
  gps_track: MapPin,
};

interface EvidenceCardProps {
  evidence: FarmEvidence;
  compact?: boolean;
}

export function EvidenceCard({ evidence, compact = false }: EvidenceCardProps) {
  const Icon = TYPE_ICONS[evidence.type] ?? File;
  const gps = formatGpsValidation(evidence.gpsValidation);

  const statusIcon =
    evidence.status === "validated" ? <CheckCircle2 className="w-3 h-3 text-green-400" /> :
    evidence.status === "rejected" ? <AlertTriangle className="w-3 h-3 text-red-400" /> :
    <Clock className="w-3 h-3 text-muted-foreground/40" />;

  if (compact) {
    return (
      <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border bg-muted hover:bg-card transition-colors">
        <div className="w-7 h-7 rounded-lg bg-green-500/8 flex items-center justify-center shrink-0">
          <Icon className="w-3.5 h-3.5 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{evidence.title}</p>
          <p className="text-[10px] text-muted-foreground/50">{evidence.type} · {new Date(evidence.capturedAt).toLocaleDateString("en-IN")}</p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {statusIcon}
          <span className={`text-[10px] font-medium ${gps.color} hidden sm:block`}>
            {evidence.gpsValidation === "valid" ? "GPS ✓" : "GPS !"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl border border-border bg-card space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl bg-green-500/8 border border-green-500/15 flex items-center justify-center shrink-0">
          <Icon className="w-4 h-4 text-green-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-semibold text-foreground truncate">{evidence.title}</p>
            {statusIcon}
          </div>
          <p className="text-xs text-muted-foreground/60 capitalize">{evidence.type.replace("_", " ")}</p>
        </div>
        <div className={`px-2 py-1 rounded-lg border text-[10px] font-medium ${gps.bg} ${gps.color} shrink-0`}>
          {gps.label}
        </div>
      </div>

      {evidence.description && (
        <p className="text-xs text-muted-foreground/70 leading-relaxed">{evidence.description}</p>
      )}

      {evidence.fieldNotes && (
        <div className="p-2.5 rounded-xl bg-muted border border-border">
          <p className="text-[10px] text-muted-foreground/50 mb-1">Field Notes</p>
          <p className="text-xs text-foreground leading-relaxed">{evidence.fieldNotes}</p>
        </div>
      )}

      {evidence.gpsCoordinate && (
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/50">
          <MapPin className="w-3 h-3" />
          {evidence.gpsCoordinate.lat.toFixed(5)}, {evidence.gpsCoordinate.lng.toFixed(5)}
          {evidence.distanceFromBoundary !== undefined && evidence.distanceFromBoundary > 0 && (
            <span className="ml-1">· {evidence.distanceFromBoundary}m from boundary</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[10px] text-muted-foreground/40">
        <span>Captured {new Date(evidence.capturedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</span>
        {evidence.fileSizeBytes && (
          <span>{(evidence.fileSizeBytes / 1024).toFixed(0)} KB</span>
        )}
      </div>
    </div>
  );
}
