"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Zap, Shield, Satellite, Sparkles, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  darkMode: boolean;
}

export function HeroSection({ darkMode }: HeroSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.12,
        delayChildren: shouldReduceMotion ? 0 : 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <section id="hero" className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden">
      {/* Background Subtle Spatial Grid */}
      <div
        className={`absolute inset-0 pointer-events-none opacity-20 ${
          darkMode ? "bg-[radial-[#1c4b46]_1px,transparent_1px]" : "bg-[radial-[#12241f]_1px,transparent_1px]"
        } [background-size:24px_24px]`}
      />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-6">
            <div
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full font-mono text-xs border ${
                darkMode
                  ? "bg-teal-brand/20 border-teal-brand/40 text-teal-300"
                  : "bg-teal-brand/10 border-teal-brand/30 text-teal-brand"
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-teal-brand" />
              <span>Space-to-Action AI Platform for Hyperlocal Vector Risk</span>
            </div>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={itemVariants}
            className={`font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] ${
              darkMode ? "text-slate-100" : "text-ink"
            }`}
          >
            Predict outbreaks <br />
            <span className="italic text-teal-brand font-serif font-normal">
              before they spread.
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            variants={itemVariants}
            className={`font-sans text-base sm:text-xl max-w-3xl mx-auto mb-10 leading-relaxed ${
              darkMode ? "text-slate-300" : "text-ink-muted"
            }`}
          >
            EpiSat combines Earth Observation, AI and public-health intelligence to identify hyperlocal vector-borne disease risks before they become outbreaks.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap justify-center gap-4 font-mono text-sm"
          >
            <Link
              href="/dashboard"
              className="px-7 py-3.5 bg-teal-brand text-paper font-medium rounded-md hover:bg-teal-deep shadow-md hover:shadow-lg transition-all flex items-center space-x-2 group"
            >
              <span>Launch Command Center</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <a
              href="#pipeline"
              className={`px-7 py-3.5 font-medium rounded-md border transition-colors flex items-center space-x-2 ${
                darkMode
                  ? "bg-teal-brand/10 border-teal-brand/40 text-slate-200 hover:bg-teal-brand/20"
                  : "bg-paper border-ink/30 text-ink hover:bg-paper-raised"
              }`}
            >
              <span>Explore Technology</span>
              <ChevronDown className="w-4 h-4" />
            </a>
          </motion.div>

          {/* Quick Metrics Bar */}
          <motion.div
            variants={itemVariants}
            className={`mt-14 pt-8 border-t w-full max-w-4xl grid grid-cols-2 md:grid-cols-4 gap-6 text-left font-mono text-xs ${
              darkMode ? "border-teal-brand/20 text-slate-400" : "border-ink/15 text-ink-muted"
            }`}
          >
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-brand font-bold">SPATIAL RESOLUTION</div>
              <div className={`font-serif text-xl font-bold mt-0.5 ${darkMode ? "text-slate-100" : "text-ink"}`}>500m × 500m</div>
              <div className="text-[11px] mt-0.5">Micro-Grid Precision</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-brand font-bold">EARLY WARNING</div>
              <div className={`font-serif text-xl font-bold mt-0.5 ${darkMode ? "text-slate-100" : "text-ink"}`}>1–4 Weeks</div>
              <div className="text-[11px] mt-0.5">Lead-Time Horizon</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-brand font-bold">SATELLITE DATA</div>
              <div className={`font-serif text-xl font-bold mt-0.5 ${darkMode ? "text-slate-100" : "text-ink"}`}>Sentinel & MODIS</div>
              <div className="text-[11px] mt-0.5">NDWI + LST + Rain</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-teal-brand font-bold">EXPLAINABILITY</div>
              <div className={`font-serif text-xl font-bold mt-0.5 ${darkMode ? "text-slate-100" : "text-ink"}`}>SHAP Values</div>
              <div className="text-[11px] mt-0.5">Actionable Drivers</div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
