export interface CompressOptions {
  maxWidthPx?: number;
  maxHeightPx?: number;
  quality?: number;
  outputType?: "image/jpeg" | "image/webp";
}

export interface CompressResult {
  blob: Blob;
  dataUrl: string;
  originalSizeBytes: number;
  compressedSizeBytes: number;
  compressionRatio: number;
  width: number;
  height: number;
}

export async function compressImage(
  source: File | Blob,
  options: CompressOptions = {}
): Promise<CompressResult> {
  const {
    maxWidthPx = 1280,
    maxHeightPx = 960,
    quality = 0.75,
    outputType = "image/jpeg",
  } = options;

  const originalSizeBytes = source.size;

  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate output dimensions keeping aspect ratio
      let { width, height } = img;
      if (width > maxWidthPx || height > maxHeightPx) {
        const ratio = Math.min(maxWidthPx / width, maxHeightPx / height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("Canvas 2D not supported")); return; }

      // White background for JPEGs (avoids transparent → black conversion)
      if (outputType === "image/jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
      }
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error("Compression failed")); return; }
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              blob,
              dataUrl: reader.result as string,
              originalSizeBytes,
              compressedSizeBytes: blob.size,
              compressionRatio: parseFloat((originalSizeBytes / blob.size).toFixed(2)),
              width,
              height,
            });
          };
          reader.readAsDataURL(blob);
        },
        outputType,
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
