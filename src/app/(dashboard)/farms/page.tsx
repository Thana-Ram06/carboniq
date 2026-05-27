"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Map,
  Wheat,
  Droplets,
  Ruler,
  MoreVertical,
  Eye,
  Trash2,
  X,
  User,
  MapPin,
  Layers,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
import { saveFarmBoundary } from "@/lib/firestore";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  getCropLabel,
  getIrrigationLabel,
  formatHectares,
  INDIAN_STATES,
} from "@/lib/utils";
import type { Farm, CropType, IrrigationType, FarmBoundary } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

const DrawBoundaryMap = dynamic(
  () =>
    import("@/components/maps/draw-boundary-map").then(
      (m) => m.DrawBoundaryMap
    ),
  { ssr: false, loading: () => <div className="h-[360px] rounded-2xl bg-card border border-border animate-pulse" /> }
);

// ── Schema ────────────────────────────────────────────────────────────────────

const farmSchema = z.object({
  name: z.string().min(2, "Farm name required"),
  farmerName: z.string().min(2, "Farmer name required"),
  location: z.string().min(2, "Village/location required"),
  district: z.string().min(2, "District required"),
  state: z.string().min(1, "State required"),
  cropType: z.string().min(1, "Select crop type"),
  areaHectares: z.coerce.number().min(0.01, "Area must be at least 0.01 ha"),
  irrigationType: z.string().min(1, "Select irrigation type"),
  soilType: z.string().optional(),
  notes: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

// ── Options ───────────────────────────────────────────────────────────────────

const CROP_OPTIONS = [
  { value: "rice", label: "Rice" },
  { value: "wheat", label: "Wheat" },
  { value: "sugarcane", label: "Sugarcane" },
  { value: "cotton", label: "Cotton" },
  { value: "maize", label: "Maize" },
  { value: "soybean", label: "Soybean" },
  { value: "groundnut", label: "Groundnut" },
  { value: "sunflower", label: "Sunflower" },
  { value: "mustard", label: "Mustard" },
  { value: "other", label: "Other" },
];

const IRRIGATION_OPTIONS = [
  { value: "drip", label: "Drip Irrigation" },
  { value: "sprinkler", label: "Sprinkler" },
  { value: "flood", label: "Flood Irrigation" },
  { value: "rainfed", label: "Rainfed" },
  { value: "canal", label: "Canal" },
  { value: "borewell", label: "Borewell" },
];

const SOIL_OPTIONS = [
  { value: "alluvial", label: "Alluvial" },
  { value: "black", label: "Black Cotton" },
  { value: "red", label: "Red & Laterite" },
  { value: "laterite", label: "Laterite" },
  { value: "desert", label: "Desert / Arid" },
  { value: "mountain", label: "Mountain / Forest" },
  { value: "other", label: "Other" },
];

const STATUS_COLORS: Record<string, "green" | "yellow" | "blue" | "gray"> = {
  active: "green",
  monitoring: "blue",
  inactive: "gray",
  verified: "yellow",
};

// ── Crop icon helper ─────────────────────────────────────────────────────────
const CROP_EMOJI: Record<string, string> = {
  rice: "🌾", wheat: "🌾", sugarcane: "🎋", cotton: "🌸",
  maize: "🌽", soybean: "🫘", groundnut: "🥜", sunflower: "🌻",
  mustard: "🌼", other: "🌿",
};

// ── Farm Card ─────────────────────────────────────────────────────────────────

function FarmCard({ farm, onDelete }: { farm: Farm; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hasBoundary = !!farm.boundary?.coordinates?.[0]?.length;

  return (
    <Card hover className="group relative overflow-hidden">
      <CardContent className="p-0">
        {/* Mini map placeholder / boundary indicator */}
        <div
          className="h-24 relative overflow-hidden rounded-t-2xl border-b border-border"
          style={{ background: "linear-gradient(135deg, #040906 0%, #07120a 100%)" }}
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: "linear-gradient(rgba(74,222,128,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(74,222,128,0.06) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            {hasBoundary ? (
              <div className="flex flex-col items-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className="text-[10px] text-green-400/70 font-medium">Boundary mapped</span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1">
                <MapPin className="w-5 h-5 text-zinc-600" />
                <span className="text-[10px] text-zinc-600">No boundary</span>
              </div>
            )}
          </div>
          {/* Status badge */}
          <div className="absolute top-2 left-2">
            <Badge variant={STATUS_COLORS[farm.status] ?? "gray"} dot size="sm">
              {farm.status}
            </Badge>
          </div>
          {/* Crop emoji */}
          <div className="absolute top-2 right-2 text-base">
            {CROP_EMOJI[farm.cropType] ?? "🌿"}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-sm truncate">{farm.name}</h3>
              {farm.farmerName && (
                <p className="text-xs text-muted-foreground/70 truncate flex items-center gap-1 mt-0.5">
                  <User className="w-2.5 h-2.5" />
                  {farm.farmerName}
                </p>
              )}
              <p className="text-xs text-muted-foreground/50 truncate mt-0.5">
                {farm.location}, {farm.state}
              </p>
            </div>
            <div className="relative ml-2">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-muted-foreground/50 hover:text-foreground hover:bg-foreground/5 transition-all"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-7 z-20 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                    <Link href={`/farms/${farm.id}`}>
                      <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-foreground/5 transition-colors">
                        <Eye className="w-3.5 h-3.5" /> View Details
                      </button>
                    </Link>
                    <button
                      onClick={() => { onDelete(farm.id); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-1.5 mt-3">
            <div className="p-2 rounded-xl bg-muted border border-border">
              <Ruler className="w-3 h-3 text-green-400 mb-1" />
              <p className="text-xs font-semibold text-foreground">{formatHectares(farm.areaHectares)}</p>
              <p className="text-[10px] text-muted-foreground/50">Area</p>
            </div>
            <div className="p-2 rounded-xl bg-muted border border-border">
              <Wheat className="w-3 h-3 text-emerald-400 mb-1" />
              <p className="text-xs font-semibold text-foreground truncate">{getCropLabel(farm.cropType)}</p>
              <p className="text-[10px] text-muted-foreground/50">Crop</p>
            </div>
            <div className="p-2 rounded-xl bg-muted border border-border">
              <Droplets className="w-3 h-3 text-blue-400 mb-1" />
              <p className="text-xs font-semibold text-foreground truncate">
                {getIrrigationLabel(farm.irrigationType).split(" ")[0]}
              </p>
              <p className="text-[10px] text-muted-foreground/50">Water</p>
            </div>
          </div>

          <Link href={`/farms/${farm.id}`}>
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground/40 hover:text-green-400 transition-colors cursor-pointer group/link">
              <span>View analytics</span>
              <ChevronRight className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" />
            </div>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Add Farm Form ─────────────────────────────────────────────────────────────

function AddFarmPanel({ onClose, onAdded }: { onClose: () => void; onAdded: (id: string) => void }) {
  const { user } = useAuth();
  const { addFarm } = useFarms(user?.uid ?? null);
  const [drawnBoundary, setDrawnBoundary] = useState<FarmBoundary | null>(null);
  const [drawnArea, setDrawnArea] = useState<number | null>(null);
  const [drawnCenter, setDrawnCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [step, setStep] = useState<1 | 2>(1);

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: { irrigationType: "rainfed", cropType: "" },
  });

  const handleAreaFromPolygon = useCallback((area: number) => {
    setDrawnArea(area);
    if (area > 0) {
      form.setValue("areaHectares", parseFloat(area.toFixed(4)));
    }
  }, [form]);

  const handleSubmit = async (data: FarmFormData) => {
    if (!user?.uid) return;

    const coordinates = drawnCenter ?? { lat: 20.5937, lng: 78.9629 };

    const id = await addFarm({
      name: data.name,
      farmerName: data.farmerName,
      location: data.location,
      state: data.state,
      district: data.district,
      cropType: data.cropType as CropType,
      areaHectares: data.areaHectares,
      irrigationType: data.irrigationType as IrrigationType,
      soilType: data.soilType || undefined,
      notes: data.notes || undefined,
      coordinates,
      boundary: drawnBoundary ?? undefined,
    });

    if (id) {
      // Save boundary to its own collection too
      if (drawnBoundary) {
        try {
          await saveFarmBoundary(id, user.uid, drawnBoundary, data.areaHectares);
        } catch {
          // Non-fatal — boundary is already on the farm doc
        }
      }
      toast.success("Farm added successfully!");
      onAdded(id);
    } else {
      toast.error("Failed to add farm. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="flex-1 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="w-full max-w-lg bg-background border-l border-border overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Add New Farm</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step} of 2 — {step === 1 ? "Farm details" : "Boundary mapping"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step indicators */}
        <div className="px-6 pt-4 pb-2 flex gap-2">
          {[1, 2].map((s) => (
            <button
              key={s}
              onClick={() => setStep(s as 1 | 2)}
              className={`flex-1 h-1 rounded-full transition-all ${
                s <= step ? "bg-green-500" : "bg-border"
              }`}
            />
          ))}
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="flex-1 flex flex-col">
          {/* ── Step 1: Farm Details ──────────────────────────────────── */}
          {step === 1 && (
            <div className="flex flex-col gap-4 px-6 py-4">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Farm Name"
                  placeholder="e.g., Rampur Khet"
                  error={form.formState.errors.name?.message}
                  {...form.register("name")}
                />
                <Input
                  label="Farmer Name"
                  placeholder="e.g., Ramesh Kumar"
                  leftIcon={<User className="w-3.5 h-3.5" />}
                  error={form.formState.errors.farmerName?.message}
                  {...form.register("farmerName")}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Village / Location"
                  placeholder="Village name"
                  error={form.formState.errors.location?.message}
                  {...form.register("location")}
                />
                <Input
                  label="District"
                  placeholder="District"
                  error={form.formState.errors.district?.message}
                  {...form.register("district")}
                />
              </div>

              <Select
                label="State"
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="Select state"
                error={form.formState.errors.state?.message}
                {...form.register("state")}
              />

              <div className="grid grid-cols-2 gap-3">
                <Select
                  label="Crop Type"
                  options={CROP_OPTIONS}
                  placeholder="Select crop"
                  error={form.formState.errors.cropType?.message}
                  {...form.register("cropType")}
                />
                <Input
                  label={drawnArea ? `Area (ha) · auto-filled` : "Area (Hectares)"}
                  type="number"
                  step="0.01"
                  placeholder="12.5"
                  leftIcon={<Ruler className="w-3.5 h-3.5" />}
                  error={form.formState.errors.areaHectares?.message}
                  {...form.register("areaHectares")}
                />
              </div>

              <Select
                label="Irrigation Type"
                options={IRRIGATION_OPTIONS}
                placeholder="Select irrigation"
                error={form.formState.errors.irrigationType?.message}
                {...form.register("irrigationType")}
              />

              <Select
                label="Soil Type (optional)"
                options={SOIL_OPTIONS}
                placeholder="Select soil type"
                {...form.register("soilType")}
              />

              <Textarea
                label="Notes (optional)"
                placeholder="Additional notes about this farm..."
                rows={2}
                {...form.register("notes")}
              />

              <Button
                type="button"
                variant="primary"
                onClick={() => setStep(2)}
              >
                Next — Draw Boundary
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ── Step 2: Boundary Drawing ──────────────────────────────── */}
          {step === 2 && (
            <div className="flex flex-col gap-4 px-6 py-4 flex-1">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-green-500/8 border border-green-500/15">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-green-300">Draw Farm Boundary</p>
                  <p className="text-xs text-muted-foreground/70 mt-0.5">
                    Click &ldquo;Draw Boundary&rdquo; on the map, then click to place vertices. Double-click or press Finish to close the polygon. Area is computed automatically.
                  </p>
                </div>
              </div>

              <DrawBoundaryMap
                height="360px"
                existingBoundary={drawnBoundary}
                onBoundaryChange={setDrawnBoundary}
                onAreaChange={handleAreaFromPolygon}
                onCenterChange={setDrawnCenter}
              />

              {drawnBoundary && (
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    Boundary drawn · {drawnArea?.toFixed(2)} ha computed
                  </span>
                </div>
              )}

              {!drawnBoundary && (
                <p className="text-xs text-muted-foreground/50 text-center">
                  Boundary is optional — you can add it later from the farm detail page.
                </p>
              )}
            </div>
          )}

          {/* Footer actions */}
          <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t border-border px-6 py-4 flex gap-3">
            {step === 2 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            <Button
              type="submit"
              variant="primary"
              className="flex-1"
              loading={form.formState.isSubmitting}
              disabled={step === 1}
            >
              {step === 1 ? "Continue" : "Save Farm"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FarmsPage() {
  const { user } = useAuth();
  const { farms, loading, refetch, removeFarm } = useFarms(user?.uid ?? null);
  const [showForm, setShowForm] = useState(false);

  const totalArea = farms.reduce((s, f) => s + (f.areaHectares ?? 0), 0);
  const activeFarms = farms.filter((f) => f.status === "active" || f.status === "monitoring");
  const withBoundary = farms.filter((f) => f.boundary?.coordinates?.length);

  // Crop breakdown
  const cropCounts: Record<string, number> = {};
  farms.forEach((f) => {
    cropCounts[f.cropType] = (cropCounts[f.cropType] ?? 0) + 1;
  });
  const topCrop = Object.entries(cropCounts).sort((a, b) => b[1] - a[1])[0];

  const handleDelete = async (farmId: string) => {
    await removeFarm(farmId);
    toast.success("Farm removed");
  };

  const handleAdded = (id: string) => {
    setShowForm(false);
    refetch();
    void id;
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Farm Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {farms.length} farm{farms.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" />
          Add Farm
        </Button>
      </div>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      {farms.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            {
              icon: Map,
              label: "Total Farms",
              value: farms.length.toString(),
              sub: `${activeFarms.length} active`,
              color: "text-green-400",
            },
            {
              icon: Ruler,
              label: "Total Area",
              value: `${totalArea.toFixed(1)} ha`,
              sub: `${(totalArea * 2.47).toFixed(0)} acres`,
              color: "text-emerald-400",
            },
            {
              icon: Layers,
              label: "Boundaries",
              value: `${withBoundary.length}`,
              sub: `of ${farms.length} mapped`,
              color: "text-blue-400",
            },
            {
              icon: Wheat,
              label: "Top Crop",
              value: topCrop ? getCropLabel(topCrop[0] as CropType) : "—",
              sub: topCrop ? `${topCrop[1]} farm${topCrop[1] > 1 ? "s" : ""}` : "no data",
              color: "text-amber-400",
            },
          ].map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.label}
                className="p-4 rounded-2xl border border-border bg-card flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-muted border border-border flex items-center justify-center shrink-0">
                  <Icon className={`w-4 h-4 ${s.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground/60">{s.label}</p>
                  <p className="text-base font-bold text-foreground leading-tight">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground/40">{s.sub}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Farm Grid ─────────────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[260px] rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-500/8 border border-green-500/15 flex items-center justify-center mb-5">
            <Map className="w-7 h-7 text-green-400/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No farms yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Register your first farm to start monitoring carbon impact, NDVI
            analytics, and draw geospatial boundaries.
          </p>
          <Button variant="primary" onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4" />
            Add First Farm
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {farms.map((farm) => (
            <FarmCard key={farm.id} farm={farm} onDelete={handleDelete} />
          ))}
          <button
            onClick={() => setShowForm(true)}
            className="h-[260px] rounded-2xl border-2 border-dashed border-border hover:border-green-500/25 flex flex-col items-center justify-center gap-2 text-muted-foreground/60 hover:text-muted-foreground transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-green-500/8 border border-border group-hover:border-green-500/20 flex items-center justify-center transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Add Farm</span>
          </button>
        </div>
      )}

      {/* ── Add Farm Panel ────────────────────────────────────────────────── */}
      {showForm && (
        <AddFarmPanel
          onClose={() => setShowForm(false)}
          onAdded={handleAdded}
        />
      )}
    </div>
  );
}
