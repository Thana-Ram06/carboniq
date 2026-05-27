"use client";

import { motion } from "framer-motion";
import {
  Satellite,
  BarChart3,
  MapPin,
  Leaf,
  Brain,
  Shield,
  Zap,
  Globe2,
} from "lucide-react";

const FEATURES = [
  {
    icon: Satellite,
    title: "Satellite Monitoring",
    description:
      "Real-time NDVI and vegetation analytics via Sentinel-2 and Landsat imagery for every registered farm.",
    color: "text-green-400",
    bg: "bg-green-500/8",
    border: "border-green-500/15",
  },
  {
    icon: Brain,
    title: "AI Carbon Estimation",
    description:
      "IPCC-aligned carbon estimation engine that computes CO₂e reduction and sustainability scores for each farm.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/8",
    border: "border-emerald-500/15",
  },
  {
    icon: MapPin,
    title: "Farm Boundary Mapping",
    description:
      "Draw precise farm boundaries on interactive maps and manage geo-tagged farm portfolios.",
    color: "text-teal-400",
    bg: "bg-teal-500/8",
    border: "border-teal-500/15",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Comprehensive NDVI charts, crop health timelines, and carbon potential metrics in one place.",
    color: "text-green-300",
    bg: "bg-green-500/6",
    border: "border-green-500/12",
  },
  {
    icon: Shield,
    title: "Verification-Ready Data",
    description:
      "Structured data exports aligned with carbon verification workflows for future credit issuance.",
    color: "text-lime-400",
    bg: "bg-lime-500/8",
    border: "border-lime-500/15",
  },
  {
    icon: Globe2,
    title: "Google Earth Engine Ready",
    description:
      "Architecture built for seamless GEE integration — enabling advanced planetary-scale analysis.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/8",
    border: "border-cyan-500/15",
  },
  {
    icon: Leaf,
    title: "Crop Intelligence",
    description:
      "Multi-crop support across 10+ Indian crop types with tailored carbon and health metrics.",
    color: "text-green-400",
    bg: "bg-green-500/8",
    border: "border-green-500/15",
  },
  {
    icon: Zap,
    title: "Instant Reports",
    description:
      "Generate farm-level and portfolio-level sustainability reports with one click.",
    color: "text-yellow-400",
    bg: "bg-yellow-500/8",
    border: "border-yellow-500/15",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
  },
};

export function Features() {
  return (
    <section
      id="features"
      className="relative py-32 bg-background overflow-hidden"
    >
      {/* Subtle divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-green-500/20 to-transparent" />

      <div className="container mx-auto px-6 max-w-6xl">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6">
            Platform Features
          </div>
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-foreground mb-5">
            Everything you need to{" "}
            <span className="text-gradient">quantify carbon impact</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
            A complete intelligence platform for monitoring agricultural carbon
            across India&apos;s diverse farming landscape.
          </p>
        </motion.div>

        {/* Feature grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          {FEATURES.map((feat) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                variants={cardVariants}
                className="group relative p-6 rounded-2xl border border-border bg-card hover:border-green-500/20 transition-all duration-300 cursor-default"
              >
                <div
                  className={`w-10 h-10 rounded-xl ${feat.bg} border ${feat.border} flex items-center justify-center mb-4`}
                >
                  <Icon className={`w-5 h-5 ${feat.color}`} />
                </div>
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feat.description}
                </p>

                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-[radial-gradient(ellipse_at_bottom_right,rgba(74,222,128,0.04),transparent_70%)]" />
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
