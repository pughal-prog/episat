"use client";

import React, { useState } from "react";
import { Sliders, Play, RotateCcw, AlertTriangle, ArrowRight, ShieldCheck } from "lucide-react";

export default function SimulationPage() {
  const [rainfallChange, setRainfallChange] = useState<number>(20);
  const [tempChange, setTempChange] = useState<number>(1.0);
  const [waterPersistenceChange, setWaterPersistenceChange] = useState<number>(15);
  const [bsiReduction, setBsiReduction] = useState<number>(30);

  const [simResult, setSimResult] = useState<any>({
    baseline_risk_score: 68.0,
    simulated_risk_score: 52.4,
    delta_risk: -15.6,
    baseline_cases: 42.0,
    simulated_cases: 31.5,
    risk_level: "MODERATE",
    recommended_policy: "Maintain larvicide spraying in high NDWI persistence grid cells."
  });
  const [loading, setLoading] = useState(false);

  const runSimulation = () => {
    setLoading(true);
    fetch("http://127.0.0.1:5000/api/v1/simulation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        location_name: "Chennai",
        rainfall_change_pct: rainfallChange,
        temperature_change_c: tempChange,
        water_persistence_change_pct: waterPersistenceChange,
        bsi_reduction_pct: bsiReduction
      })
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setSimResult(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">What-If Vector Risk Simulator</h1>
        <p className="text-sm text-slate-400">
          Simulate environmental changes and vector control interventions across 500m grid cells before executing public health actions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Parameter Controls */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-5">
          <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
            <Sliders className="h-5 w-5 text-cyan-400" />
            Simulation Parameters
          </h3>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Rainfall Change (%)</span>
              <span className="text-cyan-400 font-medium">{rainfallChange > 0 ? `+${rainfallChange}%` : `${rainfallChange}%`}</span>
            </div>
            <input
              type="range" min="-50" max="100" step="5"
              value={rainfallChange} onChange={(e) => setRainfallChange(Number(e.target.value))}
              className="w-full accent-cyan-500 bg-slate-800 rounded-lg h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Temperature Change (°C)</span>
              <span className="text-amber-400 font-medium">{tempChange > 0 ? `+${tempChange}°C` : `${tempChange}°C`}</span>
            </div>
            <input
              type="range" min="-5.0" max="5.0" step="0.5"
              value={tempChange} onChange={(e) => setTempChange(Number(e.target.value))}
              className="w-full accent-amber-500 bg-slate-800 rounded-lg h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Water Persistence Change (%)</span>
              <span className="text-blue-400 font-medium">{waterPersistenceChange > 0 ? `+${waterPersistenceChange}%` : `${waterPersistenceChange}%`}</span>
            </div>
            <input
              type="range" min="-50" max="100" step="5"
              value={waterPersistenceChange} onChange={(e) => setWaterPersistenceChange(Number(e.target.value))}
              className="w-full accent-blue-500 bg-slate-800 rounded-lg h-2"
            />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-slate-300">Breeding Control Effectiveness (BSI Reduction %)</span>
              <span className="text-emerald-400 font-medium">{bsiReduction}%</span>
            </div>
            <input
              type="range" min="0" max="90" step="5"
              value={bsiReduction} onChange={(e) => setBsiReduction(Number(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 rounded-lg h-2"
            />
          </div>

          <button
            onClick={runSimulation} disabled={loading}
            className="w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-medium rounded-lg shadow-lg flex items-center justify-center gap-2 transition"
          >
            <Play className="h-4 w-4" />
            {loading ? "Running Simulation..." : "Execute Simulation"}
          </button>
        </div>

        {/* Results Comparison View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <span className="text-xs uppercase text-slate-400 font-semibold">Baseline EpiSat Risk</span>
              <div className="text-3xl font-bold text-slate-100 mt-2">
                {simResult.baseline_risk_score} <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Expected 21-Day Cases: {simResult.baseline_cases}</p>
            </div>

            <div className="bg-slate-900/60 border border-cyan-900/50 rounded-xl p-5">
              <span className="text-xs uppercase text-cyan-400 font-semibold">Simulated Scenario Risk</span>
              <div className="text-3xl font-bold text-cyan-400 mt-2">
                {simResult.simulated_risk_score} <span className="text-xs text-slate-400">/ 100</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Risk Delta: <span className={simResult.delta_risk < 0 ? "text-emerald-400" : "text-rose-400"}>{simResult.delta_risk > 0 ? `+${simResult.delta_risk}` : simResult.delta_risk}</span>
              </p>
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-4">
            <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Policy Guidance & Decision Support
            </h4>
            <p className="text-sm text-slate-300 bg-slate-950/60 p-4 rounded-lg border border-slate-800">
              {simResult.recommended_policy}
            </p>
            <p className="text-xs text-slate-500">
              * Note: Simulation estimates are public-health decision support projections, not guaranteed real-world outcomes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
