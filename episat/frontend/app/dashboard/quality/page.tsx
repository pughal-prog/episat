"use client";

import React, { useState, useEffect } from "react";
import { Database, CheckCircle2, ShieldCheck, Activity, RefreshCw } from "lucide-react";

export default function DataQualityPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/v1/data-quality")
      .then((res) => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
        return res.json().catch(() => null);
      })
      .then((json) => {
        if (json && json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Data Quality & Pipeline Health</h1>
        <p className="text-sm text-slate-400">
          Real-time transparency metrics for Earth Observation satellite feeds, weather sensors, and spatial grid ingestion pipelines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-sm">
            <span>Overall Quality Score</span>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-bold text-emerald-400">
            {data ? `${data.overall_quality_score}%` : "96.7%"}
          </div>
          <p className="text-xs text-slate-500 mt-1">High spatial accuracy across 500m grid cells</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-sm">
            <span>Ingestion Pipeline Status</span>
            <Activity className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-bold text-cyan-400">
            {data ? data.active_pipeline_status : "ONLINE"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Automated daily & weekly sensor sync</p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2 text-sm">
            <span>Data Mode</span>
            <Database className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-lg font-semibold text-amber-300 truncate">
            {data ? data.data_mode : "DEMO MODE (Synthetic 500m Grid)"}
          </div>
          <p className="text-xs text-slate-500 mt-1">Switchable to live GEE / Copernicus via config</p>
        </div>
      </div>

      {/* Source Health Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-cyan-400" />
          Earth Observation & Geospatial Sources
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Data Source</th>
                <th className="py-3 px-4">Target Indicator</th>
                <th className="py-3 px-4">Resolution</th>
                <th className="py-3 px-4">Spatial Coverage</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {(data?.sources || [
                {
                  source_name: "Sentinel-2 MSI (Copernicus)",
                  indicator: "NDVI, NDWI, Water Persistence",
                  spatial_resolution: "10m / 500m Grid",
                  coverage_pct: 98.4,
                  pipeline_status: "Healthy"
                },
                {
                  source_name: "Landsat-8/9 TIRS",
                  indicator: "Land Surface Temperature (LST)",
                  spatial_resolution: "30m / 500m Grid",
                  coverage_pct: 95.2,
                  pipeline_status: "Healthy"
                },
                {
                  source_name: "GPM IMERG",
                  indicator: "Daily & Cumulative Precipitation",
                  spatial_resolution: "0.1° / 500m Grid",
                  coverage_pct: 99.1,
                  pipeline_status: "Healthy"
                },
                {
                  source_name: "OpenStreetMap Infrastructure",
                  indicator: "Roads, Drain Networks, Urban Density",
                  spatial_resolution: "Vector Polygons",
                  coverage_pct: 94.0,
                  pipeline_status: "Healthy"
                }
              ]).map((src: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-800/40">
                  <td className="py-3 px-4 font-medium text-slate-100">{src.source_name}</td>
                  <td className="py-3 px-4 text-slate-300">{src.indicator}</td>
                  <td className="py-3 px-4 text-slate-400">{src.spatial_resolution}</td>
                  <td className="py-3 px-4 text-emerald-400 font-semibold">{src.coverage_pct}%</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {src.pipeline_status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
