"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Cpu, Satellite, Database, Brain, Monitor, ArrowDown } from "lucide-react";

interface TechStackSectionProps {
  darkMode: boolean;
}

export function TechStackSection({ darkMode }: TechStackSectionProps) {
  const shouldReduceMotion = useReducedMotion();

  const layers = [
    {
      title: "1. Data Ingestion & Earth Observation Layer",
      icon: Satellite,
      desc: "Ingests automated weekly multi-spectral imagery and meteorological feeds.",
      techs: ["Copernicus API (Sentinel-2 L2A)", "NASA Earthdata (MODIS LST)", "CHIRPS Rainfall Grids", "Open-Meteo Weather API"],
      color: "border-blue-500/40 bg-blue-500/5 text-blue-600",
    },
    {
      title: "2. Geospatial Processing & Feature Store Layer",
      icon: Database,
      desc: "Processes spatial raster grids, cloud masking, and 500m cell index resolution.",
      techs: ["PostGIS Geospatial DB", "GeoPandas & RasterIO", "Cloud-Optimized GeoTIFF", "Historical 5-Yr Z-Score Store"],
      color: "border-teal-brand/40 bg-teal-brand/5 text-teal-brand",
    },
    {
      title: "3. Machine Learning & Explainability Engine",
      icon: Brain,
      desc: "Forecasts multi-horizon outbreak risks and computes SHAP driver attributions.",
      techs: ["Multi-Horizon XGBoost Ensemble", "Random Forest Spatial Predictor", "SHAP (SHapley Additive exPlanations)", "Bti Resource Optimization Solver"],
      color: "border-amber-500/40 bg-amber-500/5 text-amber-600",
    },
    {
      title: "4. Command Center & Action Interface Layer",
      icon: Monitor,
      desc: "Delivers real-time interactive vector intelligence to public health officers.",
      techs: ["Next.js 15 App Router & TypeScript", "MapLibre GL Vector Renderer", "Tailwind CSS & Editorial Typography", "Recharts Data Visualizations"],
      color: "border-emerald-500/40 bg-emerald-500/5 text-emerald-600",
    },
  ];

  return (
    <section id="technology" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-4">
          <Cpu className="w-3.5 h-3.5" />
          <span>System Architecture & Stack</span>
        </div>
        <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 ${darkMode ? "text-slate-100" : "text-ink"}`}>
          Robust, production-grade <br />
          <span className="italic text-teal-brand font-serif">geospatial intelligence stack.</span>
        </h2>
        <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
          Built on proven open-source geospatial tools, enterprise machine learning models, and Next.js 15.
        </p>
      </div>

      {/* Layer-by-Layer Architectural Stack Flow */}
      <div className="max-w-4xl mx-auto space-y-4 font-mono">
        {layers.map((layer, idx) => {
          const Icon = layer.icon;
          return (
            <motion.div
              key={layer.title}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="relative"
            >
              <div
                className={`p-6 rounded-xl border transition-colors ${
                  darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-serif text-lg font-bold">{layer.title}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded text-[11px] font-bold border ${layer.color}`}>
                    ACTIVE LAYER
                  </span>
                </div>

                <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
                  {layer.desc}
                </p>

                {/* Tech Chips */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {layer.techs.map((tech) => (
                    <span
                      key={tech}
                      className={`px-3 py-1 rounded border ${
                        darkMode ? "bg-black/30 border-teal-brand/20 text-slate-300" : "bg-paper border-ink/20 text-ink"
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              {/* Connecting Down Arrow */}
              {idx < layers.length - 1 && (
                <div className="flex justify-center my-2 text-teal-brand opacity-60">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
