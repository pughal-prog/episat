"use client";

import Navbar from "@/components/Navbar";
import { useEpiSatStore } from "@/lib/store";
import { HelpCircle, Activity, CheckCircle2 } from "lucide-react";

export default function ExplainabilityPage() {
  const { selectedLocation } = useEpiSatStore();

  const shapFactors = [
    { factor: "Rainfall Anomaly (Z-Score +1.85)", contribution: 35, impact: "High", type: "positive" },
    { factor: "Standing Water Persistence (NDWI 0.28)", contribution: 27, impact: "High", type: "positive" },
    { factor: "Historical Case Trend (Lag 1 & 4)", contribution: 20, impact: "High", type: "positive" },
    { factor: "Land Surface Temperature (29.4°C)", contribution: 12, impact: "Moderate", type: "positive" },
    { factor: "Humidity Proxy (68%)", contribution: 6, impact: "Moderate", type: "positive" }
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        
        <div className="border-b border-ink/20 pb-4">
          <span className="font-mono text-xs text-ink-muted uppercase">{selectedLocation} EXPLAINABLE AI (XAI)</span>
          <h2 className="font-serif text-3xl font-bold text-ink">SHAP Feature Attribution & Local Drivers</h2>
          <p className="font-sans text-xs text-ink-muted mt-1">
            Understanding why specific hyperlocal cells are designated as high risk without assuming unproven causal relationships.
          </p>
        </div>

        {/* Explainability Cards */}
        <div className="bg-paper-raised border border-ink rounded p-6 shadow-sm space-y-6 font-mono text-xs">
          
          <div className="flex items-center justify-between border-b border-ink/10 pb-3">
            <span className="font-bold text-ink text-sm">Ward 42 (South) — SHAP TreeExplainer Attributions</span>
            <span className="px-2.5 py-1 bg-risk-critical text-white rounded font-bold">Risk Score: 87 / 100</span>
          </div>

          <div className="space-y-4">
            {shapFactors.map((item, idx) => (
              <div key={idx} className="p-4 bg-paper border border-ink/20 rounded space-y-2">
                <div className="flex justify-between items-center text-sm font-bold text-ink">
                  <span>{item.factor}</span>
                  <span className="text-teal-brand">+{item.contribution}% Contribution</span>
                </div>
                <div className="w-full h-2 bg-paper-raised border border-ink/20 rounded overflow-hidden">
                  <div className="h-full bg-teal-brand" style={{ width: `${item.contribution * 2.5}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-ink-muted">
                  <span>Impact: {item.impact}</span>
                  <span>Non-Causal Language: Contributing Factor</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-teal-brand/10 border border-teal-brand rounded text-ink text-xs font-sans">
            <div className="font-mono font-bold uppercase text-[11px] mb-1 flex items-center">
              <CheckCircle2 className="w-4 h-4 mr-1 text-teal-brand" /> Scientific Positioning Guidance
            </div>
            <p className="text-ink-muted leading-relaxed">
              Every prediction is presented as an environmental vector-breeding risk score, not a confirmed medical diagnosis. Factors listed represent statistically significant correlations derived from multi-source satellite and weather observations.
            </p>
          </div>

        </div>

      </main>

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 Explainable AI Module | Powered by SHAP TreeExplainer Local Attributions
      </footer>
    </div>
  );
}
