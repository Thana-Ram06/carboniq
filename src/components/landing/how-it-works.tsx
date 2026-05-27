"use client";

import { motion } from "framer-motion";
import { MapPin, Satellite, BarChart3, FileText } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: MapPin,
    title: "Register Your Farms",
    description:
      "Add farms with location coordinates, draw boundaries on interactive maps, and input crop and irrigation details.",
    detail: "Supports GeoJSON import · Manual boundary drawing · Batch upload",
  },
  {
    number: "02",
    icon: Satellite,
    title: "Satellite Analysis",
    description:
      "Our platform fetches and processes Sentinel-2 and Landsat imagery to compute NDVI, vegetation health, and moisture indices.",
    detail:
      "10m resolution · Real-time processing · Historical comparison",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Carbon Estimation",
    description:
      "The AI engine calculates estimated CO₂e reduction, carbon scores, and sustainability indices using IPCC-aligned methodology.",
    detail: "IPCC Tier 1 · Custom India factors · Confidence intervals",
  },
  {
    number: "04",
    icon: FileText,
    title: "Verification Reports",
    description:
      "Generate structured, verification-ready reports that document carbon potential for future credit workflows.",
    detail: "PDF export · CSV data · Audit trail",
  },
];

export function HowItWorks() {
  return (
    <section
      id="how-it-works"
      className="relative py-32 bg-background overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-green-500/15 to-transparent" />

      <div className="container mx-auto px-6 max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6">
            How It Works
          </div>
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-foreground mb-5">
            From farm to{" "}
            <span className="text-gradient">carbon intelligence</span>
            <br />
            in four steps
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            VASUDHA simplifies the complexity of agricultural carbon
            measurement into an intuitive workflow.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-8 top-10 bottom-10 w-px bg-gradient-to-b from-green-500/30 via-green-500/10 to-transparent hidden md:block" />

          <div className="flex flex-col gap-6">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6,
                    delay: i * 0.1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="flex gap-8 group"
                >
                  {/* Step indicator */}
                  <div className="relative flex-shrink-0 hidden md:flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-card border border-border group-hover:border-green-500/25 flex items-center justify-center transition-colors duration-300">
                      <Icon className="w-6 h-6 text-green-400" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-6 border-b border-border last:border-0">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xs font-mono text-green-500/60">
                        {step.number}
                      </span>
                      <div className="md:hidden w-8 h-8 rounded-xl bg-card border border-border flex items-center justify-center">
                        <Icon className="w-4 h-4 text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-muted-foreground mb-3 leading-relaxed">
                      {step.description}
                    </p>
                    <p className="text-xs text-muted-foreground/60 font-mono">
                      {step.detail}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
