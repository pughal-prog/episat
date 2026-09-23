"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Satellite, BarChart3, Map, HelpCircle, Sliders, Camera, ArrowUpRight, CheckCircle2, AlertTriangle, Sparkles } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

interface CapabilitiesSectionProps {
  darkMode: boolean;
}

const FORECAST_MOCK_DATA = [
  { week: "Wk 32", actual: 120, forecast: 118, lower: 100, upper: 135 },
  { week: "Wk 33", actual: 145, forecast: 142, lower: 125, upper: 160 },
  { week: "Wk 34", actual: 180, forecast: 185, lower: 160, upper: 210 },
  { week: "Wk 35", actual: 210, forecast: 215, lower: 185, upper: 245 },
  { week: "Wk 36 (Now)", actual: 260, forecast: 258, lower: 220, upper: 290 },
  { week: "Wk 37 (+1W)", actual: null, forecast: 340, lower: 290, upper: 390 },
  { week: "Wk 38 (+2W)", actual: null, forecast: 420, lower: 350, upper: 490 },
  { week: "Wk 39 (+3W)", actual: null, forecast: 490, lower: 400, upper: 580 },
  { week: "Wk 40 (+4W)", actual: null, forecast: 530, lower: 430, upper: 640 },
];

export function CapabilitiesSection({ darkMode }: CapabilitiesSectionProps) {
  const shouldReduceMotion = useReducedMotion();
  const [activeTab, setActiveTab] = useState<"ndwi" | "lst" | "chirps">("ndwi");
  const [shapHover, setShapHover] = useState<string | null>(null);
  const [citizenSim, setCitizenSim] = useState(false);

  return (
    <section id="capabilities" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full font-mono text-xs text-teal-brand bg-teal-brand/10 border border-teal-brand/30 mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Core System Capabilities</span>
        </div>
        <h2 className={`font-serif text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 ${darkMode ? "text-slate-100" : "text-ink"}`}>
          Six pillars of public health <br />
          <span className="italic text-teal-brand font-serif">vector intelligence.</span>
        </h2>
        <p className={`font-sans text-base sm:text-lg leading-relaxed ${darkMode ? "text-slate-300" : "text-ink-muted"}`}>
          Purpose-built modules designed for epidemiologists, health directors, and field vector control officers.
        </p>
      </div>

      {/* 6 Capabilities Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* 1. Satellite Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <Satellite className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 01</span>
                <h3 className="font-serif text-xl font-bold">Satellite Intelligence</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              Ingests Sentinel-2 NDWI (standing water), NASA MODIS LST (surface temperature), and CHIRPS precipitation to compute weekly environmental risk anomalies.
            </p>
          </div>

          {/* Mini Interactive Layer Widget */}
          <div className="p-4 rounded-lg bg-black/10 border border-ink/10 font-mono text-xs">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[11px] text-ink-muted">Spectral Layer:</span>
              <div className="flex space-x-1 text-[10px]">
                <button onClick={() => setActiveTab("ndwi")} className={`px-2 py-0.5 rounded ${activeTab === "ndwi" ? "bg-teal-brand text-paper" : "bg-paper/40 text-ink"}`}>NDWI Water</button>
                <button onClick={() => setActiveTab("lst")} className={`px-2 py-0.5 rounded ${activeTab === "lst" ? "bg-teal-brand text-paper" : "bg-paper/40 text-ink"}`}>LST Temp</button>
                <button onClick={() => setActiveTab("chirps")} className={`px-2 py-0.5 rounded ${activeTab === "chirps" ? "bg-teal-brand text-paper" : "bg-paper/40 text-ink"}`}>CHIRPS Rain</button>
              </div>
            </div>

            <div className="p-2.5 rounded bg-paper/50 border border-ink/15 text-[11px]">
              {activeTab === "ndwi" && <div><span className="font-bold text-teal-brand">Sentinel-2 NDWI:</span> +0.42 (Puddle/Water Pooling Detected)</div>}
              {activeTab === "lst" && <div><span className="font-bold text-amber-600">MODIS LST:</span> 29.8°C (Optimal Larval Breeding Velocity)</div>}
              {activeTab === "chirps" && <div><span className="font-bold text-blue-600">CHIRPS Rain:</span> +42% (7-Day Cumulative Anomaly)</div>}
            </div>
          </div>
        </motion.div>

        {/* 2. AI Outbreak Forecasting */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 02</span>
                <h3 className="font-serif text-xl font-bold">AI Outbreak Forecasting</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              Multi-horizon Random Forest & XGBoost ensemble models forecast dengue risk 1–4 weeks ahead, providing 95% confidence intervals for proactive planning.
            </p>
          </div>

          {/* Mini Recharts Sparkline */}
          <div className="h-32 w-full pt-2 bg-black/10 rounded-lg p-2 border border-ink/10">
            <div className="text-[10px] font-mono text-ink-muted mb-1 flex justify-between">
              <span>Forecast Trajectory</span>
              <span className="text-teal-brand font-bold">1–4 Wks Ahead</span>
            </div>
            <ResponsiveContainer width="100%" height="80%">
              <AreaChart data={FORECAST_MOCK_DATA} margin={{ top: 2, right: 2, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1c4b46" stopOpacity={0.6} />
                    <stop offset="95%" stopColor="#1c4b46" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="week" tick={{ fontSize: 9 }} stroke="#888" />
                <YAxis tick={{ fontSize: 9 }} stroke="#888" />
                <Tooltip contentStyle={{ fontSize: "11px", backgroundColor: "#faf9f5", borderColor: "#c9c3b3" }} />
                <Area type="monotone" dataKey="upper" stroke="none" fill="#1c4b46" fillOpacity={0.15} />
                <Area type="monotone" dataKey="forecast" stroke="#1c4b46" strokeWidth={2} fill="url(#forecastGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Hyperlocal Spatial Risk */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <Map className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 03</span>
                <h3 className="font-serif text-xl font-bold">Hyperlocal Spatial Risk</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              Eliminates coarse district-wide averages by dividing urban sectors into 500m × 500m grid cells, pinpointing specific streets and canals at risk.
            </p>
          </div>

          {/* Micro Grid Visualizer */}
          <div className="p-3.5 rounded-lg bg-black/10 border border-ink/10 font-mono text-xs">
            <div className="text-[11px] font-bold text-ink-muted mb-2 flex justify-between">
              <span>500m Grid Clustering</span>
              <span className="text-risk-critical font-bold">Ward 42 Hotspot</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              <div className="h-7 bg-risk-low rounded text-[9px] text-white flex items-center justify-center font-bold">22</div>
              <div className="h-7 bg-risk-medium rounded text-[9px] text-white flex items-center justify-center font-bold">54</div>
              <div className="h-7 bg-risk-high rounded text-[9px] text-white flex items-center justify-center font-bold">76</div>
              <div className="h-7 bg-risk-critical rounded text-[9px] text-white flex items-center justify-center font-bold">88</div>
            </div>
          </div>
        </motion.div>

        {/* 4. Explainable AI (SHAP) */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 04</span>
                <h3 className="font-serif text-xl font-bold">Explainable AI (SHAP)</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              No black-box predictions. SHAP value attribution breaks down exact risk contributors (Rainfall +38%, Standing Water +29%, LST +24%) for health officers.
            </p>
          </div>

          {/* Interactive SHAP Bar Widget */}
          <div className="p-3.5 rounded-lg bg-black/10 border border-ink/10 font-mono text-xs space-y-2">
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Rainfall Anomaly (+38%)</span>
                <span className="text-teal-brand font-bold">+0.38</span>
              </div>
              <div className="h-2 w-full bg-paper/50 rounded overflow-hidden">
                <div className="h-full bg-teal-brand w-[76%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-[11px] mb-0.5">
                <span>Standing Water NDWI (+29%)</span>
                <span className="text-teal-brand font-bold">+0.29</span>
              </div>
              <div className="h-2 w-full bg-paper/50 rounded overflow-hidden">
                <div className="h-full bg-teal-light w-[58%]" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5. Intervention Engine */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <Sliders className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 05</span>
                <h3 className="font-serif text-xl font-bold">Intervention Engine</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              Automated resource allocation solver ranks optimal vector control actions (targeted larviciding, thermal fogging, source reduction) by cost efficiency.
            </p>
          </div>

          {/* Action Advisory Card Preview */}
          <div className="p-3.5 rounded-lg bg-teal-brand/10 border border-teal-brand/30 font-sans text-xs">
            <div className="font-mono text-[10px] text-teal-brand font-bold uppercase mb-1">Top Action Recommendation</div>
            <div className="font-serif font-bold text-sm">Targeted Bti Larviciding (Ward 42)</div>
            <div className="font-mono text-[11px] text-ink-muted mt-1">Est. Cost ROI: 8.4× vector reduction per ₹ spent</div>
          </div>
        </motion.div>

        {/* 6. Citizen Intelligence */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className={`p-6 rounded-xl border flex flex-col justify-between ${
            darkMode ? "bg-[#0b1c19] border-teal-brand/30" : "bg-paper-raised border-ink/20"
          }`}
        >
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2.5 rounded bg-teal-brand/10 text-teal-brand">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <span className="font-mono text-[10px] text-teal-brand uppercase font-bold">CAPABILITY 06</span>
                <h3 className="font-serif text-xl font-bold">Citizen Intelligence</h3>
              </div>
            </div>
            <p className="font-sans text-xs text-ink-muted leading-relaxed mb-4">
              Crowd-sourced geo-tagged photo submissions analyzed via CV models to verify stagnant water breeding sites and ground-truth satellite indicators.
            </p>
          </div>

          {/* Mini Citizen Upload Interactive Simulation */}
          <div className="p-3.5 rounded-lg bg-black/10 border border-ink/10 font-mono text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-ink-muted">Computer Vision Verification:</span>
              <button
                onClick={() => setCitizenSim(!citizenSim)}
                className="px-2 py-0.5 rounded bg-teal-brand text-paper text-[10px]"
              >
                {citizenSim ? "Reset Simulation" : "Simulate CV Upload"}
              </button>
            </div>

            {citizenSim ? (
              <div className="p-2 rounded bg-emerald-950/20 border border-emerald-500/40 text-emerald-600 text-[11px] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="font-bold">Stagnant Water Confirmed (94% Conf)</div>
                  <div className="text-[10px] opacity-80">Geo-fused with Sentinel Grid #4201</div>
                </div>
              </div>
            ) : (
              <div className="p-2 rounded bg-paper/40 border border-ink/15 text-[11px] text-ink-muted">
                Tap button above to simulate citizen photo submission & CV classification.
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
