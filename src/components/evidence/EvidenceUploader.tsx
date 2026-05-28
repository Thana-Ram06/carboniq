"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, MapPin, Camera, FileText, Ruler, X, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getFirebaseStorage } from "@/lib/firebase";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import type { EvidenceType, GpsCoordinate, GpsValidationStatus } from "@/types";
import type { Farm } from "@/types";
import toast from "react-hot-toast";

const TYPE_OPTIONS: { value: EvidenceType; label: string; icon: React.ElementType }[] = [
  { value: "photo", label: "Photo", icon: Camera },
  { value: "field_note", label: "Field Note", icon: FileText },
  { value: "measurement", label: "Measurement", icon: Ruler },
  { value: "document", label: "Document", icon: FileText },
];

interface EvidenceUploaderProps {
  farm: Farm;
  userId: string;
  onUploaded?: (evidenceId: string, gpsStatus: GpsValidationStatus) => void;
}

export function EvidenceUploader({ farm, userId, onUploaded }: EvidenceUploaderProps) {
  const [type, setType] = useState<EvidenceType>("photo");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [fieldNotes, setFieldNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [gps, setGps] = useState<GpsCoordinate | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const captureGps = useCallback(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported on this device");
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGps({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setGpsLoading(false);
        toast.success(`GPS captured (±${Math.round(pos.coords.accuracy)}m)`);
      },
      () => {
        setGpsLoading(false);
        toast.error("Could not get GPS location");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) { toast.error("Title is required"); return; }
    setUploading(true);

    try {
      let fileUrl: string | undefined;
      let fileType: string | undefined;
      let fileSizeBytes: number | undefined;

      if (file) {
        const storage = getFirebaseStorage();
        const path = `evidence/${userId}/${farm.id}/${Date.now()}_${file.name}`;
        const sRef = storageRef(storage, path);
        await uploadBytes(sRef, file);
        fileUrl = await getDownloadURL(sRef);
        fileType = file.type;
        fileSizeBytes = file.size;
      }

      const res = await fetch("/api/evidence/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          farmId: farm.id,
          userId,
          type,
          title: title.trim(),
          description: description.trim() || undefined,
          fieldNotes: fieldNotes.trim() || undefined,
          fileUrl,
          fileType,
          fileSizeBytes,
          gpsCoordinate: gps ?? undefined,
          capturedAt: new Date().toISOString(),
        }),
      });

      const data = await res.json() as {
        evidenceId: string;
        gpsValidation: GpsValidationStatus;
        gpsMessage: string;
      };

      if (!res.ok) throw new Error("Upload failed");

      const gpsMsg = data.gpsValidation === "valid"
        ? "GPS validated within farm boundary"
        : data.gpsMessage;

      toast.success(`Evidence uploaded — ${gpsMsg}`);
      onUploaded?.(data.evidenceId, data.gpsValidation);

      // Reset
      setTitle(""); setDescription(""); setFieldNotes(""); setFile(null); setGps(null);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }, [title, description, fieldNotes, file, gps, farm.id, userId, type, onUploaded]);

  return (
    <div className="space-y-4">
      {/* Type selector */}
      <div className="flex gap-2 flex-wrap">
        {TYPE_OPTIONS.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => setType(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              type === value
                ? "bg-green-500/15 border-green-500/30 text-green-300"
                : "bg-muted border-border text-muted-foreground/60 hover:text-foreground"
            }`}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Evidence title (e.g. 'Field condition check — May 2026')"
        className="w-full px-3 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-green-500/40 transition-colors"
      />

      {/* Description */}
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        placeholder="Short description (optional)"
        className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-green-500/40 transition-colors"
      />

      {/* Field notes */}
      <textarea
        value={fieldNotes}
        onChange={(e) => setFieldNotes(e.target.value)}
        rows={2}
        placeholder="Field notes — observations, crop condition, water availability…"
        className="w-full px-3 py-2 rounded-xl border border-border bg-muted text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none focus:border-green-500/40 transition-colors"
      />

      {/* File + GPS row */}
      <div className="grid grid-cols-2 gap-3">
        {/* File upload */}
        <div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className={`w-full flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 border-dashed transition-all text-xs ${
              file
                ? "border-green-500/30 bg-green-500/5 text-green-400"
                : "border-border text-muted-foreground/50 hover:border-green-500/20 hover:text-muted-foreground"
            }`}
          >
            {file ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span className="truncate max-w-[100px] text-center">{file.name}</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Attach file</span>
              </>
            )}
          </button>
          {file && (
            <button onClick={() => setFile(null)} className="mt-1 text-[10px] text-muted-foreground/40 hover:text-muted-foreground flex items-center gap-1">
              <X className="w-2.5 h-2.5" /> Remove
            </button>
          )}
        </div>

        {/* GPS capture */}
        <button
          onClick={captureGps}
          disabled={gpsLoading}
          className={`flex flex-col items-center justify-center gap-2 px-3 py-4 rounded-xl border-2 border-dashed transition-all text-xs ${
            gps
              ? "border-blue-500/30 bg-blue-500/5 text-blue-400"
              : "border-border text-muted-foreground/50 hover:border-blue-500/20"
          }`}
        >
          {gps ? (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>{gps.lat.toFixed(4)}, {gps.lng.toFixed(4)}</span>
              {gps.accuracy && <span className="text-[9px] opacity-60">±{Math.round(gps.accuracy)}m</span>}
            </>
          ) : (
            <>
              <MapPin className={`w-5 h-5 ${gpsLoading ? "animate-pulse" : ""}`} />
              <span>{gpsLoading ? "Getting GPS…" : "Capture GPS"}</span>
            </>
          )}
        </button>
      </div>

      {/* GPS validation warning */}
      {gps && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground/60 bg-muted px-3 py-2 rounded-xl border border-border">
          <AlertTriangle className="w-3 h-3 shrink-0" />
          GPS will be validated against the farm boundary polygon. Points outside 500m will be flagged.
        </div>
      )}

      <Button
        variant="primary"
        size="sm"
        className="w-full"
        disabled={uploading || !title.trim()}
        onClick={handleSubmit}
      >
        {uploading ? <><Upload className="w-3.5 h-3.5 animate-bounce" /> Uploading…</> : <><Upload className="w-3.5 h-3.5" /> Submit Evidence</>}
      </Button>
    </div>
  );
}
