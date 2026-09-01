"use client";

import React from "react";
import { useEpiSatStore } from "@/lib/store";
import { Bug, ShieldCheck, AlertCircle, Lock } from "lucide-react";

export const DiseaseSelector: React.FC = () => {
  const { selectedDisease, setSelectedDisease } = useEpiSatStore();

  const diseases = [
    {
      id: "dengue",
      name: "Dengue Fever",
      vector: "Aedes aegypti",
      status: "active",
      badge: "Active Model (RF/XGB)"
    },
    {
      id: "malaria",
      name: "Malaria",
      vector: "Anopheles stephensi",
      status: "active",
      badge: "Active Model (RF-v1)"
    },
    {
      id: "chikungunya",
      name: "Chikungunya Virus",
      vector: "Aedes albopictus",
      status: "config_only",
      badge: "Architecture Ready — Model Coming Soon"
    },
    {
      id: "japanese_encephalitis",
      name: "Japanese Encephalitis",
      vector: "Culex tritaeniorhynchus",
      status: "config_only",
      badge: "Architecture Ready — Model Coming Soon"
    },
    {
      id: "kala_azar",
      name: "Kala-azar (Leishmaniasis)",
      vector: "Phlebotomus sandfly",
      status: "restricted_data",
      badge: "Data Access Restricted (NVBDCP)"
    },
    {
      id: "cholera",
      name: "Cholera (Waterborne)",
      vector: "Vibrio cholerae",
      status: "config_only",
      badge: "Flood Mode Trigger Only"
    }
  ];

  const currentDisease = diseases.find((d) => d.id === selectedDisease) || diseases[0];

  return (
    <div className="flex items-center gap-2">
      <div className="relative flex items-center">
        <Bug className="w-3.5 h-3.5 text-teal-brand absolute left-2.5 pointer-events-none" />
        <select
          value={selectedDisease}
          onChange={(e) => setSelectedDisease(e.target.value)}
          className="bg-paper border border-ink/30 text-ink font-mono text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-teal-brand cursor-pointer"
        >
          {diseases.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} {d.status === "active" ? "✓" : d.status === "restricted_data" ? "🔒" : "⏳"}
            </option>
          ))}
        </select>
      </div>

      {/* Disease Status Badge */}
      {currentDisease.status === "active" ? (
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <ShieldCheck className="w-3 h-3" />
          {currentDisease.badge}
        </span>
      ) : currentDisease.status === "restricted_data" ? (
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
          <Lock className="w-3 h-3" />
          {currentDisease.badge}
        </span>
      ) : (
        <span className="hidden xl:inline-flex items-center gap-1 text-[11px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
          <AlertCircle className="w-3 h-3" />
          {currentDisease.badge}
        </span>
      )}
    </div>
  );
};
