"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { cn } from "@/lib/utils";

interface ChartTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-2">{label}</p>
      {payload.map((item, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: item.color }}
          />
          <span className="text-muted-foreground">{item.name}:</span>
          <span className="text-foreground font-medium">
            {typeof item.value === "number"
              ? item.value.toFixed(1)
              : item.value}
          </span>
        </div>
      ))}
    </div>
  );
}

interface CarbonScoreChartProps {
  data: Array<{ month: string; carbonScore: number; co2eReduction: number }>;
  className?: string;
}

export function CarbonScoreChart({ data, className }: CarbonScoreChartProps) {
  return (
    <div className={cn("w-full h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="carbonGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#4ade80" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#4ade80" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="co2Grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#34d399" stopOpacity={0.2} />
              <stop offset="100%" stopColor="#34d399" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(74,222,128,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#4b5563", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4b5563", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="carbonScore"
            name="Carbon Score"
            stroke="#4ade80"
            strokeWidth={2}
            fill="url(#carbonGrad)"
            dot={false}
            activeDot={{ r: 4, fill: "#4ade80", strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="co2eReduction"
            name="CO₂e (t)"
            stroke="#34d399"
            strokeWidth={1.5}
            fill="url(#co2Grad)"
            dot={false}
            activeDot={{ r: 3, fill: "#34d399", strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

interface NDVIChartProps {
  data: Array<{ month: string; ndvi: number; biomass: number }>;
  className?: string;
}

export function NDVIChart({ data, className }: NDVIChartProps) {
  return (
    <div className={cn("w-full h-64", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(74,222,128,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="month"
            tick={{ fill: "#4b5563", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4b5563", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            domain={[0, 1]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="ndvi"
            name="NDVI"
            stroke="#4ade80"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: "#4ade80", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="biomass"
            name="Biomass"
            stroke="#60a5fa"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 4"
            activeDot={{ r: 3, fill: "#60a5fa", strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface CarbonBreakdownChartProps {
  data: Array<{ name: string; value: number }>;
  className?: string;
}

export function CarbonBreakdownChart({
  data,
  className,
}: CarbonBreakdownChartProps) {
  return (
    <div className={cn("w-full h-48", className)}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(74,222,128,0.06)"
            vertical={false}
          />
          <XAxis
            dataKey="name"
            tick={{ fill: "#4b5563", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#4b5563", fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="value"
            name="CO₂e (t)"
            fill="#4ade80"
            radius={[4, 4, 0, 0]}
            fillOpacity={0.8}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
