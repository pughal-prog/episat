"use client";

import React, { useState, useEffect } from "react";
import { Flame, ShieldAlert, Layers, MapPin } from "lucide-react";

export default function HotspotsPage() {
  const [horizon, setHorizon] = useState<number>(21);
  const [hotspots, setHotspots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`http://127.0.0.1:5000/api/v1/hotspots?location_name=Chennai&horizon_days=${horizon}`)
      .then((res) => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
        return res.json().catch(() => null);
      })
      .then((json) => {
        if (json && json.success) setHotspots(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [horizon]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Spatial Hotspot Intelligence</h1>
          <p className="text-sm text-slate-400">
            DBSCAN spatial clustering identifying current, emerging, and persistent vector risk hotspots.
          </p>
        </div>

        {/* Horizon Switcher */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          {[7, 14, 21, 28].map((days) => (
            <button
              key={days}
              onClick={() => setHorizon(days)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${
                horizon === days
                  ? "bg-cyan-600 text-white shadow"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              +{days} Days
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hotspots.map((hs, idx) => (
          <div key={idx} className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                {hs.ward_name}
              </span>
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                hs.risk_score > 75 ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              }`}>
                Risk {hs.risk_score}
              </span>
            </div>

            <div className="space-y-2 text-sm text-slate-300">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Expected Cases (+{horizon}D):</span>
                <span className="font-semibold text-slate-100">{hs.expected_cases} cases</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Breeding Suitability (BSI):</span>
                <span className="font-semibold text-cyan-300">{hs.bsi_score} / 100</span>
              </div>
              <div className="flex justify-between text-xs text-slate-400">
                <span>Prediction Confidence:</span>
                <span className="font-semibold text-emerald-400">{int(hs.confidence * 100)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function int(val: number) {
  return Math.round(val);
}
