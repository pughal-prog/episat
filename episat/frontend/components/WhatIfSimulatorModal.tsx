"use client";

import { useState } from "react";
import { useEpiSatStore } from "@/lib/store";
import { X, Sliders, Play, AlertTriangle } from "lucide-react";

export default function WhatIfSimulatorModal() {
  const { isSimulatorOpen, toggleSimulator, selectedLocation } = useEpiSatStore();

  const [rainfallPct, setRainfallPct] = useState(20);
  const [tempC, setTempC] = useState(1.0);
  const [waterPct, setWaterPct] = useState(15);
  const [controlPct, setControlPct] = useState(30);

  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  if (!isSimulatorOpen) return null;

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          location_name: selectedLocation,
          rainfall_change_pct: rainfallPct,
          temperature_change_c: tempC,
          water_persistence_change_pct: waterPct,
          bsi_reduction_pct: controlPct
        })
      });
      const json = await res.json();
      if (json.success) {
        setSimulationResult(json.data);
      }
    } catch {
      // Fallback local simulation math
      const base = 68.0;
      const sim = Math.min(99, Math.max(10, base * (1 + rainfallPct/100*0.4) * (1 + tempC*0.08) * (1 - controlPct/100*0.6)));
      setSimulationResult({
        location_name: selectedLocation,
        baseline_risk_score: base,
        simulated_risk_score: round(sim, 1),
        risk_score_delta: round(sim - base, 1),
        baseline_cases: 42,
        simulated_cases: round(42 * (sim/base), 1),
        disclaimer: "SIMULATION / SCENARIO ESTIMATE — NOT A GUARANTEED REAL-WORLD OUTCOME."
      });
    } finally {
      setLoading(false);
    }
  };

  function round(val: number, dec: number) {
    return Math.round(val * Math.pow(10, dec)) / Math.pow(10, dec);
  }

  return (
    <div className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-paper-raised border-2 border-ink rounded-lg w-full max-w-xl shadow-2xl p-6 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-ink/20 pb-3 mb-4">
          <div className="flex items-center space-x-2">
            <Sliders className="w-5 h-5 text-teal-brand" />
            <h3 className="font-serif font-bold text-xl text-ink">What-If Intervention Sandbox</h3>
          </div>
          <button onClick={toggleSimulator} className="p-1 text-ink hover:text-risk-critical">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sliders */}
        <div className="space-y-4 font-mono text-xs mb-6">
          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Rainfall Change (%):</span>
              <span className="font-bold text-teal-brand">{rainfallPct > 0 ? `+${rainfallPct}%` : `${rainfallPct}%`}</span>
            </div>
            <input
              type="range" min="-50" max="100" value={rainfallPct}
              onChange={(e) => setRainfallPct(Number(e.target.value))}
              className="w-full accent-teal-brand"
            />
          </div>

          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Temperature Change (°C):</span>
              <span className="font-bold text-teal-brand">{tempC > 0 ? `+${tempC}°C` : `${tempC}°C`}</span>
            </div>
            <input
              type="range" min="-3" max="5" step="0.5" value={tempC}
              onChange={(e) => setTempC(Number(e.target.value))}
              className="w-full accent-teal-brand"
            />
          </div>

          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Standing Water Persistence (%):</span>
              <span className="font-bold text-teal-brand">{waterPct > 0 ? `+${waterPct}%` : `${waterPct}%`}</span>
            </div>
            <input
              type="range" min="-50" max="50" value={waterPct}
              onChange={(e) => setWaterPct(Number(e.target.value))}
              className="w-full accent-teal-brand"
            />
          </div>

          <div>
            <div className="flex justify-between text-ink mb-1">
              <span>Vector-Control Effectiveness (% Breeding Reduction):</span>
              <span className="font-bold text-risk-low">-{controlPct}%</span>
            </div>
            <input
              type="range" min="0" max="80" value={controlPct}
              onChange={(e) => setControlPct(Number(e.target.value))}
              className="w-full accent-risk-low"
            />
          </div>
        </div>

        <button
          onClick={handleRunSimulation}
          disabled={loading}
          className="w-full py-2.5 bg-teal-brand text-paper font-mono text-xs font-semibold rounded hover:bg-teal-deep transition-colors flex items-center justify-center space-x-2"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{loading ? "Calculating Scenario..." : "Run Simulation"}</span>
        </button>

        {/* Results Box */}
        {simulationResult && (
          <div className="mt-5 p-4 bg-paper border border-ink/20 rounded font-mono text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Baseline Risk:</span>
              <span className="font-bold text-ink">{simulationResult.baseline_risk_score} / 100</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Simulated Risk:</span>
              <span className={`font-bold ${simulationResult.simulated_risk_score >= 75 ? "text-risk-critical" : "text-teal-brand"}`}>
                {simulationResult.simulated_risk_score} / 100 ({simulationResult.risk_score_delta >= 0 ? `+${simulationResult.risk_score_delta}` : simulationResult.risk_score_delta})
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-ink-muted">Expected Weekly Cases:</span>
              <span className="font-bold text-ink">{simulationResult.baseline_cases} → {simulationResult.simulated_cases}</span>
            </div>
            <div className="p-2 bg-yellow-500/10 border-l-2 border-medium rounded text-[10px] text-ink-muted flex items-start space-x-1">
              <AlertTriangle className="w-3.5 h-3.5 mr-1 text-medium flex-shrink-0" />
              <span>{simulationResult.disclaimer}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
