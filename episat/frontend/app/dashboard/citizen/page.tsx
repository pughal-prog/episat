"use client";

import Navbar from "@/components/Navbar";
import CitizenReportModal from "@/components/CitizenReportModal";
import { useEpiSatStore } from "@/lib/store";
import { Camera, CheckCircle2, AlertTriangle } from "lucide-react";

export default function CitizenPage() {
  const { selectedLocation, toggleCitizenModal } = useEpiSatStore();

  const reports = [
    {
      id: 101,
      ward_name: "Ward 42 (South)",
      description: "Large pool of standing rainwater stagnant for >10 days near residential colony outfall.",
      cv_prob: 0.91,
      cv_level: "HIGH",
      status: "Verified",
      submitted: "2026-08-30T10:15:00Z",
      fusion_priority: "CRITICAL"
    },
    {
      id: 102,
      ward_name: "Ward 18 (Central)",
      description: "Blocked storm drain accumulating water near construction site containers.",
      cv_prob: 0.84,
      cv_level: "HIGH",
      status: "Pending Field Inspection",
      submitted: "2026-08-31T08:20:00Z",
      fusion_priority: "HIGH"
    }
  ];

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-6 max-w-5xl mx-auto w-full">
        
        <div className="border-b border-ink/20 pb-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-xs text-ink-muted uppercase">{selectedLocation} GROUND INTELLIGENCE</span>
            <h2 className="font-serif text-3xl font-bold text-ink">Citizen Stagnant Water Reports & CV Classification</h2>
          </div>
          <button
            onClick={toggleCitizenModal}
            className="px-4 py-2 bg-teal-brand text-paper font-mono text-xs font-semibold rounded hover:bg-teal-deep transition-colors flex items-center space-x-1.5"
          >
            <Camera className="w-4 h-4" />
            <span>Submit New Photo Report</span>
          </button>
        </div>

        <div className="space-y-4 font-mono text-xs">
          {reports.map((r) => (
            <div key={r.id} className="p-5 bg-paper-raised border border-ink rounded space-y-3 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="font-bold text-ink text-sm font-serif">{r.ward_name} — Report #{r.id}</span>
                <span className="px-2 py-0.5 bg-risk-critical text-white rounded text-[10px] font-bold">
                  FUSED PRIORITY: {r.fusion_priority}
                </span>
              </div>

              <p className="font-sans text-xs text-ink">{r.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-paper p-3 rounded border border-ink/20 text-[11px]">
                <div>
                  <span className="text-ink-muted block">CV Water Prob:</span>
                  <strong className="text-teal-brand">{(r.cv_prob * 100).toFixed(0)}%</strong>
                </div>
                <div>
                  <span className="text-ink-muted block">Breeding Site:</span>
                  <strong className="text-risk-high">{r.cv_level}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block">Status:</span>
                  <strong className="text-ink">{r.status}</strong>
                </div>
                <div>
                  <span className="text-ink-muted block">Submitted:</span>
                  <span>{r.submitted.split("T")[0]}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <CitizenReportModal />

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 Citizen Ground Intelligence | MobileNet Image Classifier & Satellite Fusion
      </footer>
    </div>
  );
}
