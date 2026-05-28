"use client";

import { Camera, FileText, Ruler, File, MapPin } from "lucide-react";
import type { FarmEvidence } from "@/types";
import { formatGpsValidation } from "@/lib/verification/evidence-validator";

const TYPE_ICONS = {
  photo: Camera,
  field_note: FileText,
  measurement: Ruler,
  document: File,
  gps_track: MapPin,
};

interface EvidenceTimelineProps {
  evidence: FarmEvidence[];
  loading?: boolean;
}

export function EvidenceTimeline({ evidence, loading = false }: EvidenceTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-muted border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  if (evidence.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center mb-3">
          <Camera className="w-5 h-5 text-muted-foreground/40" />
        </div>
        <p className="text-sm text-muted-foreground/60">No evidence uploaded yet</p>
        <p className="text-xs text-muted-foreground/40 mt-1">Upload field photos, measurements, or notes to begin verification</p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {evidence.map((ev, i) => {
        const Icon = TYPE_ICONS[ev.type] ?? File;
        const gps = formatGpsValidation(ev.gpsValidation);
        const isLast = i === evidence.length - 1;

        const statusDot =
          ev.status === "validated" ? "bg-green-500" :
          ev.status === "rejected" ? "bg-red-500" :
          ev.status === "flagged" ? "bg-orange-500" : "bg-muted-foreground/30";

        return (
          <div key={ev.id} className="flex gap-3">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5 text-green-400" />
              </div>
              {!isLast && <div className="w-px flex-1 bg-border mt-1 mb-1 min-h-[16px]" />}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 min-w-0 ${isLast ? "pb-0" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${statusDot}`} />
                    <p className="text-sm font-medium text-foreground truncate">{ev.title}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] text-muted-foreground/50 capitalize">{ev.type.replace("_", " ")}</span>
                    <span className={`text-[10px] font-medium ${gps.color}`}>{gps.label}</span>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground/40 shrink-0 mt-0.5">
                  {new Date(ev.capturedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                </span>
              </div>
              {ev.fieldNotes && (
                <p className="text-xs text-muted-foreground/60 mt-1 leading-relaxed line-clamp-2">
                  {ev.fieldNotes}
                </p>
              )}
              {ev.gpsCoordinate && (
                <p className="text-[10px] text-muted-foreground/40 mt-1 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" />
                  {ev.gpsCoordinate.lat.toFixed(4)}, {ev.gpsCoordinate.lng.toFixed(4)}
                  {ev.distanceFromBoundary !== undefined && ev.distanceFromBoundary > 0 && (
                    <span>· {ev.distanceFromBoundary}m from boundary</span>
                  )}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
