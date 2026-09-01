"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { useEpiSatStore } from "@/lib/store";
import { ShieldAlert, CheckCircle, Clock, AlertTriangle } from "lucide-react";

export default function InterventionsPage() {
  const { selectedLocation } = useEpiSatStore();

  const [actions, setActions] = useState([
    {
      id: 1,
      ward_name: "Ward 42 (South)",
      priority: "HIGH",
      action: "Inspect stagnant-water hotspots and conduct targeted larval surveillance.",
      reason: "Elevated breeding suitability index (82.0/100) and forecast surge (42 expected cases).",
      target_area: "Ward 42 — High Density Sectors",
      status: "Recommended",
      suggested_timeline: "Within 48 hours"
    },
    {
      id: 2,
      ward_name: "Ward 18 (Central)",
      priority: "HIGH",
      action: "Deploy vector-control field personnel for focal larviciding / anti-larval treatment.",
      reason: "High risk threshold exceeded in spatial grid cells.",
      target_area: "Ward 18 Drainage Outfalls & Construction Sites",
      status: "In Progress",
      suggested_timeline: "1–3 days"
    },
    {
      id: 3,
      ward_name: "Ward 24 (East)",
      priority: "MEDIUM",
      action: "Broadcast hyperlocal community advisories regarding standing water removal.",
      reason: "Preemptive community engagement reduces container breeding sites.",
      target_area: "Ward 24 Residential & School Zones",
      status: "Recommended",
      suggested_timeline: "This week"
    },
    {
      id: 4,
      ward_name: "Ward 35 (West)",
      priority: "LOW",
      action: "Maintain routine vector surveillance and monitor weekly satellite indicators.",
      reason: "Risk level is currently manageable within baseline bounds.",
      target_area: "Ward 35 General Zone",
      status: "Completed",
      suggested_timeline: "Routine (Weekly)"
    }
  ]);

  const updateStatus = (id: number, newStatus: string) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status: newStatus } : a));
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case "HIGH": return "bg-risk-critical text-white";
      case "MEDIUM": return "bg-risk-medium text-white";
      default: return "bg-risk-low text-white";
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-6 max-w-6xl mx-auto w-full">
        
        <div className="border-b border-ink/20 pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-ink-muted uppercase">{selectedLocation} PUBLIC HEALTH ACTION ENGINE</span>
            <h2 className="font-serif text-3xl font-bold text-ink">Intervention Recommendations & Task Board</h2>
          </div>
          <div className="font-mono text-xs bg-paper-raised p-2 rounded border border-ink/20 text-ink-muted">
            Decision Support for Health Authorities
          </div>
        </div>

        {/* Task Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
          {actions.map((item) => (
            <div key={item.id} className="p-5 bg-paper-raised border border-ink rounded flex flex-col justify-between space-y-4 shadow-sm">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-ink text-sm font-serif">{item.ward_name}</span>
                  <span className={`px-2 py-0.5 rounded font-semibold text-[10px] uppercase ${getPriorityBadge(item.priority)}`}>
                    {item.priority} PRIORITY
                  </span>
                </div>

                <h4 className="font-sans font-bold text-sm text-ink mb-1">{item.action}</h4>
                <p className="text-ink-muted text-xs font-sans mb-3">{item.reason}</p>

                <div className="space-y-1 text-[11px] text-ink border-t border-ink/10 pt-2">
                  <div><span className="text-ink-muted">Target Area:</span> {item.target_area}</div>
                  <div><span className="text-ink-muted">Timeline:</span> {item.suggested_timeline}</div>
                </div>
              </div>

              {/* Status Controller */}
              <div className="flex items-center justify-between border-t border-ink/20 pt-3">
                <span className="text-ink-muted">Status: <strong className="text-ink">{item.status}</strong></span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => updateStatus(item.id, "In Progress")}
                    className="px-2.5 py-1 bg-paper border border-ink/30 text-ink rounded hover:bg-teal-brand hover:text-paper"
                  >
                    In Progress
                  </button>
                  <button
                    onClick={() => updateStatus(item.id, "Completed")}
                    className="px-2.5 py-1 bg-teal-brand text-paper rounded hover:bg-teal-deep"
                  >
                    Completed
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 Intervention Recommendation Engine | Public Health Decision Support
      </footer>
    </div>
  );
}
