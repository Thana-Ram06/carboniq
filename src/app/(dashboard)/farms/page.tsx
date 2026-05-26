"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useFarms } from "@/hooks/use-farms";
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
import type { Farm, CropType, IrrigationType, GeoPoint } from "@/types";
import toast from "react-hot-toast";
import Link from "next/link";

const DrawBoundaryMap = dynamic(
  () =>
    import("@/components/maps/draw-boundary-map").then(
      (m) => m.DrawBoundaryMap
    ),
  { ssr: false }
);

const farmSchema = z.object({
  name: z.string().min(2, "Farm name required"),
  location: z.string().min(2, "Location required"),
  state: z.string().min(1, "State required"),
  district: z.string().min(2, "District required"),
  cropType: z.string().min(1, "Select crop type"),
  areaHectares: z.coerce.number().min(0.1, "Area must be at least 0.1 ha"),
  irrigationType: z.string().min(1, "Select irrigation type"),
  soilType: z.string().optional(),
  notes: z.string().optional(),
});

type FarmFormData = z.infer<typeof farmSchema>;

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

const STATUS_COLORS: Record<string, "green" | "yellow" | "blue" | "gray"> = {
  active: "green",
  monitoring: "blue",
  inactive: "gray",
  verified: "yellow",
};

function FarmCard({
  farm,
  onDelete,
}: {
  farm: Farm;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <Card
      hover
      className="group relative overflow-hidden"
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate">{farm.name}</h3>
            <p className="text-xs text-muted-foreground mt-0.5 truncate">
              {farm.location}, {farm.state}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={STATUS_COLORS[farm.status] ?? "gray"} dot size="sm">
              {farm.status}
            </Badge>
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground/60 hover:text-zinc-400 hover:bg-white/5 transition-all"
              >
                <MoreVertical className="w-3.5 h-3.5" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-8 z-10 w-36 bg-card border border-border rounded-xl shadow-xl overflow-hidden">
                  <Link href={`/farms/${farm.id}`}>
                    <button className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-zinc-400 hover:text-foreground hover:bg-white/5 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      onDelete(farm.id);
                      setMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="p-2.5 rounded-xl bg-muted border border-border">
            <Ruler className="w-3.5 h-3.5 text-green-400 mb-1" />
            <p className="text-xs font-semibold text-foreground">
              {formatHectares(farm.areaHectares)}
            </p>
            <p className="text-[10px] text-muted-foreground/60">Area</p>
          </div>
          <div className="p-2.5 rounded-xl bg-muted border border-border">
            <Wheat className="w-3.5 h-3.5 text-emerald-400 mb-1" />
            <p className="text-xs font-semibold text-foreground truncate">
              {getCropLabel(farm.cropType)}
            </p>
            <p className="text-[10px] text-muted-foreground/60">Crop</p>
          </div>
          <div className="p-2.5 rounded-xl bg-muted border border-border">
            <Droplets className="w-3.5 h-3.5 text-blue-400 mb-1" />
            <p className="text-xs font-semibold text-foreground truncate">
              {getIrrigationLabel(farm.irrigationType).split(" ")[0]}
            </p>
            <p className="text-[10px] text-muted-foreground/60">Irrigation</p>
          </div>
        </div>

        <Link href={`/farms/${farm.id}`}>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-green-500/60 hover:text-green-400 transition-colors cursor-pointer">
            <Eye className="w-3 h-3" />
            View analytics →
          </div>
        </Link>
      </CardContent>
    </Card>
  );
}

export default function FarmsPage() {
  const { user } = useAuth();
  const { farms, loading, addFarm, removeFarm } = useFarms(user?.uid ?? null);
  const [showForm, setShowForm] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState<GeoPoint>({
    lat: 20.5937,
    lng: 78.9629,
  });

  const form = useForm<FarmFormData>({
    resolver: zodResolver(farmSchema),
    defaultValues: { irrigationType: "rainfed", cropType: "" },
  });

  const handleSubmit = async (data: FarmFormData) => {
    const id = await addFarm({
      ...data,
      cropType: data.cropType as CropType,
      irrigationType: data.irrigationType as IrrigationType,
      coordinates: selectedCoords,
    });
    if (id) {
      toast.success("Farm added successfully!");
      form.reset();
      setShowForm(false);
    }
  };

  const handleDelete = async (farmId: string) => {
    await removeFarm(farmId);
    toast.success("Farm removed");
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Farm Management</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {farms.length} farm{farms.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4" />
          Add Farm
        </Button>
      </div>

      {/* Add farm slide-in panel */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="w-full max-w-xl bg-background border-l border-border overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Add New Farm</h2>
                <button
                  onClick={() => setShowForm(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form
                onSubmit={form.handleSubmit(handleSubmit)}
                className="flex flex-col gap-5"
              >
                {/* Map */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Farm Location (click to select)
                  </label>
                  <DrawBoundaryMap
                    height="250px"
                    onLocationSelect={(pt) => setSelectedCoords(pt)}
                  />
                  <p className="text-xs text-muted-foreground/60 mt-1">
                    Selected: {selectedCoords.lat.toFixed(4)},{" "}
                    {selectedCoords.lng.toFixed(4)}
                  </p>
                </div>

                <Input
                  label="Farm Name"
                  placeholder="e.g., Rampur Agricultural Plot"
                  error={form.formState.errors.name?.message}
                  {...form.register("name")}
                />

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
                    label="Area (Hectares)"
                    type="number"
                    step="0.01"
                    placeholder="12.5"
                    leftIcon={<Ruler className="w-4 h-4" />}
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

                <Input
                  label="Soil Type (optional)"
                  placeholder="e.g., Black cotton soil"
                  {...form.register("soilType")}
                />

                <Textarea
                  label="Notes (optional)"
                  placeholder="Any additional notes about this farm..."
                  rows={3}
                  {...form.register("notes")}
                />

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    className="flex-1"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={form.formState.isSubmitting}
                  >
                    Add Farm
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Farm grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-[180px] rounded-2xl bg-card border border-border animate-pulse"
            />
          ))}
        </div>
      ) : farms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-3xl bg-green-500/8 border border-green-500/15 flex items-center justify-center mb-5">
            <Map className="w-7 h-7 text-green-400/60" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No farms yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm mb-6">
            Register your first farm to start monitoring carbon impact and NDVI
            analytics.
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
            className="h-[180px] rounded-2xl border-2 border-dashed border-border hover:border-green-500/25 flex flex-col items-center justify-center gap-2 text-muted-foreground/60 hover:text-zinc-400 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-green-500/8 border border-border group-hover:border-green-500/20 flex items-center justify-center transition-all">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium">Add Farm</span>
          </button>
        </div>
      )}
    </div>
  );
}
