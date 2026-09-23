"use client";

import { useEpiSatStore } from "@/lib/store";
import { AlertCircle, Activity, Droplets, Thermometer, ShieldAlert, CheckCircle } from "lucide-react";

export default function HotspotPanel() {
  const { selectedCell, horizonDays } = useEpiSatStore();

  const cell = selectedCell || {
    location_name: "Chennai",
    ward_name: "Ward 42 (South)",
    episat_risk_score: 87.0,
    risk_level: "Critical",
    bsi_score: 82.0,
    anomaly_score: 74.0,
    forecast_cases: 42,
    lower_bound: 35,
    upper_bound: 51,
    confidence: 0.81
  };

  const rawDrivers = cell.primary_drivers;
  let parsedDrivers: Record<string, number> = {
    "Rainfall anomaly": 35,
    "Water persistence": 27,
    "LST Temperature": 18,
    "Historical cases": 20
  };

  if (rawDrivers) {
    if (typeof rawDrivers === "string") {
      try {
        parsedDrivers = JSON.parse(rawDrivers);
      } catch (e) {
        // fallback
      }
    } else if (typeof rawDrivers === "object") {
      parsedDrivers = rawDrivers;
    }
  }

  const riskScore = typeof cell.episat_risk_score === "number" ? cell.episat_risk_score : parseFloat(cell.episat_risk_score || "75");
  const bsiScore = typeof cell.bsi_score === "number" ? cell.bsi_score : parseFloat(cell.bsi_score || "70");
  const forecastCases = typeof cell.forecast_cases === "number" ? cell.forecast_cases : parseInt(cell.forecast_cases || "35");
  const confidenceVal = typeof cell.confidence === "number" ? cell.confidence : 0.84;

  const getRiskBadge = (level: string) => {
    const l = (level || "").toLowerCase();
    if (l.includes("critical")) return "bg-risk-critical text-white";
    if (l.includes("high")) return "bg-risk-high text-white";
    if (l.includes("mod")) return "bg-risk-medium text-white";
    return "bg-risk-low text-white";
  };

  return (
    <div className="bg-paper-raised border border-ink rounded p-5 flex flex-col justify-between h-full shadow-sm">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between border-b border-ink/20 pb-3 mb-4">
          <div>
            <span className="font-mono text-xs text-ink-muted uppercase tracking-wider">{cell.location_name}</span>
            <h3 className="font-serif text-xl font-bold text-ink">{cell.ward_name || cell.cell_id || "Selected Area"}</h3>
          </div>
          <span className={`px-2.5 py-1 rounded font-mono text-xs font-semibold uppercase ${getRiskBadge(cell.risk_level)}`}>
            {cell.risk_level || "HIGH"} Risk
          </span>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
          <div className="bg-paper p-3 rounded border border-ink/20">
            <div className="text-[10px] text-ink-muted uppercase">EpiSat Risk Score</div>
            <div className="font-serif text-2xl font-bold text-ink mt-0.5">{riskScore.toFixed(1)} <span className="text-xs text-ink-muted font-sans">/ 100</span></div>
          </div>
          <div className="bg-paper p-3 rounded border border-ink/20">
            <div className="text-[10px] text-ink-muted uppercase">Breeding Suitability (BSI)</div>
            <div className="font-serif text-2xl font-bold text-ink mt-0.5">{bsiScore.toFixed(1)} <span className="text-xs text-ink-muted font-sans">/ 100</span></div>
          </div>
          <div className="bg-paper p-3 rounded border border-ink/20">
            <div className="text-[10px] text-ink-muted uppercase">Forecast ({horizonDays} Days)</div>
            <div className="font-serif text-xl font-bold text-ink mt-0.5">{forecastCases} <span className="text-xs text-ink-muted font-sans">cases</span></div>
            <div className="text-[10px] text-ink-muted">Interval: {cell.lower_bound || Math.max(1, forecastCases - 8)}–{cell.upper_bound || (forecastCases + 12)}</div>
          </div>
          <div className="bg-paper p-3 rounded border border-ink/20">
            <div className="text-[10px] text-ink-muted uppercase">Model Confidence</div>
            <div className="font-serif text-xl font-bold text-ink mt-0.5">{(confidenceVal * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-ink-muted">Version: RF-v2</div>
          </div>
        </div>

        {/* Primary Drivers SHAP Breakdown */}
        <div className="mb-5">
          <h4 className="font-mono text-xs font-semibold text-ink uppercase tracking-wider mb-2 flex items-center">
            <Activity className="w-3.5 h-3.5 mr-1.5 text-teal-brand" /> Top Contributing Factors
          </h4>
          <div className="space-y-2 font-mono text-xs">
            {Object.entries(parsedDrivers).map(([driver, pct]: [string, any]) => (
              <div key={driver} className="space-y-1">
                <div className="flex justify-between text-ink">
                  <span>{driver}</span>
                  <span className="font-semibold">+{pct}%</span>
                </div>
                <div className="w-full h-1.5 bg-paper border border-ink/20 rounded overflow-hidden">
                  <div className="h-full bg-teal-brand" style={{ width: `${Math.min(100, Number(pct) * 2)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended Action */}
        <div className="p-3 bg-paper border-l-4 border-teal-brand rounded text-xs font-sans">
          <div className="font-mono font-semibold text-ink uppercase text-[10px] mb-1 flex items-center">
            <ShieldAlert className="w-3.5 h-3.5 mr-1 text-teal-brand" /> Priority Action
          </div>
          <p className="text-ink-muted leading-relaxed">
            Inspect stagnant-water hotspots immediately. Deploy focal larviciding and anti-larval treatment within 48 hours.
          </p>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-ink/20 text-[10px] font-mono text-ink-muted">
        Scientific Positioning: Predictions represent environmental suitability for vector breeding, not confirmed clinical diagnoses.
      </div>
    </div>
  );
}
