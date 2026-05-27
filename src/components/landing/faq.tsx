"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";

const FAQS = [
  {
    q: "What is VASUDHA and who is it for?",
    a: "VASUDHA is an AI-powered Earth Intelligence platform designed for Indian farmers, agri-tech companies, carbon project developers, and sustainability analysts. It helps monitor crops via satellite data, estimate carbon sequestration potential, and prepare data for future carbon credit verification.",
  },
  {
    q: "Does this platform generate actual carbon credits?",
    a: "No — VASUDHA is an Earth Intelligence and estimation platform. It computes estimated carbon scores and CO₂e reduction potential based on satellite and farm data. The verification and issuance of actual carbon credits requires separate accreditation through approved methodologies (e.g., Verra, Gold Standard). VasudhaCarbon prepares you with the structured data needed for that process.",
  },
  {
    q: "What satellite data sources does VASUDHA use?",
    a: "The platform is designed to work with Sentinel-2 (10m resolution), Landsat 8/9, and MODIS imagery. The current MVP uses mock satellite data and placeholder NDVI values to demonstrate the analytics workflow. Google Earth Engine integration is on the roadmap for live data.",
  },
  {
    q: "What crops are supported?",
    a: "VASUDHA supports 10 major Indian crop types: Rice, Wheat, Sugarcane, Cotton, Maize, Soybean, Groundnut, Sunflower, Mustard, and Other. Each crop has specific carbon factors tuned for Indian agricultural conditions.",
  },
  {
    q: "How is the carbon score calculated?",
    a: "Carbon scores use IPCC Tier 1 methodology adapted for Indian agriculture. The estimation considers NDVI (vegetation density), crop type, farm size, irrigation efficiency, soil organic carbon, and seasonal cycles. The results include CO₂e reduction estimates, biomass carbon, and soil carbon sequestration.",
  },
  {
    q: "Is my farm data secure?",
    a: "Yes. VasudhaCarbon uses Firebase with enterprise-grade security. All data is encrypted in transit and at rest. Firestore security rules ensure users can only access their own farm data. We follow Google Cloud's security standards and best practices.",
  },
  {
    q: "Can I export reports?",
    a: "Yes — the Reports module allows you to generate farm-level and portfolio-level sustainability reports. PDF and CSV export options are available (with full generation in the roadmap). Reports include carbon scores, NDVI data, and verification-ready summaries.",
  },
  {
    q: "Is VASUDHA free to use?",
    a: "VASUDHA is currently in early access. The core platform features are available during the beta period. Future pricing will be tiered based on number of farms, analytics depth, and reporting features.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-32 bg-background relative overflow-hidden">
      <div className="absolute left-1/2 -translate-x-1/2 w-[600px] h-px bg-gradient-to-r from-transparent via-green-500/15 to-transparent" />

      <div className="container mx-auto px-6 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-xs font-medium mb-6">
            FAQ
          </div>
          <h2 className="font-instrument-serif text-4xl md:text-5xl text-foreground mb-4">
            Frequently asked{" "}
            <span className="text-gradient">questions</span>
          </h2>
          <p className="text-muted-foreground">
            Everything you need to know about VASUDHA
          </p>
        </motion.div>

        <div className="flex flex-col gap-2">
          {FAQS.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              className="rounded-2xl border border-border bg-card overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-sm font-medium text-foreground">
                  {faq.q}
                </span>
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-green-500/10 flex items-center justify-center">
                  {openIndex === i ? (
                    <Minus className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Plus className="w-3.5 h-3.5 text-green-400" />
                  )}
                </div>
              </button>
              <AnimatePresence>
                {openIndex === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                  >
                    <div className="px-5 pb-5">
                      <p className="text-sm text-muted-foreground leading-relaxed border-t border-border pt-4">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
