"use client";

import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import MapView from "@/components/MapView";
import HotspotPanel from "@/components/HotspotPanel";
import { SpreadMetricCard } from "@/components/SpreadMetricCard";
import WhatIfSimulatorModal from "@/components/WhatIfSimulatorModal";
import CitizenReportModal from "@/components/CitizenReportModal";
import { useEpiSatStore } from "@/lib/store";
import { Layers, Calendar, AlertTriangle, Radio, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const { 
    selectedLocation, horizonDays, setHorizonDays, 
    activeLayer, setActiveLayer, 
    floodMode 
  } = useEpiSatStore();

  const [gridData, setGridData] = useState<any[]>([]);
  const [wardsData, setWardsData] = useState<any[]>([]);
  const [hotspotsData, setHotspotsData] = useState<any[]>([]);
  const [citizenReports, setCitizenReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>("");

  const fetchData = async (showLoading = false, customLat?: number, customLon?: number) => {
    if (showLoading) setLoading(true);
    try {
      let riskUrl = `/api/v1/risk?location_name=${encodeURIComponent(selectedLocation)}&horizon_days=${horizonDays}&flood_mode=${floodMode}`;
      let wardsUrl = `/api/v1/wards?location_name=${encodeURIComponent(selectedLocation)}`;
      let hotspotUrl = `/api/v1/hotspots?location_name=${encodeURIComponent(selectedLocation)}&horizon_days=${horizonDays}`;
      let citizenUrl = `/api/v1/citizen-reports?location_name=${encodeURIComponent(selectedLocation)}`;

      if (customLat !== undefined && customLon !== undefined) {
        riskUrl += `&lat=${customLat}&lon=${customLon}`;
        wardsUrl += `&lat=${customLat}&lon=${customLon}`;
      }

      const [riskRes, hotspotRes, wardsRes, citizenRes] = await Promise.all([
        fetch(riskUrl),
        fetch(hotspotUrl),
        fetch(wardsUrl),
        fetch(citizenUrl)
      ]);

      let riskJson = null;
      let hotspotJson = null;
      let wardsJson = null;
      let citizenJson = null;

      if (riskRes.ok && riskRes.headers.get("content-type")?.includes("application/json")) {
        riskJson = await riskRes.json().catch(() => null);
      }
      if (hotspotRes.ok && hotspotRes.headers.get("content-type")?.includes("application/json")) {
        hotspotJson = await hotspotRes.json().catch(() => null);
      }
      if (wardsRes.ok && wardsRes.headers.get("content-type")?.includes("application/json")) {
        wardsJson = await wardsRes.json().catch(() => null);
      }
      if (citizenRes.ok && citizenRes.headers.get("content-type")?.includes("application/json")) {
        citizenJson = await citizenRes.json().catch(() => null);
      }

      if (riskJson?.success) setGridData(riskJson.data);
      if (hotspotJson?.success) setHotspotsData(hotspotJson.data);
      if (wardsJson?.success) setWardsData(wardsJson.data);
      if (citizenJson?.success) setCitizenReports(citizenJson.data || []);
      
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error("Error fetching live dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch + 15-second real-time auto-polling for NRT satellite telemetry update
  useEffect(() => {
    fetchData(true);
    const interval = setInterval(() => {
      fetchData(false);
    }, 15000);
    return () => clearInterval(interval);
  }, [selectedLocation, horizonDays, floodMode]);

  const handleRecenterGrid = (lat: number, lon: number) => {
    fetchData(false, lat, lon);
  };

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
                <div>Potential vector-risk increase: HIGH | Sentinel-1 SAR Cloud-Penetrating Inundation Active</div>
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
              <Layers className="w-3.5 h-3.5 mr-1" /> Signal Layer:
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

          {/* Forecast Horizon Switcher & Real-Time Sync Indicator */}
          <div className="flex items-center space-x-4">
            
            <div className="flex items-center space-x-1.5 text-[11px] text-ink/70">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>Real-Time Sync: <strong className="text-ink font-semibold">{lastRefreshed || "Connecting..."}</strong></span>
              <button onClick={() => fetchData(false)} title="Force Refresh" className="ml-1 text-ink/50 hover:text-teal-brand">
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center space-x-1.5 border-l border-ink/20 pl-4">
              <span className="text-ink-muted uppercase font-bold flex items-center mr-1">
                <Calendar className="w-3.5 h-3.5 mr-1" /> Horizon:
              </span>
              {[7, 14, 21, 28].map((days) => (
                <button
                  key={days}
                  onClick={() => setHorizonDays(days)}
                  className={`px-2.5 py-1 rounded font-mono ${
                    horizonDays === days
                      ? "bg-ink text-paper font-bold"
                      : "bg-paper text-ink hover:bg-paper-raised border border-ink/20"
                  }`}
                >
                  +{days}d
                </button>
              ))}
            </div>

          </div>

        </div>

        {/* Main Command Center Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[520px]">
          
          {/* Map View Container (2 cols) */}
          <div className="lg:col-span-2 relative min-h-[500px]">
            {loading ? (
              <div className="w-full h-full min-h-[480px] bg-paper-raised border border-ink rounded flex items-center justify-center font-mono text-xs text-ink-muted space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-teal-brand" />
                <span>Processing Live Real-Time 500m Geospatial Grid for {selectedLocation}…</span>
              </div>
            ) : (
              <MapView 
                gridData={gridData} 
                wardsData={wardsData} 
                hotspotsData={hotspotsData} 
                citizenReportsData={citizenReports} 
                onRecenterGrid={handleRecenterGrid}
              />
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

      <footer className="border-t border-ink/20 p-4 text-center font-mono text-xs text-ink-muted bg-paper-raised flex items-center justify-between">
        <div>EpiSat 2.0 Command Center | Data Mode: REAL-TIME EO TELEMETRY FEED (MODIS, GPM, Sentinel-1 SAR)</div>
        <div className="flex items-center space-x-2 text-emerald-600 font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>NRT SATELLITE TELEMETRY ACTIVE</span>
        </div>
      </footer>
    </div>
  );
}
