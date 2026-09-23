"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Activity, Layers, Info, MapPin, AlertTriangle, Eye, ShieldAlert, Sparkles, RefreshCw } from "lucide-react";

interface GridCell {
  id: string;
  ward: string;
  gridCode: string;
  riskScore: number;
  riskTier: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  bsi: number;
  ndwi: string;
  lst: string;
  rainAnomaly: string;
  primaryDriver: string;
  recAction: string;
}

const SAMPLE_CELLS: GridCell[] = [
  { id: "C-01", ward: "Ward 42 (South Central)", gridCode: "500m-GRID-4201", riskScore: 88, riskTier: "CRITICAL", bsi: 86, ndwi: "+0.42 (Standing Water)", lst: "29.8°C", rainAnomaly: "+42% (7-day)", primaryDriver: "NDWI Standing Water Accumulation", recAction: "Immediate Fogging & Larviciding Deployment" },
  { id: "C-02", ward: "Ward 42 (East Flank)", gridCode: "500m-GRID-4202", riskScore: 82, riskTier: "CRITICAL", bsi: 80, ndwi: "+0.38 (High Moisture)", lst: "30.1°C", rainAnomaly: "+38% (7-day)", primaryDriver: "Post-Rain Puddling & Canal Spill", recAction: "Source Reduction & Drain Clearing" },
  { id: "C-03", ward: "Ward 18 (Central)", gridCode: "500m-GRID-1801", riskScore: 76, riskTier: "HIGH", bsi: 74, ndwi: "+0.29 (Moderate Water)", lst: "30.5°C", rainAnomaly: "+25% (7-day)", primaryDriver: "Surface Temp & Humidity Spike", recAction: "Targeted Anti-Larval Spraying" },
  { id: "C-04", ward: "Ward 18 (North)", gridCode: "500m-GRID-1802", riskScore: 71, riskTier: "HIGH", bsi: 69, ndwi: "+0.24 (Moderate Water)", lst: "31.2°C", rainAnomaly: "+21% (7-day)", primaryDriver: "Dense Construction Runoff", recAction: "Community Door-to-Door Inspection" },
  { id: "C-05", ward: "Ward 24 (East Port)", gridCode: "500m-GRID-2401", riskScore: 56, riskTier: "MODERATE", bsi: 54, ndwi: "+0.14 (Low Moisture)", lst: "31.8°C", rainAnomaly: "+12% (7-day)", primaryDriver: "Seasonal Baseline Temperature", recAction: "Routine Surveillance Monitoring" },
  { id: "C-06", ward: "Ward 24 (South)", gridCode: "500m-GRID-2402", riskScore: 49, riskTier: "MODERATE", bsi: 48, ndwi: "+0.09 (Dry Surface)", lst: "32.0°C", rainAnomaly: "+8% (7-day)", primaryDriver: "Low Canopy Moisture", recAction: "Weekly Trap Inspection" },
  { id: "C-07", ward: "Ward 35 (West Ridge)", gridCode: "500m-GRID-3501", riskScore: 32, riskTier: "LOW", bsi: 30, ndwi: "-0.05 (Dry Canopy)", lst: "32.6°C", rainAnomaly: "-5% (7-day)", primaryDriver: "Well-Drained Elevated Topography", recAction: "Standard Surveillance" },
  { id: "C-08", ward: "Ward 35 (North Outer)", gridCode: "500m-GRID-3502", riskScore: 24, riskTier: "LOW", bsi: 22, ndwi: "-0.11 (Dry Soil)", lst: "33.1°C", rainAnomaly: "-10% (7-day)", primaryDriver: "Minimal Vector Breeding Habitat", recAction: "No Action Required" },
  { id: "C-09", ward: "Ward 51 (North Zone)", gridCode: "500m-GRID-5101", riskScore: 84, riskTier: "CRITICAL", bsi: 82, ndwi: "+0.45 (Heavy Flooding)", lst: "29.4°C", rainAnomaly: "+48% (7-day)", primaryDriver: "Urban Canal Backflow & Debris", recAction: "Emergency Dewatering & Vector Control" },
  { id: "C-10", ward: "Ward 51 (East Zone)", gridCode: "500m-GRID-5102", riskScore: 68, riskTier: "HIGH", bsi: 65, ndwi: "+0.22 (Water Accumulation)", lst: "30.8°C", rainAnomaly: "+19% (7-day)", primaryDriver: "High Population Density & Storage", recAction: "Container Removal Drive" },
  { id: "C-11", ward: "Ward 12 (North West)", gridCode: "500m-GRID-1201", riskScore: 41, riskTier: "MODERATE", bsi: 39, ndwi: "+0.04 (Normal Moisture)", lst: "31.5°C", rainAnomaly: "+4% (7-day)", primaryDriver: "Moderate Vegetation Cover", recAction: "Passive Monitoring" },
  { id: "C-12", ward: "Ward 12 (Central)", gridCode: "500m-GRID-1202", riskScore: 28, riskTier: "LOW", bsi: 26, ndwi: "-0.08 (Dry)", lst: "32.4°C", rainAnomaly: "-2% (7-day)", primaryDriver: "Low Breeding Suitability", recAction: "Standard Monitoring" },
];

