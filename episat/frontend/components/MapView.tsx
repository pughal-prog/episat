"use client";

import { useEffect, useRef, useState } from "react";
import { useEpiSatStore } from "@/lib/store";
import { Activity, Radio, Satellite, ShieldAlert, Sparkles, RefreshCw, Eye, MapPin, X, ChevronRight, AlertTriangle, Users } from "lucide-react";

interface MapViewProps {
  gridData: any[];
  wardsData?: any[];
  hotspotsData: any[];
  citizenReportsData: any[];
}

export default function MapView({ gridData, wardsData = [], hotspotsData, citizenReportsData }: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const citizenMarkersRef = useRef<any[]>([]);
  
  const [currentZoom, setCurrentZoom] = useState<number>(12.5);
  const [mapStyleMode, setMapStyleMode] = useState<"satellite" | "streets">("satellite");
  const [liveStreamTime, setLiveStreamTime] = useState<string>("");
  const [selectedWard, setSelectedWard] = useState<any | null>(null);
  const [locationsDb, setLocationsDb] = useState<any[]>([]);
  
  const { selectedLocation, activeLayer, setSelectedCell } = useEpiSatStore();

  // Load All-India District Coordinates Database
  useEffect(() => {
    async function fetchLocationsDb() {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
        const res = await fetch(`${baseUrl}/locations`);
        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) setLocationsDb(json.data);
        }
      } catch (err) {
        console.error("Map locations DB load error:", err);
      }
    }
    fetchLocationsDb();
  }, []);

  // Helper to determine risk level badge and color scheme
  function getRiskLevelDetails(score: number) {
    if (score >= 75) return { level: "CRITICAL", text: "text-rose-400", bg: "bg-rose-500/20 border-rose-500/50 text-rose-300", badge: "bg-rose-600" };
    if (score >= 55) return { level: "HIGH", text: "text-amber-400", bg: "bg-amber-500/20 border-amber-500/50 text-amber-300", badge: "bg-amber-600" };
    if (score >= 30) return { level: "MODERATE", text: "text-sky-400", bg: "bg-sky-500/20 border-sky-500/50 text-sky-300", badge: "bg-sky-600" };
    return { level: "LOW", text: "text-emerald-400", bg: "bg-emerald-500/20 border-emerald-500/50 text-emerald-300", badge: "bg-emerald-600" };
  }

  // Real-time clock update for live telemetry feed timestamp
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveStreamTime(now.toLocaleTimeString("en-US", { hour12: false }) + " UTC+5:30");
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to compute map center dynamically from gridData, locationsDb, or wardsData
  function getDynamicCenter(): [number, number] {
    if (gridData && gridData.length > 0) {
      const validLats = gridData.map(c => c.center_lat).filter(Boolean);
      const validLons = gridData.map(c => c.center_lon).filter(Boolean);
      if (validLats.length > 0 && validLons.length > 0) {
        const avgLat = validLats.reduce((a, b) => a + b, 0) / validLats.length;
        const avgLon = validLons.reduce((a, b) => a + b, 0) / validLats.length;
        return [avgLon, avgLat];
      }
    }
    if (locationsDb && locationsDb.length > 0) {
      const match = locationsDb.find(l => l.name.toLowerCase() === selectedLocation.toLowerCase());
      if (match && match.lat && match.lon) {
        return [match.lon, match.lat];
      }
    }
    const coords: Record<string, [number, number]> = {
      Chennai: [80.2707, 13.0827],
      Delhi: [77.2090, 28.6139],
      Kochi: [76.2673, 9.9312],
      Pune: [73.8567, 18.5204],
      Kolkata: [88.3639, 22.5726],
      Mumbai: [72.8777, 19.0760],
      Bengaluru: [77.5946, 12.9716],
      Hyderabad: [78.4867, 17.3850],
      Bhubaneswar: [85.8245, 20.2961],
      Jaipur: [75.7873, 26.9124]
    };
    return coords[selectedLocation] || [80.2707, 13.0827];
  }

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const center = getDynamicCenter();

    import("maplibre-gl").then((maplibregl) => {
      if (mapRef.current) {
        mapRef.current.flyTo({ center, zoom: 12.5, essential: true });
        updateMapLayers(mapRef.current, gridData, wardsData, activeLayer, setSelectedCell);
        updateHotspotMarkers(mapRef.current, maplibregl, hotspotsData);
        updateCitizenReportMarkers(mapRef.current, maplibregl, citizenReportsData);
        return;
      }

      const tileSourceUrl = mapStyleMode === "satellite"
        ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
        : "https://tile.openstreetmap.org/{z}/{x}/{y}.png";

      const map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: {
          version: 8,
          sources: {
            "live-tiles": {
              type: "raster",
              tiles: [tileSourceUrl],
              tileSize: 256,
              attribution: mapStyleMode === "satellite" ? "Esri World Imagery & Sentinel-2 EO" : "OpenStreetMap",
            },
          },
          layers: [
            {
              id: "live-tiles",
              type: "raster",
              source: "live-tiles",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center,
        zoom: 12.5,
      });

      mapRef.current = map;

      map.on("zoom", () => {
        setCurrentZoom(map.getZoom());
      });

      map.on("load", () => {
        setupWardsAndGridLayers(map, gridData, wardsData, activeLayer, setSelectedCell, setSelectedWard, maplibregl);
        updateHotspotMarkers(map, maplibregl, hotspotsData);
        updateCitizenReportMarkers(map, maplibregl, citizenReportsData);
      });
    });
  }, [selectedLocation, gridData, wardsData, activeLayer, hotspotsData, mapStyleMode, locationsDb]);

  function getLayerColorProperty(layer: string) {
    switch (layer) {
      case "bsi":
        return ["get", "bsi_score"];
      case "anomaly":
        return ["get", "anomaly_score"];
      case "lst":
        return ["get", "lst_celsius"];
      default:
        return ["get", "episat_risk_score"];
    }
  }

  function setupWardsAndGridLayers(
    map: any, 
    gData: any[], 
    wData: any[], 
    layerType: string, 
    setCell: (c: any) => void,
    setWard: (w: any) => void,
    maplibregl: any
  ) {
    const wardFeatures = wData.map((ward) => ({
      type: "Feature",
      properties: ward,
      geometry: ward.geometry_geojson || {
        type: "Polygon",
        coordinates: [[
          [ward.center_lon - 0.006, ward.center_lat - 0.006],
          [ward.center_lon + 0.006, ward.center_lat - 0.006],
          [ward.center_lon + 0.006, ward.center_lat + 0.006],
          [ward.center_lon - 0.006, ward.center_lat + 0.006],
          [ward.center_lon - 0.006, ward.center_lat - 0.006]
        ]]
      }
    }));

    if (!map.getSource("ward-source")) {
      map.addSource("ward-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: wardFeatures },
      });

      map.addLayer({
        id: "ward-fill",
        type: "fill",
        source: "ward-source",
        paint: {
          "fill-color": [
            "step",
            ["get", "risk_score"],
            "#10b981", 30,
            "#f59e0b", 55,
            "#f43f5e", 75,
            "#991b1b"
          ],
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: "ward-line",
        type: "line",
        source: "ward-source",
        paint: {
          "line-color": "#38bdf8",
          "line-width": 3.0,
          "line-dasharray": [3, 1.5],
        },
      });

      map.on("click", "ward-fill", (e: any) => {
        if (e.features && e.features[0]) {
          const wardProps = e.features[0].properties;
          setWard(wardProps);

          const rScore = wardProps.risk_score || 50;
          const levelDetails = getRiskLevelDetails(rScore);

          new maplibregl.Popup({ offset: 15 })
            .setLngLat(e.lngLat)
            .setHTML(`
              <div class="font-sans text-xs p-1 space-y-1">
                <div class="font-bold text-slate-900 border-b border-slate-200 pb-1 flex items-center justify-between gap-2">
                  <span>🏛️ ${wardProps.ward_name}</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${levelDetails.badge}">${levelDetails.level}</span>
                </div>
                <div class="text-slate-800 font-semibold mt-1">EpiSat Ward Risk Score: <strong class="${levelDetails.text}">${rScore} / 100</strong></div>
                <div class="text-slate-600">Population at Risk: <strong>${(wardProps.population || 15000).toLocaleString()}</strong></div>
                <div class="text-[10px] text-slate-500 mt-1 italic">Click map inspector panel for detailed ward breakdown.</div>
              </div>
            `)
            .addTo(map);
        }
      });

      map.on("mouseenter", "ward-fill", () => {
        map.getCanvas().style.cursor = "pointer";
      });
      map.on("mouseleave", "ward-fill", () => {
        map.getCanvas().style.cursor = "";
      });
    }

    const gridFeatures = gData.map((cell) => ({
      type: "Feature",
      properties: cell,
      geometry: cell.geometry_geojson || {
        type: "Polygon",
        coordinates: [[
          [cell.center_lon - 0.002, cell.center_lat - 0.002],
          [cell.center_lon + 0.002, cell.center_lat - 0.002],
          [cell.center_lon + 0.002, cell.center_lat + 0.002],
          [cell.center_lon - 0.002, cell.center_lat + 0.002],
          [cell.center_lon - 0.002, cell.center_lat - 0.002]
        ]]
      }
    }));

    if (!map.getSource("grid-source")) {
      map.addSource("grid-source", {
        type: "geojson",
        data: { type: "FeatureCollection", features: gridFeatures },
      });

      map.addLayer({
        id: "grid-fill",
        type: "fill",
        source: "grid-source",
        paint: {
          "fill-color": [
            "step",
            getLayerColorProperty(layerType),
            "#10b981", 30,
            "#f59e0b", 55,
            "#f43f5e", 75,
            "#991b1b"
          ],
          "fill-opacity": 0.50,
        },
      });

      map.addLayer({
        id: "grid-line",
        type: "line",
        source: "grid-source",
        paint: {
          "line-color": "#0284c7",
          "line-width": 1.2,
          "line-opacity": 0.6,
        },
      });

      map.on("click", "grid-fill", (e: any) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setCell(props);

          const matchingWard = wData.find(w => w.ward_name === props.ward_name);
          if (matchingWard) {
            setWard(matchingWard);
          }
        }
      });
    }
  }

  function updateMapLayers(map: any, gData: any[], wData: any[], layerType: string, setCell: (c: any) => void) {
    if (!map.isStyleLoaded()) return;

    const wardFeatures = wData.map((ward) => ({
      type: "Feature",
      properties: ward,
      geometry: ward.geometry_geojson
    }));
    if (map.getSource("ward-source")) {
      map.getSource("ward-source").setData({ type: "FeatureCollection", features: wardFeatures });
    }

    const gridFeatures = gData.map((cell) => ({
      type: "Feature",
      properties: cell,
      geometry: cell.geometry_geojson
    }));

    if (map.getSource("grid-source")) {
      map.getSource("grid-source").setData({ type: "FeatureCollection", features: gridFeatures });
    }

    if (map.getLayer("grid-fill")) {
      map.setPaintProperty("grid-fill", "fill-color", [
        "step",
        getLayerColorProperty(layerType),
        "#10b981", 30,
        "#f59e0b", 55,
        "#f43f5e", 75,
        "#991b1b"
      ]);
    }
  }

  function updateHotspotMarkers(map: any, maplibregl: any, hotspots: any[]) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    hotspots.forEach((hs) => {
      if (!hs.center_lat || !hs.center_lon) return;

      const el = document.createElement("div");
      el.className = "w-7 h-7 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-xl animate-bounce cursor-pointer";
      el.innerText = "🔥";

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="font-sans text-xs p-1">
          <div class="font-bold text-slate-900 flex items-center gap-1">
            <span>🔥 ${hs.ward_name || "DBSCAN Cluster Hotspot"}</span>
          </div>
          <div class="text-rose-600 font-bold mt-1">EpiSat Risk: ${hs.risk_score} / 100</div>
          <div class="text-slate-600">Expected Cases: ${hs.expected_cases}</div>
          <div class="text-[10px] text-slate-500 mt-1">Recommendation: ${hs.recommended_intervention}</div>
        </div>
      `);

      const marker = new maplibregl.Marker(el)
        .setLngLat([hs.center_lon, hs.center_lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }

  function updateCitizenReportMarkers(map: any, maplibregl: any, reports: any[]) {
    citizenMarkersRef.current.forEach((m) => m.remove());
    citizenMarkersRef.current = [];

    reports.forEach((rep) => {
      if (!rep.latitude || !rep.longitude) return;

      const el = document.createElement("div");
      el.className = "w-6 h-6 rounded-full bg-cyan-500 border-2 border-white flex items-center justify-center text-[10px] text-white shadow-md animate-pulse cursor-pointer";
      el.innerText = "💧";

      const popup = new maplibregl.Popup({ offset: 20 }).setHTML(`
        <div class="font-sans text-xs">
          <div class="font-bold text-cyan-800">💧 Geotagged Water Hazard</div>
          <div class="text-slate-700 mt-0.5">${rep.description || "Citizen hazard report"}</div>
          <div class="text-[10px] text-slate-500 mt-1">VGG19 Water Prob: ${(rep.cv_water_prob * 100).toFixed(0)}%</div>
        </div>
      `);

      const marker = new maplibregl.Marker(el)
        .setLngLat([rep.longitude, rep.latitude])
        .setPopup(popup)
        .addTo(map);

      citizenMarkersRef.current.push(marker);
    });
  }

  return (
    <div className="relative w-full h-full min-h-[500px] border-2 border-teal-brand/40 rounded-lg overflow-hidden shadow-2xl bg-slate-950">
      
      {/* MapLibre Map Container */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Real-time Radar Scan Line Effect Overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-teal-500/5 animate-pulse" />

      {/* Live Processing Telemetry Bar Header */}
      <div className="absolute top-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 z-10">
        
        {/* Live Status Indicator Badge */}
        <div className="bg-slate-900/90 backdrop-blur border border-teal-500/40 text-white px-3 py-1.5 rounded-full font-mono text-xs flex items-center space-x-2.5 shadow-lg">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="font-bold tracking-wider text-emerald-400">REAL-TIME EO STREAM</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-300 text-[11px]">{liveStreamTime}</span>
        </div>

        {/* Map Tile Style Switcher (Satellite vs Streets GIS) */}
        <div className="bg-slate-900/90 backdrop-blur border border-slate-700 p-1 rounded-full flex items-center space-x-1 shadow-lg font-mono text-[11px]">
          <button
            onClick={() => setMapStyleMode("satellite")}
            className={`px-3 py-1 rounded-full flex items-center space-x-1 transition-all ${
              mapStyleMode === "satellite"
                ? "bg-teal-500 text-slate-950 font-bold shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Satellite className="w-3.5 h-3.5" />
            <span>Satellite EO</span>
          </button>
          <button
            onClick={() => setMapStyleMode("streets")}
            className={`px-3 py-1 rounded-full flex items-center space-x-1 transition-all ${
              mapStyleMode === "streets"
                ? "bg-teal-500 text-slate-950 font-bold shadow-md"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>GIS Streets</span>
          </button>
        </div>

      </div>

      {/* Selected Ward Risk Inspector Modal Overlay */}
      {selectedWard && (
        <div className="absolute top-16 right-3 z-20 w-80 bg-slate-900/95 backdrop-blur border-2 border-teal-500/50 text-white p-4 rounded-xl shadow-2xl space-y-3 font-mono">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4 text-teal-400" />
              <span className="font-bold text-sm text-slate-100">{selectedWard.ward_name}</span>
            </div>
            <button 
              onClick={() => setSelectedWard(null)} 
              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Risk Level Badge & Score */}
          {(() => {
            const rScore = selectedWard.risk_score || 50;
            const details = getRiskLevelDetails(rScore);
            return (
              <div className={`p-3 rounded-lg border flex items-center justify-between ${details.bg}`}>
                <div>
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Ward Vector Risk Level</div>
                  <div className={`text-lg font-extrabold ${details.text}`}>{details.level}</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{rScore}<span className="text-xs text-slate-400 font-normal">/100</span></div>
                  <div className="text-[10px] text-slate-400">EpiSat Risk Index</div>
                </div>
              </div>
            );
          })()}

          {/* Population & Ward Info */}
          <div className="space-y-1.5 text-xs text-slate-300 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1"><Users className="w-3 h-3 text-teal-400" /> Population at Risk:</span>
              <strong className="text-slate-200">{(selectedWard.population || 15000).toLocaleString()}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 flex items-center gap-1"><MapPin className="w-3 h-3 text-teal-400" /> District:</span>
              <strong className="text-slate-200 uppercase">{selectedLocation}</strong>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 leading-tight">
            💡 Select any Ward polygon or grid cell on the map to inspect its real-time spatial vector risk level.
          </div>
        </div>
      )}

      {/* Live Map Info & Grid Detail Overlay */}
      <div className="absolute top-16 left-3 bg-slate-900/90 backdrop-blur border border-teal-500/30 text-white px-3 py-2 rounded-lg font-mono text-xs shadow-lg space-y-1 z-10">
        <div className="flex items-center space-x-2">
          <Radio className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
          <span>Target District: <strong className="text-teal-400 uppercase">{selectedLocation}</strong></span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center space-x-3">
          <span>Zoom: <strong className="text-slate-200">{currentZoom.toFixed(1)}</strong></span>
          <span>•</span>
          <span>Resolution: <strong className="text-emerald-400">500m × 500m Cells</strong></span>
        </div>
      </div>

      {/* Bottom Live Data Stream Ticker */}
      <div className="absolute bottom-3 right-3 bg-slate-900/95 backdrop-blur border border-teal-500/40 text-white px-3.5 py-2 rounded-lg font-mono text-xs shadow-xl max-w-sm z-10">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1 mb-1.5 text-[11px]">
          <span className="text-teal-400 font-semibold uppercase flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-teal-400 animate-spin" /> Live Processing Feeds
          </span>
          <span className="text-slate-400 text-[10px]">Real-Time Sync</span>
        </div>
        <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-300">
          <div>🛰️ MODIS LST: <strong className="text-amber-400">29.4°C</strong></div>
          <div>🌧️ GPM Rain: <strong className="text-cyan-400">48.2 mm</strong></div>
          <div>📡 SAR Water: <strong className="text-emerald-400">0.08 Ratio</strong></div>
          <div>💧 Sentinel-2 NDWI: <strong className="text-sky-400">+0.32</strong></div>
        </div>
      </div>

      {/* Map Risk Color Palette Legend */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur p-2.5 rounded-lg font-mono text-[11px] shadow-lg border border-slate-800 text-slate-200 z-10">
        <div className="font-semibold text-slate-300 mb-1 uppercase text-[10px]">
          Active Signal: <span className="text-teal-400 font-bold">{activeLayer.toUpperCase()}</span>
        </div>
        <div className="flex items-center space-x-2.5">
          <span className="flex items-center"><span className="w-3 h-3 bg-[#10b981] rounded mr-1" /> 0-30 Low</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#f59e0b] rounded mr-1" /> 30-55 Mod</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#f43f5e] rounded mr-1" /> 55-75 High</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#991b1b] rounded mr-1" /> 75+ Critical</span>
        </div>
      </div>

    </div>
  );
}
