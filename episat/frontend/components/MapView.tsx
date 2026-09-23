"use client";

import { useEffect, useRef, useState } from "react";
import { useEpiSatStore } from "@/lib/store";

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
  const [currentZoom, setCurrentZoom] = useState<number>(12.5);
  const { selectedLocation, activeLayer, setSelectedCell } = useEpiSatStore();

  // Helper to compute map center dynamically from gridData or wardsData
  function getDynamicCenter(): [number, number] {
    if (gridData && gridData.length > 0) {
      const validLats = gridData.map(c => c.center_lat).filter(Boolean);
      const validLons = gridData.map(c => c.center_lon).filter(Boolean);
      if (validLats.length > 0 && validLons.length > 0) {
        const avgLat = validLats.reduce((a, b) => a + b, 0) / validLats.length;
        const avgLon = validLons.reduce((a, b) => a + b, 0) / validLons.length;
        return [avgLon, avgLat];
      }
    }
    if (wardsData && wardsData.length > 0) {
      const validLats = wardsData.map(w => w.center_lat).filter(Boolean);
      const validLons = wardsData.map(w => w.center_lon).filter(Boolean);
      if (validLats.length > 0 && validLons.length > 0) {
        const avgLat = validLats.reduce((a, b) => a + b, 0) / validLats.length;
        const avgLon = validLons.reduce((a, b) => a + b, 0) / validLons.length;
        return [avgLon, avgLat];
      }
    }
    // Hardcoded fallbacks for major metros
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
        return;
      }

      const map = new maplibregl.Map({
        container: mapContainerRef.current!,
        style: {
          version: 8,
          sources: {
            "osm-tiles": {
              type: "raster",
              tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
              tileSize: 256,
              attribution: "&copy; OpenStreetMap contributors",
            },
          },
          layers: [
            {
              id: "osm-tiles",
              type: "raster",
              source: "osm-tiles",
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
        const z = map.getZoom();
        setCurrentZoom(z);
      });

      map.on("load", () => {
        setupWardsAndGridLayers(map, gridData, wardsData, activeLayer, setSelectedCell);
        updateHotspotMarkers(map, maplibregl, hotspotsData);
      });
    });
  }, [selectedLocation, gridData, wardsData, activeLayer, hotspotsData]);

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

  function setupWardsAndGridLayers(map: any, gData: any[], wData: any[], layerType: string, setCell: (c: any) => void) {
    // 1. Setup Ward GeoJSON Source & Layers
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
            "#5b7a5a", 30,
            "#b8862e", 55,
            "#a8492f", 75,
            "#7c1f2b"
          ],
          "fill-opacity": 0.35,
        },
      });

      map.addLayer({
        id: "ward-line",
        type: "line",
        source: "ward-source",
        paint: {
          "line-color": "#0a1815",
          "line-width": 2.5,
          "line-dasharray": [2, 1],
        },
      });
    }

    // 2. Setup 500m Grid Cell Source & Layers
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
            "#5b7a5a", 30,
            "#b8862e", 55,
            "#a8492f", 75,
            "#7c1f2b"
          ],
          "fill-opacity": 0.60,
        },
      });

      map.addLayer({
        id: "grid-line",
        type: "line",
        source: "grid-source",
        paint: {
          "line-color": "#12241f",
          "line-width": 1.2,
          "line-opacity": 0.6,
        },
      });

      map.on("click", "grid-fill", (e: any) => {
        if (e.features && e.features[0]) {
          const props = e.features[0].properties;
          setCell(props);
        }
      });
    }
  }

  function updateMapLayers(map: any, gData: any[], wData: any[], layerType: string, setCell: (c: any) => void) {
    if (!map.isStyleLoaded()) return;

    // Update Wards Source
    const wardFeatures = wData.map((ward) => ({
      type: "Feature",
      properties: ward,
      geometry: ward.geometry_geojson
    }));
    if (map.getSource("ward-source")) {
      map.getSource("ward-source").setData({ type: "FeatureCollection", features: wardFeatures });
    }

    // Update Grid Source
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
        "#5b7a5a", 30,
        "#b8862e", 55,
        "#a8492f", 75,
        "#7c1f2b"
      ]);
    }
  }

  function updateHotspotMarkers(map: any, maplibregl: any, hotspots: any[]) {
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    hotspots.forEach((hs) => {
      if (!hs.center_lat || !hs.center_lon) return;

      const el = document.createElement("div");
      el.className = "w-6 h-6 rounded-full bg-rose-600 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-pulse cursor-pointer";
      el.innerText = "🔥";

      const popup = new maplibregl.Popup({ offset: 25 }).setHTML(`
        <div class="font-sans text-xs">
          <div class="font-bold text-slate-900">${hs.ward_name || "Hotspot Cluster"}</div>
          <div class="text-rose-600 font-semibold">Risk Score: ${hs.risk_score} / 100</div>
          <div class="text-slate-600">Expected Cases: ${hs.expected_cases}</div>
        </div>
      `);

      const marker = new maplibregl.Marker(el)
        .setLngLat([hs.center_lon, hs.center_lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }

  return (
    <div className="relative w-full h-full min-h-[460px] border border-ink rounded overflow-hidden">
      <div ref={mapContainerRef} className="w-full h-full min-h-[460px]" />
      
      {/* Dynamic Zoom Level & Ward Detail Indicator */}
      <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded font-mono text-[11px] shadow-sm border border-ink/20 flex items-center space-x-2">
        <span className="w-2 h-2 rounded-full bg-teal-brand animate-ping" />
        <span>Location: <strong className="text-teal-brand uppercase">{selectedLocation}</strong></span>
        <span className="text-ink-muted">|</span>
        <span>Zoom: <strong>{currentZoom.toFixed(1)}</strong></span>
        <span className="text-ink-muted">|</span>
        <span>View Mode: <strong className={currentZoom >= 12 ? "text-amber-600" : "text-emerald-700"}>
          {currentZoom >= 12 ? "500m Grid Cell Detail" : "Ward Aggregation"}
        </strong></span>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 glass-panel p-3 rounded font-mono text-xs shadow-md border border-ink/20">
        <div className="font-semibold text-ink mb-1.5 uppercase">
          Active Layer: <span className="text-teal-brand font-bold">{activeLayer}</span>
        </div>
        <div className="flex items-center space-x-3">
          <span className="flex items-center"><span className="w-3 h-3 bg-[#5b7a5a] rounded-sm mr-1.5" /> 0-30 Low</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#b8862e] rounded-sm mr-1.5" /> 30-55 Moderate</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#a8492f] rounded-sm mr-1.5" /> 55-75 High</span>
          <span className="flex items-center"><span className="w-3 h-3 bg-[#7c1f2b] rounded-sm mr-1.5" /> 75+ Critical</span>
        </div>
      </div>
    </div>
  );
}
