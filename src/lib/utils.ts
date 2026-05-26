import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { CropType, IrrigationType, NDVIStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(n: number, decimals = 1): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(decimals)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(decimals)}K`;
  return n.toFixed(decimals);
}

export function formatHectares(ha: number): string {
  if (ha >= 1000) return `${(ha / 1000).toFixed(1)}K ha`;
  return `${ha.toFixed(1)} ha`;
}

export function formatCO2(tonnes: number): string {
  if (tonnes >= 1000) return `${(tonnes / 1000).toFixed(2)}K tCO₂e`;
  return `${tonnes.toFixed(2)} tCO₂e`;
}

export function getNDVIColor(ndvi: number): string {
  if (ndvi >= 0.7) return "#22c55e";
  if (ndvi >= 0.5) return "#4ade80";
  if (ndvi >= 0.3) return "#86efac";
  if (ndvi >= 0.1) return "#fbbf24";
  return "#ef4444";
}

export function getNDVIStatus(ndvi: number): NDVIStatus {
  if (ndvi >= 0.7) return "dense";
  if (ndvi >= 0.5) return "very_healthy";
  if (ndvi >= 0.3) return "healthy";
  if (ndvi >= 0.1) return "moderate";
  return "sparse";
}

export function getNDVILabel(status: NDVIStatus): string {
  const labels: Record<NDVIStatus, string> = {
    sparse: "Sparse",
    moderate: "Moderate",
    healthy: "Healthy",
    very_healthy: "Very Healthy",
    dense: "Dense",
  };
  return labels[status];
}

export function getCropLabel(crop: CropType): string {
  const labels: Record<CropType, string> = {
    rice: "Rice",
    wheat: "Wheat",
    sugarcane: "Sugarcane",
    cotton: "Cotton",
    maize: "Maize",
    soybean: "Soybean",
    groundnut: "Groundnut",
    sunflower: "Sunflower",
    mustard: "Mustard",
    other: "Other",
  };
  return labels[crop];
}

export function getIrrigationLabel(type: IrrigationType): string {
  const labels: Record<IrrigationType, string> = {
    drip: "Drip Irrigation",
    sprinkler: "Sprinkler",
    flood: "Flood Irrigation",
    rainfed: "Rainfed",
    canal: "Canal",
    borewell: "Borewell",
  };
  return labels[type];
}

export function getCarbonScoreGrade(
  score: number
): { grade: string; label: string; color: string } {
  if (score >= 85)
    return { grade: "A+", label: "Excellent", color: "text-green-400" };
  if (score >= 70)
    return { grade: "A", label: "Very Good", color: "text-green-500" };
  if (score >= 55)
    return { grade: "B", label: "Good", color: "text-emerald-500" };
  if (score >= 40)
    return { grade: "C", label: "Average", color: "text-yellow-500" };
  return { grade: "D", label: "Poor", color: "text-red-500" };
}

export function getSustainabilityColor(index: number): string {
  if (index >= 0.75) return "#4ade80";
  if (index >= 0.5) return "#86efac";
  if (index >= 0.25) return "#fbbf24";
  return "#f87171";
}

export function formatTimestamp(ts: { seconds: number } | Date | null): string {
  if (!ts) return "—";
  const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatRelativeTime(
  ts: { seconds: number } | Date | null
): string {
  if (!ts) return "—";
  const date = ts instanceof Date ? ts : new Date(ts.seconds * 1000);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) return formatTimestamp(ts);
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const INDIAN_STATES: string[] = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];
