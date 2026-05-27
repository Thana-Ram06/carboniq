"use client";

import { motion } from "framer-motion";
import { Leaf, TrendingUp, Globe2, Award } from "lucide-react";

const METRICS = [
  {
    icon: Leaf,
    label: "Average CO₂e Reduction",
    value: "18.4 t",
    sub: "per farm per year",
    color: "text-green-400",
    bg: "bg-green-500/8",
    border: "border-green-500/15",
  },
  {
    icon: TrendingUp,
    label: "Carbon Score Average",
    value: "72 / 100",
    sub: "across monitored farms",
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
  },
  {
    icon: Globe2,
    label: "Monitored Farmland",
    value: "2.5M ha",
    sub: "across 14 Indian states",
    color: "text-teal-400",
    bg: "bg-teal-500/8",
    border: "border-teal-500/15",
  },
  {
    icon: Award,
    label: "Verification Ready",
    value: "84%",
    sub: "of farms pass data quality",
    color: "text-yellow-400",
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/15",
  },
];

export function CarbonIntelligenceSection() {
  return (
    <section
      id="carbon"
      className="relative py-32 bg-background overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-green-500/15 to-transparent" />
      <div className="absolute inset-0 mesh-gradient opacity-50 pointer-events-none" />

      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: content */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6">
              Carbon Intelligence
            </div>
            <h2 className="font-instrument-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              Quantify your farm&apos;s{" "}
              <span className="text-gradient">carbon potential</span> with
              scientific precision
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              VASUDHA uses IPCC Tier 1 methodology adapted for Indian
              agriculture to estimate CO₂e reduction potential. Our AI engine
              factors in crop type, irrigation efficiency, NDVI scores, and soil
              organic carbon to generate accurate carbon estimations.
            </p>
            <p className="text-muted-foreground/70 leading-relaxed text-sm">
              All estimations come with confidence intervals and methodology
              transparency — ready for future carbon credit verification
              workflows under Verra, Gold Standard, or national frameworks.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <div className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-medium">
                IPCC Tier 1
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-medium">
                India-Specific Factors
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-medium">
                Soil Carbon
              </div>
              <div className="px-3 py-1.5 rounded-lg bg-green-500/8 border border-green-500/15 text-green-400 text-xs font-medium">
                Biomass Estimation
              </div>
            </div>
          </motion.div>

          {/* Right: metrics */}
          <motion.div
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-2 gap-4"
          >
            {METRICS.map((metric) => {
              const Icon = metric.icon;
              return (
                <div
                  key={metric.label}
                  className="p-5 rounded-2xl border border-border bg-card hover:border-green-500/25 transition-all duration-300"
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${metric.bg} border ${metric.border} flex items-center justify-center mb-4`}
                  >
                    <Icon className={`w-4.5 h-4.5 ${metric.color}`} />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {metric.value}
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">
                    {metric.label}
                  </p>
                  <p className="text-xs text-muted-foreground/50 mt-0.5">{metric.sub}</p>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
