"use client";
import { useState } from "react";
import { Link2, Satellite, Database, Globe, Cloud, MapPin } from "lucide-react";
import { DataSourceStatus } from "@/components/integrations/DataSourceStatus";
import { GEEAnalysisPanel } from "@/components/integrations/GEEAnalysisPanel";
import { BHUVAN_LAYERS } from "@/lib/integrations/bhuvan";
import { getStationsForState } from "@/lib/integrations/imd-weather";
import type { IndianState } from "@/types";

const STATES: IndianState[] = ["Maharashtra", "Punjab", "Uttar Pradesh", "Karnataka", "Rajasthan", "West Bengal"];

const INTEGRATION_CARDS = [
  {
    id: "gee",
    name: "Google Earth Engine",
    description: "Advanced satellite processing, historical imagery analysis, and large-scale NDVI computation.",
    icon: Satellite,
    status: "active",
    version: "REST API v1alpha",
    color: "text-green-400 bg-green-500/10 border-green-500/20",
  },
  {
    id: "copernicus",
    name: "Copernicus Data Space",
    description: "Sentinel-1/2/3/5P imagery from ESA CDSE. Cloud-free composites for vegetation and SAR analysis.",
    icon: Globe,
    status: "active",
    version: "CDSE OData v1",
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "bhuvan",
    name: "ISRO Bhuvan",
    description: "LULC, soil maps, watershed atlas, and NDVI district data from India's national geo-portal.",
    icon: MapPin,
    status: "active",
    version: "WMS/WFS 2.0",
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  {
    id: "imd",
    name: "IMD Weather",
    description: "India Meteorological Department station observations and seasonal forecasts.",
    icon: Cloud,
    status: "active",
    version: "IMD OpenData API",
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  {
    id: "icar",
    name: "ICAR / MoAFW Baselines",
    description: "National crop yield and area statistics from ICAR and Ministry of Agriculture.",
    icon: Database,
    status: "embedded",
    version: "2023-24 Statistics",
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
];

export default function IntegrationsPage() {
  const [selectedState, setSelectedState] = useState<IndianState>("Maharashtra");
  const stations = getStationsForState(selectedState);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-500/10 border border-blue-500/20 p-2.5">
          <Link2 className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">External Integrations</h1>
          <p className="text-sm text-slate-400">National datasets, geospatial systems, and scientific data providers</p>
        </div>
      </div>

      {/* State Selector */}
      <div className="flex items-center gap-3">
        <p className="text-xs text-slate-400">Preview state:</p>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value as IndianState)}
          className="rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
        >
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {INTEGRATION_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.id} className={`rounded-xl border p-4 ${card.color}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <p className="text-sm font-semibold text-white">{card.name}</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-xs ${
                  card.status === "active" ? "bg-green-500/20 text-green-300" : "bg-blue-500/20 text-blue-300"
                }`}>
                  {card.status === "active" ? "Connected" : "Embedded"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mb-2">{card.description}</p>
              <p className="text-xs text-slate-500">{card.version}</p>
            </div>
          );
        })}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Copernicus Scene Availability */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">Copernicus Scene Availability</p>
          <DataSourceStatus state={selectedState} />
        </div>

        {/* GEE Task Queue */}
        <div className="rounded-xl border border-white/5 bg-white/3 p-4">
          <p className="text-sm font-semibold text-white mb-4">GEE Processing Queue</p>
          <GEEAnalysisPanel state={selectedState} />
        </div>
      </div>

      {/* ISRO Bhuvan Layers */}
      <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-sm font-semibold text-white">ISRO Bhuvan — Available Layers</p>
          <p className="text-xs text-slate-400 mt-0.5">{BHUVAN_LAYERS.length} layers indexed</p>
        </div>
        <div className="divide-y divide-white/5">
          {BHUVAN_LAYERS.map((layer) => (
            <div key={layer.layerId} className="flex items-start gap-3 px-4 py-3 hover:bg-white/2">
              <span className={`mt-0.5 rounded-full px-2 py-0.5 text-xs ${
                layer.category === "LULC" ? "bg-green-500/15 text-green-300" :
                layer.category === "Soil" ? "bg-orange-500/15 text-orange-300" :
                layer.category === "Crop" ? "bg-emerald-500/15 text-emerald-300" :
                layer.category === "Elevation" ? "bg-blue-500/15 text-blue-300" :
                "bg-slate-500/15 text-slate-300"
              }`}>
                {layer.category}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{layer.name}</p>
                <p className="text-xs text-slate-400">
                  {layer.resolution > 0 ? `${layer.resolution}m · ` : ""}
                  Updated {layer.lastUpdated}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* IMD Stations */}
      <div className="rounded-xl border border-white/5 bg-white/3 overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <p className="text-sm font-semibold text-white">IMD Weather Stations — {selectedState}</p>
          <p className="text-xs text-slate-400 mt-0.5">{stations.length} stations indexed</p>
        </div>
        <div className="divide-y divide-white/5">
          {stations.map((s) => (
            <div key={s.stationId} className="flex items-center gap-3 px-4 py-3">
              <Cloud className="h-4 w-4 text-cyan-400 shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-white">{s.stationName}</p>
                <p className="text-xs text-slate-400">{s.district} · {s.elevation}m elev.</p>
              </div>
              <p className="text-xs text-slate-400">{s.latitude.toFixed(2)}°N, {s.longitude.toFixed(2)}°E</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
