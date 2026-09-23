"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Satellite, Database, Cpu, Activity, Bug, BarChart3, Map, ShieldAlert, HelpCircle, Sliders, Play, CheckCircle2, ArrowRight } from "lucide-react";

interface SolutionPipelineSectionProps {
  darkMode: boolean;
}

const PIPELINE_STAGES = [
  { step: "01", title: "Earth Observation", desc: "Sentinel-2 NDWI, MODIS LST, and CHIRPS rain data ingested weekly.", icon: Satellite, category: "INPUT" },
  { step: "02", title: "Data Processing", desc: "Cloud masking, atmospheric correction, and spatial resampling to 500m.", icon: Database, category: "INPUT" },
  { step: "03", title: "Feature Engineering", desc: "NDWI standing water index, LST surface temp, and 14-day rainfall accumulation.", icon: Cpu, category: "INPUT" },
  { step: "04", title: "Environmental Anomaly", desc: "Calculates Z-score deviation against 5-year historical baseline.", icon: Activity, category: "AI ENGINE" },
  { step: "05", title: "Breeding Suitability (BSI)", desc: "Calculates larval breeding suitability score (0-100) per cell.", icon: Bug, category: "AI ENGINE" },
  { step: "06", title: "Disease Forecast", desc: "Multi-horizon XGBoost & Random Forest 1–4 week outbreak risk model.", icon: BarChart3, category: "AI ENGINE" },
  { step: "07", title: "Spatial Risk Fusion", desc: "Blends spatial autocorrelation & boundary smoothing across 500m grid.", icon: Map, category: "AI ENGINE" },
  { step: "08", title: "Hyperlocal Hotspot", desc: "Identifies & ranks critical urban wards requiring immediate action.", icon: ShieldAlert, category: "ACTION" },
  { step: "09", title: "Explainable AI (SHAP)", desc: "Quantifies exact contribution of rain, temp, and standing water.", icon: HelpCircle, category: "ACTION" },
  { step: "10", title: "Intervention Engine", desc: "Recommends cost-effective larviciding, fogging, and source reduction.", icon: Sliders, category: "ACTION" },
  { step: "11", title: "Simulation Sandbox", desc: "Simulates 'What-If' mitigation scenarios to model case reduction ROI.", icon: Play, category: "ACTION" },
  { step: "12", title: "Public Health Action", desc: "Direct vector control deployment 21 days ahead of hospital surges.", icon: CheckCircle2, category: "ACTION" },
];

export function SolutionPipelineSection({ darkMode }: SolutionPipelineSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="pipeline" className={`py-16 md:py-24 border-y transition-colors ${darkMode ? "bg-[#061210] border-teal-brand/30" : "bg-paper-raised border-ink/20"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>End-to-End Intelligence Pipeline</span>
          </div>
          <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 ${darkMode ? "text-slate-100" : "text-ink"}`}>
            Space Data → AI Insight → <br className="hidden sm:inline" />
            <span className="italic text-teal-brand font-serif">Public Health Action</span>
          </h2>
          <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
            The 12-stage core pipeline that transforms raw multi-spectral satellite imagery into targeted, actionable vector control advisories.
          </p>
        </div>

        {/* Pipeline Stage Category Badges */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 font-mono text-xs">
          <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-600 font-medium flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>1. Satellite & Environmental Inputs (01-03)</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-teal-brand/10 border border-teal-brand/30 text-teal-brand font-medium flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-brand" />
            <span>2. Machine Learning Engine (04-07)</span>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 font-medium flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>3. Explainability & Action (08-12)</span>
          </span>
        </div>

        {/* 12-Stage Step-by-Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PIPELINE_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <motion.div
                key={stage.step}
                initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: shouldReduceMotion ? 0.01 : 0.35, delay: shouldReduceMotion ? 0 : (idx % 4) * 0.08 }}
                className={`p-5 rounded-xl border relative flex flex-col justify-between group hover:border-teal-brand transition-all ${
                  darkMode
                    ? "bg-[#0b1c19] border-teal-brand/20 hover:bg-[#0e2420]"
                    : "bg-paper border-ink/20 hover:bg-paper-raised shadow-sm"
                }`}
              >
                <div>
                  {/* Step Header */}
                  <div className="flex items-center justify-between mb-3 font-mono text-xs">
                    <span className="px-2 py-0.5 rounded font-bold bg-teal-brand/10 text-teal-brand border border-teal-brand/20">
                      STAGE {stage.step}
                    </span>
                    <span className="text-[10px] text-ink-muted uppercase tracking-wider font-semibold">
                      {stage.category}
                    </span>
                  </div>

                  {/* Stage Icon & Title */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="p-2 rounded bg-teal-brand/10 text-teal-brand group-hover:bg-teal-brand group-hover:text-paper transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif font-bold text-base">{stage.title}</h3>
                  </div>

                  {/* Stage Description */}
                  <p className="font-sans text-xs text-ink-muted leading-relaxed">
                    {stage.desc}
                  </p>
                </div>

                {/* Connecting Arrow for desktop */}
                {idx < PIPELINE_STAGES.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 opacity-30 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-4 h-4 text-teal-brand" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
