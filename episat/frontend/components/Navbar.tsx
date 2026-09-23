"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEpiSatStore } from "@/lib/store";
import { ShieldAlert, Map, BarChart3, HelpCircle, Sliders, Camera, AlertTriangle } from "lucide-react";
import { DataFreshnessBadge } from "./DataFreshnessBadge";
import { DataFreshnessLegend } from "./DataFreshnessLegend";
import { DiseaseSelector } from "./DiseaseSelector";

export default function Navbar() {
  const pathname = usePathname();
  const { 
    selectedState, setSelectedState,
    selectedLocation, setSelectedLocation, 
    floodMode, setFloodMode,
    toggleAssistant, toggleSimulator, toggleCitizenModal 
  } = useEpiSatStore();

  const [statesList, setStatesList] = useState<any[]>([]);
  const [districtsList, setDistrictsList] = useState<any[]>([]);
  const [envSummary, setEnvSummary] = useState<string>("Environmental data: updated 2.5h ago");
  const [diseaseSummary, setDiseaseSummary] = useState<string>("Disease surveillance: updated 4 days ago");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(true);

  // Fetch all 36 States/UTs from API
  useEffect(() => {
    async function loadStates() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/locations/states`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            setStatesList(json.data);
          }
        }
      } catch (err) {
        console.error("Failed to load states:", err);
      }
    }
    loadStates();
  }, []);

  // Fetch districts when selectedState changes
  useEffect(() => {
    async function loadDistricts() {
      if (!selectedState) return;
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/locations/districts?state_id=${selectedState}`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data && json.data.length > 0) {
            setDistrictsList(json.data);
            // Check if selectedLocation is in the newly loaded district list
            const exists = json.data.some((d: any) => d.district_name === selectedLocation);
            if (!exists) {
              setSelectedLocation(json.data[0].district_name);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    }
    loadDistricts();
  }, [selectedState]);

  const fetchFreshnessStatus = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      const res = await fetch(`${baseUrl}/data-quality/staleness-check`);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          if (json.data.environmental_summary) setEnvSummary(json.data.environmental_summary);
          if (json.data.disease_summary) setDiseaseSummary(json.data.disease_summary);
          setIsRefreshing(Boolean(json.data.refresh_in_progress || json.data.refresh_triggered));
          setIsDemoMode(Boolean(json.data.is_demo_mode));
        }
      }
    } catch (err) {
      // Fallback silently if backend offline
    }
  };

  useEffect(() => {
    fetchFreshnessStatus();
    const interval = setInterval(() => {
      fetchFreshnessStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navLinks = [
    { href: "/dashboard", label: "Command Center", icon: Map },
    { href: "/dashboard/forecast", label: "Forecast & Models", icon: BarChart3 },
    { href: "/dashboard/hotspots", label: "Hotspots", icon: ShieldAlert },
    { href: "/dashboard/explainability", label: "Explainability", icon: HelpCircle },
    { href: "/dashboard/interventions", label: "Interventions", icon: ShieldAlert },
    { href: "/dashboard/citizen", label: "Citizen Reports", icon: Camera },
    { href: "/dashboard/simulation", label: "Simulator", icon: Sliders },
    { href: "/dashboard/models", label: "Model Registry", icon: BarChart3 },
    { href: "/dashboard/quality", label: "Data Quality", icon: HelpCircle },
  ];

  return (
    <header className="border-b-2 border-ink bg-paper-raised px-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <Link href="/" className="group">
            <h1 className="font-serif text-2xl font-bold tracking-tight text-ink group-hover:text-teal-brand transition-colors">
              EpiSat <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-teal-brand text-paper rounded">2.0</span>
            </h1>
            <p className="font-sans text-xs text-ink-muted hidden md:block">
              From Earth Observation to Early Intervention
            </p>
          </Link>

          {/* Dynamic State Selector (36 States/UTs) */}
          <div className="flex items-center space-x-1.5">
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="bg-paper border border-ink/30 text-ink font-mono text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-teal-brand font-semibold"
              title="Select State / UT"
            >
              {statesList.length > 0 ? (
                statesList.map((s) => (
                  <option key={s.state_id} value={s.state_id}>
                    {s.state_name} ({s.state_id})
                  </option>
                ))
              ) : (
                <>
                  <option value="TN">Tamil Nadu (TN)</option>
                  <option value="MH">Maharashtra (MH)</option>
                  <option value="DL">Delhi (DL)</option>
                  <option value="KA">Karnataka (KA)</option>
                  <option value="TS">Telangana (TS)</option>
                  <option value="RJ">Rajasthan (RJ)</option>
                  <option value="WB">West Bengal (WB)</option>
                  <option value="KL">Kerala (KL)</option>
                  <option value="UP">Uttar Pradesh (UP)</option>
                </>
              )}
            </select>

            {/* Dynamic District Selector */}
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="bg-paper border border-ink/30 text-ink font-mono text-xs px-2.5 py-1.5 rounded focus:outline-none focus:border-teal-brand font-bold text-teal-brand"
              title="Select District"
            >
              {districtsList.length > 0 ? (
                districtsList.map((d) => (
                  <option key={d.district_id || d.district_name} value={d.district_name}>
                    {d.district_name}
                  </option>
                ))
              ) : (
                <option value={selectedLocation}>{selectedLocation}</option>
              )}
            </select>
          </div>

          {/* Pluggable Multi-Disease Selector */}
          <DiseaseSelector />

          <DataFreshnessBadge 
            envSummary={envSummary}
            diseaseSummary={diseaseSummary}
            isRefreshing={isRefreshing}
            isDemoMode={isDemoMode}
          />
          <DataFreshnessLegend />
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 font-mono text-xs">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded transition-colors ${
                  isActive 
                    ? "bg-ink text-paper font-medium" 
                    : "text-ink hover:bg-paper hover:text-teal-brand"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Quick Action Buttons */}
        <div className="flex items-center space-x-2">
          {/* Post-Flood Mode Toggle */}
          <button
            onClick={() => setFloodMode(!floodMode)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded font-mono text-xs font-medium transition-all ${
              floodMode 
                ? "bg-risk-critical text-white shadow-sm animate-pulse" 
                : "bg-paper border border-ink/30 text-ink hover:bg-risk-high hover:text-white"
            }`}
            title="Toggle Post-Flood Vector Risk Mode"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>{floodMode ? "FLOOD MODE ACTIVE" : "Flood Mode"}</span>
          </button>

          {/* Simulator Trigger */}
          <button
            onClick={toggleSimulator}
            className="flex items-center space-x-1 px-3 py-1.5 bg-paper border border-ink/30 text-ink font-mono text-xs rounded hover:bg-teal-brand hover:text-paper transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>What-If Sandbox</span>
          </button>

          {/* Citizen Report Trigger */}
          <button
            onClick={toggleCitizenModal}
            className="flex items-center space-x-1 px-3 py-1.5 bg-teal-brand text-paper font-mono text-xs rounded hover:bg-teal-deep transition-colors"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Report Water</span>
          </button>

          {/* AI Assistant Trigger */}
          <button
            onClick={toggleAssistant}
            className="flex items-center space-x-1 px-3 py-1.5 bg-ink text-paper font-mono text-xs rounded hover:bg-teal-deep transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>AI Assistant</span>
          </button>
        </div>

      </div>
    </header>
  );
}
