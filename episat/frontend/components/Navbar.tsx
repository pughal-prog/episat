"use client";

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
    selectedLocation, setSelectedLocation, 
    floodMode, setFloodMode,
    toggleAssistant, toggleSimulator, toggleCitizenModal 
  } = useEpiSatStore();

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

          {/* Location Selector */}
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="bg-paper border border-ink/30 text-ink font-mono text-xs px-3 py-1.5 rounded focus:outline-none focus:border-teal-brand"
          >
            <option value="Chennai">Chennai (Tamil Nadu)</option>
            <option value="Delhi">Delhi (NCR)</option>
            <option value="Kochi">Kochi (Kerala)</option>
            <option value="Pune">Pune (Maharashtra)</option>
            <option value="Kolkata">Kolkata (West Bengal)</option>
            <option value="Mumbai">Mumbai (Maharashtra)</option>
            <option value="Bengaluru">Bengaluru (Karnataka)</option>
            <option value="Hyderabad">Hyderabad (Telangana)</option>
            <option value="Bhubaneswar">Bhubaneswar (Odisha)</option>
          </select>

          {/* Pluggable Multi-Disease Selector */}
          <DiseaseSelector />

          <DataFreshnessBadge sourceName="MODIS_LST" timestamp={new Date().toISOString()} ageHours={3.5} />
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
