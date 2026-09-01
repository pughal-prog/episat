"use client";

import React, { useState } from "react";
import { Info, Satellite, CloudRain, Thermometer, Layers, AlertCircle } from "lucide-react";

export const DataFreshnessLegend: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const sources = [
    {
      name: "MODIS NRT (LST)",
      signal: "Land Surface Temperature",
      latency: "~3 hours",
      frequency: "Daily",
      useForCurrent: "Yes (NRT Source)",
      icon: Thermometer,
      status: "Fresh"
    },
    {
      name: "GPM IMERG Early",
      signal: "Near-Real-Time Precipitation",
      latency: "~4 hours",
      frequency: "3-Hourly",
      useForCurrent: "Yes (NRT Source)",
      icon: CloudRain,
      status: "Fresh"
    },
    {
      name: "CHIRPS Preliminary",
      signal: "Rainfall Accumulation (Fallback)",
      latency: "~2 days",
      frequency: "Daily",
      useForCurrent: "Yes (Fallback)",
      icon: CloudRain,
      status: "Fresh"
    },
    {
      name: "Sentinel-2 SR",
      signal: "NDWI & NDVI Indices",
      latency: "~5 days",
      frequency: "5-Day Revisit",
      useForCurrent: "Yes (With Timestamp)",
      icon: Satellite,
      status: "Pass Delayed (Cloud Cover)"
    },
    {
      name: "Sentinel-1 SAR",
      signal: "Monsoon Flood Extent",
      latency: "~6 days",
      frequency: "6-Day Radar",
      useForCurrent: "Yes (Cloud Penetrating)",
      icon: Layers,
      status: "Fresh"
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-800/90 text-slate-300 hover:text-white border border-slate-700 rounded-md transition-colors"
      >
        <Info className="w-3.5 h-3.5 text-sky-400" />
        <span>Data Freshness & Satellite Latency</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 bottom-10 z-50 w-80 p-4 bg-slate-900/95 backdrop-blur border border-slate-700/80 rounded-xl shadow-2xl text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Satellite className="w-4 h-4 text-sky-400" />
              Satellite Data Freshness Guide
            </h4>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-200">
              ✕
            </button>
          </div>

          <p className="text-slate-400 text-[11px] leading-relaxed">
            EpiSat displays the most recent pre-computed satellite pass available, stamped with its real observation time.
          </p>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {sources.map((src, i) => {
              const IconComp = src.icon;
              return (
                <div key={i} className="p-2 rounded bg-slate-800/60 border border-slate-700/50 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-slate-200 flex items-center gap-1.5">
                      <IconComp className="w-3.5 h-3.5 text-sky-400" />
                      {src.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono">
                      {src.latency}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex justify-between">
                    <span>{src.signal}</span>
                    <span className={src.status.includes("Delayed") ? "text-amber-400" : "text-emerald-400"}>
                      {src.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-2 rounded bg-amber-500/10 border border-amber-500/20 text-[10px] text-amber-300 flex items-start gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>Final CHIRPS (~3-week lag) is excluded from current displays to ensure freshness.</span>
          </div>
        </div>
      )}
    </div>
  );
};
