"use client";

import React, { useEffect, useState } from "react";
import { useEpiSatStore } from "@/lib/store";
import { Bug, ShieldCheck, AlertCircle, Lock, MapPin } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface StateItem {
  state_id: string;
  state_name: string;
  lgd_code: number;
}

interface DistrictItem {
  district_id: string;
  district_name: string;
  state_id: string;
  lgd_code: number;
  has_demo_data: boolean;
}

export const DiseaseSelector: React.FC = () => {
  const {
    selectedState,
    setSelectedState,
    selectedLocation,
    setSelectedLocation,
    selectedDisease,
    setSelectedDisease
  } = useEpiSatStore();

  const [states, setStates] = useState<StateItem[]>([]);
  const [districts, setDistricts] = useState<DistrictItem[]>([]);

  // Fetch all 36 States/UTs on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/locations/states`)
      .then((res) => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
        return res.json().catch(() => null);
      })
      .then((resData) => {
        if (resData && resData.success && Array.isArray(resData.data)) {
          setStates(resData.data);
        } else {
          throw new Error("Invalid response");
        }
      })
      .catch(() => {
        // Fallback static list
        setStates([
          { state_id: "TN", state_name: "Tamil Nadu", lgd_code: 33 },
          { state_id: "MH", state_name: "Maharashtra", lgd_code: 27 },
          { state_id: "DL", state_name: "Delhi", lgd_code: 7 },
          { state_id: "KA", state_name: "Karnataka", lgd_code: 29 },
          { state_id: "TS", state_name: "Telangana", lgd_code: 36 },
          { state_id: "WB", state_name: "West Bengal", lgd_code: 19 },
          { state_id: "RJ", state_name: "Rajasthan", lgd_code: 8 }
        ]);
      });
  }, []);

  // Fetch Districts when selectedState changes
  useEffect(() => {
    if (!selectedState) return;
    fetch(`${API_BASE_URL}/locations/districts?state_id=${selectedState}`)
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          setDistricts(resData.data);
          // If selected location not in new district list, select first district
          const exists = resData.data.some(
            (d: DistrictItem) => d.district_name.toLowerCase() === selectedLocation.toLowerCase() || d.district_id.toLowerCase() === selectedLocation.toLowerCase()
          );
          if (!exists && resData.data.length > 0) {
            setSelectedLocation(resData.data[0].district_name);
          }
        }
      })
      .catch(() => {
        setDistricts([
          { district_id: "TN-CHE", district_name: "Chennai", state_id: "TN", lgd_code: 562, has_demo_data: true },
          { district_id: "TN-COI", district_name: "Coimbatore", state_id: "TN", lgd_code: 558, has_demo_data: true }
        ]);
      });
  }, [selectedState]);

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
    <div className="flex flex-wrap items-center gap-2">
      {/* 1. State Selector */}
      <div className="relative flex items-center">
        <MapPin className="w-3.5 h-3.5 text-amber-400 absolute left-2.5 pointer-events-none" />
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="bg-paper border border-ink/30 text-ink font-mono text-xs pl-8 pr-3 py-1.5 rounded focus:outline-none focus:border-teal-brand cursor-pointer"
        >
          {states.map((s) => (
            <option key={s.state_id} value={s.state_id}>
              {s.state_name} ({s.state_id})
            </option>
          ))}
        </select>
      </div>

      {/* 2. District Selector */}
      <div className="relative flex items-center">
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
          className="bg-paper border border-ink/30 text-ink font-mono text-xs px-3 py-1.5 rounded focus:outline-none focus:border-teal-brand cursor-pointer"
        >
          {districts.map((d) => (
            <option key={d.district_id} value={d.district_name}>
              {d.district_name} {d.has_demo_data ? "⚡" : "⚠️ (No Grid Data)"}
            </option>
          ))}
        </select>
      </div>

      {/* 3. Disease Selector */}
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
