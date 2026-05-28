"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, X, Check, RotateCcw, ZoomIn } from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/media/image-compressor";

interface CameraCaptureProps {
  onCapture: (blob: Blob, previewUrl: string, originalSize: number, compressedSize: number) => void;
  onCancel: () => void;
}

export function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [phase, setPhase] = useState<"init" | "live" | "preview" | "compressing">("init");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
  const [sizes, setSizes] = useState({ original: 0, compressed: 0 });
  const [error, setError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setPhase("live");
    } catch (err) {
      const e = err as Error;
      setError(
        e.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permissions and try again."
          : "Camera unavailable. Use the file picker instead."
      );
    }
  }, [facingMode]);

  const capture = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);

    // Stop camera stream
    streamRef.current?.getTracks().forEach((t) => t.stop());

    canvas.toBlob(async (rawBlob) => {
      if (!rawBlob) return;
      setPhase("compressing");
      try {
        const result = await compressImage(rawBlob, { maxWidthPx: 1280, quality: 0.78 });
        setPreviewUrl(result.dataUrl);
        setCapturedBlob(result.blob);
        setSizes({ original: result.originalSizeBytes, compressed: result.compressedSizeBytes });
        setPhase("preview");
      } catch {
        setPreviewUrl(URL.createObjectURL(rawBlob));
        setCapturedBlob(rawBlob);
        setSizes({ original: rawBlob.size, compressed: rawBlob.size });
        setPhase("preview");
      }
    }, "image/jpeg", 0.92);
  }, []);

  const confirm = useCallback(() => {
    if (capturedBlob && previewUrl) {
      onCapture(capturedBlob, previewUrl, sizes.original, sizes.compressed);
    }
  }, [capturedBlob, previewUrl, sizes, onCapture]);

  const retake = useCallback(() => {
    setPreviewUrl(null);
    setCapturedBlob(null);
    setPhase("init");
  }, []);

  const toggleCamera = useCallback(() => {
    setFacingMode((m) => (m === "environment" ? "user" : "environment"));
    if (phase === "live") {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      setPhase("init");
    }
  }, [phase]);

  return (
    <div className="flex flex-col gap-3">
      {phase === "init" && (
        <div className="flex flex-col items-center gap-4 py-6">
          {error ? (
            <p className="text-xs text-red-400 text-center">{error}</p>
          ) : null}
          <button
            onClick={startCamera}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-medium hover:bg-green-500/15 transition-all active:scale-95"
          >
            <Camera className="w-4 h-4" />
            Open Camera
          </button>
          <button onClick={onCancel} className="text-xs text-muted-foreground hover:text-foreground">
            Cancel
          </button>
        </div>
      )}

      {phase === "live" && (
        <div className="relative rounded-xl overflow-hidden bg-black">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full max-h-[300px] object-cover"
          />
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
            <button
              onClick={toggleCamera}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={capture}
              className="w-14 h-14 rounded-full bg-white border-4 border-black/20 flex items-center justify-center shadow-xl active:scale-95 transition-transform"
            />
            <button
              onClick={onCancel}
              className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {phase === "compressing" && (
        <div className="flex flex-col items-center gap-3 py-6">
          <div className="w-10 h-10 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
            <ZoomIn className="w-4 h-4 text-green-400 animate-pulse" />
          </div>
          <p className="text-xs text-muted-foreground">Compressing image…</p>
        </div>
      )}

      {phase === "preview" && previewUrl && (
        <div className="flex flex-col gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Captured"
            className="w-full rounded-xl object-cover max-h-[260px] border border-border"
          />
          {sizes.original > 0 && (
            <p className="text-[10px] text-muted-foreground/50 text-center">
              {formatFileSize(sizes.original)} → {formatFileSize(sizes.compressed)}
              {sizes.original > sizes.compressed && (
                <span className="text-green-400/70 ml-1">
                  ({Math.round((1 - sizes.compressed / sizes.original) * 100)}% smaller)
                </span>
              )}
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={retake}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-border bg-muted text-sm text-foreground hover:border-green-500/20 transition-all active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Retake
            </button>
            <button
              onClick={confirm}
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-green-500/15 border border-green-500/30 text-sm text-green-300 font-medium hover:bg-green-500/20 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" /> Use Photo
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
