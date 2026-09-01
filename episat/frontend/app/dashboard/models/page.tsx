"use client";

import Navbar from "@/components/Navbar";
import { useEpiSatStore } from "@/lib/store";
import { Activity, Database, CheckCircle, RefreshCw } from "lucide-react";

export default function ModelsPage() {
  const { selectedLocation } = useEpiSatStore();

  const models = [
    { name: "RF-v2 (Random Forest Baseline)", horizon: "21 Days", r2: 0.74, mae: "1.15 cases/wk", status: "ACTIVE PRODUCTION", updated: "2026-08-30" },
    { name: "XGB-v1 (XGBoost Regressor)", horizon: "21 Days", r2: 0.76, mae: "1.08 cases/wk", status: "STANDBY / CANDIDATE", updated: "2026-08-28" },
    { name: "LSTM-v1 (Temporal Neural Net)", horizon: "21 Days", r2: 0.71, mae: "1.28 cases/wk", status: "EVALUATION", updated: "2026-08-25" },
    { name: "MobileNetV3-CV", horizon: "Instant", accuracy: "91%", mae: "N/A", status: "ACTIVE PRODUCTION", updated: "2026-08-29" },
  ];

  const dataSources = [
    { name: "Sentinel-2 (Copernicus)", metric: "NDWI Standing Water Index", freshness: "2 days ago", coverage: "96%", quality: "GOOD" },
    { name: "NASA MODIS (MOD11A2)", metric: "Land Surface Temp (LST)", freshness: "3 days ago", coverage: "98%", quality: "GOOD" },
    { name: "CHIRPS / GPM", metric: "Precipitation & Rainfall Accumulation", freshness: "1 day ago", coverage: "99%", quality: "GOOD" },
    { name: "NVBDCP / IDSP", metric: "Ground Dengue Surveillance Cases", freshness: "7 days ago", coverage: "92%", quality: "MODERATE" },
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full font-mono text-xs">
        
        <div className="border-b border-ink/20 pb-4 flex items-center justify-between">
          <div>
            <span className="text-ink-muted uppercase">SYSTEM OBSERVABILITY</span>
            <h2 className="font-serif text-3xl font-bold text-ink font-sans">Model Registry & Data Quality Audit</h2>
          </div>
        </div>

        {/* Active Models */}
        <div className="bg-paper-raised border border-ink rounded p-5 space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink">Active Model Registry & Metrics</h3>
          <div className="space-y-3">
            {models.map((m, idx) => (
              <div key={idx} className="p-4 bg-paper border border-ink/20 rounded flex items-center justify-between">
                <div>
                  <div className="font-bold text-ink text-sm font-sans">{m.name}</div>
                  <div className="text-ink-muted mt-0.5">Horizon: {m.horizon} | R²: {m.r2 || "N/A"} | MAE: {m.mae}</div>
                </div>
                <span className={`px-2.5 py-1 rounded text-[10px] font-bold ${
                  m.status.includes("ACTIVE") ? "bg-teal-brand text-paper" : "bg-paper text-ink border border-ink/30"
                }`}>
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Data Quality & Freshness */}
        <div className="bg-paper-raised border border-ink rounded p-5 space-y-4">
          <h3 className="font-serif text-lg font-bold text-ink">Data Freshness & Ingestion Health</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dataSources.map((ds, idx) => (
              <div key={idx} className="p-4 bg-paper border border-ink/20 rounded space-y-1">
                <div className="flex justify-between font-bold text-ink text-sm">
                  <span>{ds.name}</span>
                  <span className="text-teal-brand text-xs">{ds.quality}</span>
                </div>
                <div className="text-ink-muted">{ds.metric}</div>
                <div className="flex justify-between text-[11px] text-ink border-t border-ink/10 pt-2 mt-2">
                  <span>Freshness: {ds.freshness}</span>
                  <span>Coverage: {ds.coverage}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 System Observability & Data Pipeline Health
      </footer>
    </div>
  );
}