interface RiskMapPreviewProps {
  darkMode: boolean;
}

export function RiskMapPreview({ darkMode }: RiskMapPreviewProps) {
  const shouldReduceMotion = useReducedMotion();
  const [selectedCell, setSelectedCell] = useState<GridCell>(SAMPLE_CELLS[0]);
  const [activeLayer, setActiveLayer] = useState<"risk" | "ndwi" | "lst">("risk");
  const [pulseIndex, setPulseIndex] = useState(0);

  // Subtle pulsing animation interval for illustrative preview
  useEffect(() => {
    if (shouldReduceMotion) return;
    const interval = setInterval(() => {
      setPulseIndex((prev) => (prev + 1) % 4);
    }, 2500);
    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "CRITICAL":
        return {
          bg: "bg-risk-critical",
          border: "border-red-600",
          text: "text-risk-critical",
          badgeBg: darkMode ? "bg-red-950/80 text-red-200 border-red-800" : "bg-red-100 text-red-900 border-red-300",
        };
      case "HIGH":
        return {
          bg: "bg-risk-high",
          border: "border-orange-600",
          text: "text-risk-high",
          badgeBg: darkMode ? "bg-amber-950/80 text-amber-200 border-amber-800" : "bg-amber-100 text-amber-900 border-amber-300",
        };
      case "MODERATE":
        return {
          bg: "bg-risk-medium",
          border: "border-amber-600",
          text: "text-risk-medium",
          badgeBg: darkMode ? "bg-yellow-950/80 text-yellow-200 border-yellow-800" : "bg-yellow-100 text-yellow-900 border-yellow-300",
        };
      default:
        return {
          bg: "bg-risk-low",
          border: "border-emerald-600",
          text: "text-risk-low",
          badgeBg: darkMode ? "bg-emerald-950/80 text-emerald-200 border-emerald-800" : "bg-emerald-100 text-emerald-900 border-emerald-300",
        };
    }
  };

  const getLayerColor = (cell: GridCell) => {
    if (activeLayer === "ndwi") {
      return cell.riskScore > 70 ? "bg-blue-600" : cell.riskScore > 50 ? "bg-cyan-600" : "bg-sky-800";
    }
    if (activeLayer === "lst") {
      return cell.riskScore > 70 ? "bg-amber-700" : cell.riskScore > 50 ? "bg-amber-500" : "bg-yellow-600";
    }
    return getTierColor(cell.riskTier).bg;
  };

  return (
    <section id="live-preview" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div
        className={`rounded-xl border shadow-2xl overflow-hidden transition-colors ${
          darkMode
            ? "bg-[#0b1b18] border-teal-brand/40 text-slate-100"
            : "bg-paper-raised border-ink/25 text-ink"
        }`}
      >
        {/* Top Control Bar */}
        <div
          className={`px-5 py-3.5 border-b flex flex-wrap items-center justify-between gap-3 font-mono text-xs ${
            darkMode ? "border-teal-brand/30 bg-[#071311]" : "border-ink/20 bg-paper"
          }`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-brand animate-ping" />
              <span className="w-2.5 h-2.5 rounded-full bg-teal-brand" />
              <span className="font-bold tracking-tight">LIVE INFERENCE PREVIEW</span>
            </div>
            <span className="text-ink-muted hidden sm:inline">|</span>
            <span className="text-ink-muted hidden sm:inline">Grid: 500m × 500m H3 Spatial Hex / Cell Index</span>
          </div>

          <div className="flex items-center space-x-3">
            {/* Section 58 Data Freshness Rule Disclosure Badge */}
            <span
              className={`px-2.5 py-1 rounded text-[11px] font-medium border flex items-center space-x-1 ${
                darkMode ? "bg-teal-brand/20 border-teal-brand/40 text-teal-300" : "bg-teal-brand/10 border-teal-brand/30 text-teal-brand"
              }`}
            >
              <Info className="w-3 h-3" />
              <span>Illustrative Preview • Multi-Horizon Model v2.4</span>
            </span>
          </div>
        </div>

        {/* Main Grid & Inspection Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Spatial Grid Interactive Canvas (8 Cols) */}
          <div className="lg:col-span-7 p-6 relative flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-ink/15">
            {/* Header & Spectral Layer Switcher */}
            <div className="flex flex-wrap items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold">Chennai Urban Sector — Spatial Risk Matrix</h3>
                <p className="font-mono text-xs text-ink-muted">Click any 500m cell to inspect environmental drivers</p>
              </div>

              {/* Layer Selector */}
              <div className="flex items-center space-x-1 font-mono text-[11px] bg-paper/50 p-1 rounded border border-ink/20">
                <button
                  onClick={() => setActiveLayer("risk")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeLayer === "risk"
                      ? "bg-teal-brand text-paper font-medium"
                      : "hover:bg-paper-raised text-ink"
                  }`}
                >
                  Spatial Risk
                </button>
                <button
                  onClick={() => setActiveLayer("ndwi")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeLayer === "ndwi"
                      ? "bg-teal-brand text-paper font-medium"
                      : "hover:bg-paper-raised text-ink"
                  }`}
                >
                  NDWI Water
                </button>
                <button
                  onClick={() => setActiveLayer("lst")}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    activeLayer === "lst"
                      ? "bg-teal-brand text-paper font-medium"
                      : "hover:bg-paper-raised text-ink"
                  }`}
                >
                  MODIS LST Temp
                </button>
              </div>
            </div>

            {/* Spatial Hex Grid Container */}
            <div className="relative my-2 p-4 rounded-lg bg-black/10 border border-ink/10 flex items-center justify-center min-h-[320px]">
              {/* Radar Scan Line animation */}
              {!shouldReduceMotion && (
                <motion.div
                  animate={{ y: [0, 280, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-teal-brand to-transparent pointer-events-none z-10 opacity-70"
                />
              )}

              {/* 3x4 Hex Grid layout representing 500m cells */}
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-xl z-20">
                {SAMPLE_CELLS.map((cell, idx) => {
                  const isSelected = selectedCell.id === cell.id;
                  const isPulsing = !shouldReduceMotion && idx % 4 === pulseIndex;
                  const tierColor = getTierColor(cell.riskTier);

                  return (
                    <button
                      key={cell.id}
                      onClick={() => setSelectedCell(cell)}
                      className={`relative p-3.5 rounded-lg border-2 text-left transition-all group overflow-hidden ${
                        isSelected
                          ? "ring-2 ring-teal-brand border-white shadow-lg scale-[1.03]"
                          : "border-ink/20 hover:border-ink/50"
                      } ${darkMode ? "bg-[#0d231f]" : "bg-paper-raised"}`}
                    >
                      {/* Cell Header */}
                      <div className="flex items-center justify-between mb-1.5 font-mono text-[10px]">
                        <span className="font-bold opacity-80">{cell.id}</span>
                        <span className={`w-2 h-2 rounded-full ${tierColor.bg} ${isPulsing ? "animate-ping" : ""}`} />
                      </div>

                      {/* Cell Score */}
                      <div className="flex items-baseline space-x-1">
                        <span className={`font-serif text-2xl font-bold ${tierColor.text}`}>
                          {cell.riskScore}
                        </span>
                        <span className="font-mono text-[10px] text-ink-muted">/100</span>
                      </div>

                      {/* Ward Subtext */}
                      <div className="font-mono text-[10px] text-ink-muted truncate mt-1">
                        {cell.ward.split("(")[0]}
                      </div>

                      {/* Layer color indicator bar */}
                      <div className={`mt-2 h-1 rounded-full w-full ${getLayerColor(cell)}`} />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Risk Legend & Map Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs mt-3 pt-3 border-t border-ink/15">
              <div className="flex items-center space-x-3">
                <span className="text-ink-muted font-medium">Risk Levels:</span>
                <div className="flex items-center space-x-2">
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-low" /><span>Low</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-medium" /><span>Mod</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-high" /><span>High</span></span>
                  <span className="flex items-center space-x-1"><span className="w-2.5 h-2.5 rounded-full bg-risk-critical" /><span>Critical</span></span>
                </div>
              </div>

              <div className="text-[11px] text-ink-muted">
                Coordinates: 13.0827° N, 80.2707° E
              </div>
            </div>
          </div>

          {/* Cell Inspector Sidebar Panel (5 Cols) */}
          <div className={`lg:col-span-5 p-6 flex flex-col justify-between ${darkMode ? "bg-[#081815]" : "bg-paper"}`}>
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-ink/20 pb-3 mb-4 font-mono text-xs">
                <span className="text-teal-brand font-bold uppercase tracking-wider flex items-center space-x-1.5">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Cell Intelligence Inspector</span>
                </span>
                <span className="text-ink-muted">{selectedCell.gridCode}</span>
              </div>

              {/* Selected Cell Identity */}
              <div className="mb-5">
                <div className="font-mono text-xs text-ink-muted">{selectedCell.ward}</div>
                <div className="flex items-center justify-between mt-1">
                  <span className="font-serif text-3xl font-bold">{selectedCell.riskScore} <span className="font-mono text-xs text-ink-muted font-normal">/ 100 Risk Score</span></span>
                  <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold border ${getTierColor(selectedCell.riskTier).badgeBg}`}>
                    {selectedCell.riskTier} RISK
                  </span>
                </div>
              </div>

              {/* Key Environmental Drivers */}
              <div className="space-y-3 font-mono text-xs">
                <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider border-b border-ink/10 pb-1">
                  Environmental Drivers & Anomalies
                </div>

                <div className="flex justify-between items-center p-2.5 rounded border border-ink/15 bg-paper/40">
                  <span className="text-ink-muted">Mosquito BSI Score:</span>
                  <span className="font-bold">{selectedCell.bsi} / 100</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded border border-ink/15 bg-paper/40">
                  <span className="text-ink-muted">Sentinel-2 NDWI:</span>
                  <span className="font-bold text-teal-brand">{selectedCell.ndwi}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded border border-ink/15 bg-paper/40">
                  <span className="text-ink-muted">MODIS Surface LST:</span>
                  <span className="font-bold">{selectedCell.lst}</span>
                </div>

                <div className="flex justify-between items-center p-2.5 rounded border border-ink/15 bg-paper/40">
                  <span className="text-ink-muted">CHIRPS Rain Anomaly:</span>
                  <span className="font-bold text-amber-600">{selectedCell.rainAnomaly}</span>
                </div>
              </div>

              {/* Primary Outbreak Risk Driver */}
              <div className="mt-5 p-3.5 rounded border border-teal-brand/30 bg-teal-brand/10 font-sans text-xs">
                <div className="font-mono text-[11px] font-bold text-teal-brand uppercase mb-1">
                  Dominant SHAP Risk Driver
                </div>
                <div className="font-serif font-bold text-sm mb-1">{selectedCell.primaryDriver}</div>
                <p className="text-ink-muted text-[11px] leading-relaxed">
                  High satellite water index combined with elevated surface temperature creates optimal vector larval breeding velocity (1-4 week forecast horizon).
                </p>
              </div>

              {/* Automated Health Action Recommendation */}
              <div className="mt-4 p-3.5 rounded border border-risk-high/30 bg-risk-high/10 font-sans text-xs">
                <div className="font-mono text-[11px] font-bold text-risk-high uppercase mb-1 flex items-center space-x-1">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Automated Vector Control Advisory</span>
                </div>
                <div className="font-serif font-bold text-sm">{selectedCell.recAction}</div>
              </div>
            </div>

            {/* Ingestion & Model Info Footer */}
            <div className="mt-6 pt-4 border-t border-ink/15 font-mono text-[11px] text-ink-muted flex items-center justify-between">
              <span>Sentinel-2 L2A Ingested: 6h ago</span>
              <span className="text-teal-brand font-medium">95% Conf. Interval</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
