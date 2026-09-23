"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MapView from "@/components/MapView";
import HotspotPanel from "@/components/HotspotPanel";
import { SpreadMetricCard } from "@/components/SpreadMetricCard";
import WhatIfSimulatorModal from "@/components/WhatIfSimulatorModal";
import CitizenReportModal from "@/components/CitizenReportModal";
import { useEpiSatStore } from "@/lib/store";
import { Layers, Calendar, AlertTriangle, ShieldCheck, Activity, Droplets, MapPin } from "lucide-react";

export default function DashboardPage() {
  const { 
    selectedLocation, horizonDays, setHorizonDays, 
    activeLayer, setActiveLayer, 
    floodMode 
  } = useEpiSatStore();

  const [gridData, setGridData] = useState<any[]>([]);
  const [wardsData, setWardsData] = useState<any[]>([]);
  const [hotspotsData, setHotspotsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [riskRes, hotspotRes, wardsRes] = await Promise.all([
          fetch(`/api/v1/risk?location_name=${selectedLocation}&horizon_days=${horizonDays}&flood_mode=${floodMode}`),
          fetch(`/api/v1/hotspots?location_name=${selectedLocation}&horizon_days=${horizonDays}`),
          fetch(`/api/v1/wards?location_name=${selectedLocation}`)
        ]);

        let riskJson = null;
        let hotspotJson = null;
        let wardsJson = null;

        if (riskRes.ok && riskRes.headers.get("content-type")?.includes("application/json")) {
          riskJson = await riskRes.json().catch(() => null);
        }
        if (hotspotRes.ok && hotspotRes.headers.get("content-type")?.includes("application/json")) {
          hotspotJson = await hotspotRes.json().catch(() => null);
        }
        if (wardsRes.ok && wardsRes.headers.get("content-type")?.includes("application/json")) {
          wardsJson = await wardsRes.json().catch(() => null);
        }

        if (riskJson?.success) setGridData(riskJson.data);
        if (hotspotJson?.success) setHotspotsData(hotspotJson.data);
        if (wardsJson?.success) setWardsData(wardsJson.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [selectedLocation, horizonDays, floodMode]);

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 p-6 space-y-5">
        
        {/* Post-Flood Warning Banner if Active */}
        {floodMode && (
          <div className="p-4 bg-risk-critical text-white rounded border-2 border-ink flex items-center justify-between shadow-lg animate-pulse font-mono text-xs">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="font-bold text-sm">⚠️ EXTREME RAINFALL EVENT — POST-FLOOD VECTOR RISK MODE ACTIVE</div>
                <div>Potential vector-risk increase: HIGH | Priority Areas: Ward 12, Ward 18, Ward 42</div>
              </div>
            </div>
            <span className="px-3 py-1 bg-white text-risk-critical font-bold rounded">ENHANCED SURVEILLANCE</span>
          </div>
        )}

        {/* Top Control & Layer Bar */}
        <div className="bg-paper-raised border border-ink/20 p-4 rounded flex flex-wrap items-center justify-between gap-4 font-mono text-xs">
          
          {/* Layer Toggles */}
          <div className="flex items-center space-x-2">
            <span className="text-ink-muted uppercase font-bold flex items-center mr-1">
              <Layers className="w-3.5 h-3.5 mr-1" /> Layers:
            </span>
            {[
              { id: "risk", label: "Dengue Risk" },
              { id: "bsi", label: "Breeding Suitability (BSI)" },
              { id: "anomaly", label: "Rainfall Anomaly" },
              { id: "lst", label: "LST Temp" },
              { id: "citizen", label: "Citizen Reports" }
            ].map((layer) => (
              <button
                key={layer.id}
                onClick={() => setActiveLayer(layer.id)}
                className={`px-3 py-1.5 rounded transition-colors ${
                  activeLayer === layer.id
                    ? "bg-teal-brand text-paper font-semibold shadow-sm"
                    : "bg-paper text-ink hover:bg-paper-raised border border-ink/20"
                }`}
              >
                {layer.label}
              </button>
            ))}
          </div>

          {/* Forecast Horizon Switcher */}
          <div className="flex items-center space-x-2">
            <span className="text-ink-muted uppercase font-bold flex items-center mr-1">
              <Calendar className="w-3.5 h-3.5 mr-1" /> Forecast Horizon:
            </span>
            {[7, 14, 21, 28].map((days) => (
              <button
                key={days}
                onClick={() => setHorizonDays(days)}
                className={`px-3 py-1.5 rounded font-mono ${
                  horizonDays === days
                    ? "bg-ink text-paper font-bold"
                    : "bg-paper text-ink hover:bg-paper-raised border border-ink/20"
                }`}
              >
                +{days} Days
              </button>
            ))}
          </div>

        </div>

        {/* Main Command Center Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[520px]">
          
          {/* Map View Container (2 cols) */}
          <div className="lg:col-span-2 relative min-h-[500px]">
            {loading ? (
              <div className="w-full h-full min-h-[480px] bg-paper-raised border border-ink rounded flex items-center justify-center font-mono text-xs text-ink-muted">
                Loading 500m Geospatial Grid for {selectedLocation}…
              </div>
            ) : (
              <MapView gridData={gridData} wardsData={wardsData} hotspotsData={hotspotsData} citizenReportsData={[]} />
            )}
          </div>

          {/* Hotspot & Ward Detailed Inspector + Spread Metric Card (1 col) */}
          <div className="lg:col-span-1 space-y-4">
            <SpreadMetricCard />
            <HotspotPanel />
          </div>

        </div>

      </main>

      {/* Global Modals & Drawers */}
      <WhatIfSimulatorModal />
      <CitizenReportModal />

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised">
        EpiSat 2.0 Command Center | Data Mode: DEMO DATA (NASA MODIS, Sentinel-2, CHIRPS GPM synthetic equivalents)
      </footer>
    </div>
  );
}
