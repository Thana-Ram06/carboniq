"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Play, Satellite } from "lucide-react";

const STATS = [
  { value: "10,000+", label: "Farms Monitored" },
  { value: "2.5M ha", label: "Agricultural Land" },
  { value: "94%", label: "NDVI Accuracy" },
  { value: "₹2.4B", label: "Carbon Potential" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] },
  }),
};

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-background">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-60" />

      {/* Hero gradient blobs */}
      <div className="absolute top-0 right-0 w-[700px] h-[700px] rounded-full bg-gradient-radial from-green-500/8 to-transparent blur-3xl -translate-y-1/4 translate-x-1/4 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-gradient-radial from-emerald-500/5 to-transparent blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      {/* Globe visualization */}
      <GlobeVisual />

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 pt-32 pb-24 text-center max-w-5xl">
        {/* Badge */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-400 text-sm font-medium mb-8"
        >
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Earth Intelligence for a Sustainable Future
        </motion.div>

        {/* Main heading */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="font-instrument-serif text-5xl md:text-6xl lg:text-[80px] text-foreground mb-6 leading-[1.08] tracking-tight"
        >
          AI-Powered Agricultural
          <br />
          <span className="text-gradient">Carbon Intelligence</span>
          <br />
          <span className="text-foreground/50 text-3xl md:text-4xl lg:text-5xl font-normal">
            for India
          </span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          custom={2}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
        >
          Monitor crops, estimate carbon impact, and prepare verification-ready
          agricultural insights using satellite intelligence and AI.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={3}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-col sm:flex-row gap-4 justify-center mb-24"
        >
          <Link href="/login">
            <button className="group inline-flex items-center gap-2.5 h-12 px-8 bg-green-500 hover:bg-green-400 text-black font-semibold rounded-xl transition-all duration-200 text-base shadow-[0_0_30px_rgba(74,222,128,0.25)] hover:shadow-[0_0_50px_rgba(74,222,128,0.4)]">
              Get Started Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </Link>
          <button className="inline-flex items-center gap-2.5 h-12 px-8 border border-green-500/20 hover:border-green-500/35 bg-green-500/5 hover:bg-green-500/10 text-green-300 font-medium rounded-xl transition-all duration-200 text-base">
            <Play className="w-4 h-4 fill-current" />
            Watch Demo
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="flex flex-wrap justify-center gap-x-12 gap-y-6"
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  );
}

function GlobeVisual() {
  return (
    <div className="absolute right-4 xl:right-16 top-1/2 -translate-y-1/2 w-[400px] h-[400px] pointer-events-none opacity-25 lg:opacity-40 hidden lg:block">
      <div className="relative w-full h-full">
        {/* Sphere */}
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(ellipse_at_35%_35%,rgba(20,55,35,0.9)_0%,rgba(4,9,6,0.95)_65%)] border border-green-500/10 shadow-[0_0_80px_rgba(74,222,128,0.08),inset_0_0_60px_rgba(0,0,0,0.6)]" />

        {/* Latitude rings */}
        {[75, 55, 35, 15].map((pct, i) => (
          <div
            key={i}
            className="absolute rounded-full border border-green-500/[0.07]"
            style={{
              width: `${pct}%`,
              height: `${pct}%`,
              top: `${(100 - pct) / 2}%`,
              left: `${(100 - pct) / 2}%`,
            }}
          />
        ))}

        {/* Meridian lines */}
        {[0, 30, 60, 90, 120, 150].map((deg) => (
          <div
            key={deg}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: `rotate(${deg}deg)` }}
          >
            <div className="w-px h-full bg-gradient-to-b from-transparent via-green-500/8 to-transparent" />
          </div>
        ))}

        {/* India region dot cluster */}
        {[
          { top: "38%", left: "52%", delay: "0s", size: "w-2 h-2" },
          { top: "48%", left: "48%", delay: "0.7s", size: "w-1.5 h-1.5" },
          { top: "54%", left: "55%", delay: "1.4s", size: "w-2 h-2" },
          { top: "42%", left: "58%", delay: "0.35s", size: "w-1.5 h-1.5" },
          { top: "58%", left: "46%", delay: "1s", size: "w-1 h-1" },
        ].map((dot, i) => (
          <div
            key={i}
            className={`absolute rounded-full bg-green-400 animate-pulse ${dot.size}`}
            style={{
              top: dot.top,
              left: dot.left,
              animationDelay: dot.delay,
            }}
          >
            <div
              className={`absolute inset-0 rounded-full bg-green-400/20 scale-[3.5] animate-ping ${dot.size}`}
              style={{ animationDelay: dot.delay, animationDuration: "2s" }}
            />
          </div>
        ))}

        {/* Orbiting satellite */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ animation: "spin 22s linear infinite" }}
        >
          <div
            className="relative"
            style={{ width: "340px", height: "340px" }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3">
              <Satellite className="w-5 h-5 text-green-400 drop-shadow-[0_0_6px_rgba(74,222,128,0.8)]" />
            </div>
          </div>
        </div>

        {/* Outer glow ring */}
        <div className="absolute inset-[-8px] rounded-full border border-green-500/[0.05]" />
        <div className="absolute inset-[-20px] rounded-full border border-green-500/[0.03]" />
      </div>
    </div>
  );
}
