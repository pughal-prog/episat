"use client";

import React, { useEffect, useState } from "react";
import { useEpiSatStore } from "@/lib/store";
import { TrendingUp, TrendingDown, Minus, AlertTriangle, ShieldAlert, ArrowUpRight } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface NeighborDistrict {
  neighbor_district_id: string;
  neighbor_district_name: string;
  distance_km: number;
  predicted_spread_risk: number;
  spread_risk_level: string;
  estimated_arrival_horizon: string;
}

interface SpreadData {
  district_id: string;
  district_name: string;
  state_id: string;
  data_available: boolean;
  message?: string;
  current_risk_score?: number;
  previous_risk_score?: number;
  week_over_week_growth_pct?: number;
  growth_trend_direction?: string;
  trend_badge?: string;
  forecast_7d_projection?: number;
  neighboring_districts_at_risk?: NeighborDistrict[];
  disclaimer?: string;
}

export const SpreadMetricCard: React.FC = () => {
  const { selectedLocation } = useEpiSatStore();
  const [spreadData, setSpreadData] = useState<SpreadData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE_URL}/spread?district=${encodeURIComponent(selectedLocation)}`)
      .then((res) => {
        if (!res.ok || !res.headers.get("content-type")?.includes("application/json")) return null;
        return res.json().catch(() => null);
      })
      .then((resData) => {
        if (resData && resData.success && resData.data) {
          setSpreadData(resData.data);
        }
      })
      .catch(() => {
        setSpreadData(null);
      })
      .finally(() => setLoading(false));
  }, [selectedLocation]);

  if (loading) {
    return (
      <div className="bg-paper border border-ink/20 rounded-lg p-4 animate-pulse">
        <div className="h-4 bg-ink/10 rounded w-1/3 mb-2"></div>
        <div className="h-8 bg-ink/10 rounded w-1/2"></div>
      </div>
    );
  }

  if (!spreadData || !spreadData.data_available) {
    return (
      <div className="bg-paper border border-amber-500/30 rounded-lg p-4 bg-amber-500/5">
        <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-semibold mb-1">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span>No Grid Data Available</span>
        </div>
        <p className="text-xs text-ink/70 font-mono">
          {spreadData?.message || `No underlying grid cell data available for '${selectedLocation}' yet.`}
        </p>
      </div>
    );
  }

  const growthPct = spreadData.week_over_week_growth_pct ?? 0;
  const isSurging = growthPct > 15;
  const isIncreasing = growthPct > 3;
  const isDeclining = growthPct < -3;

  return (
    <div className="bg-paper border border-ink/20 rounded-lg p-4 shadow-sm hover:border-teal-brand/50 transition-colors">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-mono text-ink/70">
          <ShieldAlert className="w-4 h-4 text-teal-brand" />
          <span>Disease Spread & Growth Rate</span>
        </div>
        <span className="text-[10px] font-mono text-ink/40">WoW Trajectory</span>
      </div>

      <div className="flex items-baseline justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-mono text-ink">
              {growthPct > 0 ? `+${growthPct}%` : `${growthPct}%`}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-xs font-mono font-semibold px-2 py-0.5 rounded border ${
                isSurging
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                  : isIncreasing
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : isDeclining
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                  : "bg-sky-500/10 text-sky-400 border-sky-500/30"
              }`}
            >
              {isIncreasing ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : isDeclining ? (
                <TrendingDown className="w-3.5 h-3.5" />
              ) : (
                <Minus className="w-3.5 h-3.5" />
              )}
              {spreadData.growth_trend_direction}
            </span>
          </div>
          <div className="text-[11px] font-mono text-ink/60 mt-0.5">
            Week-over-Week Risk Score Growth Rate
          </div>
        </div>

        <div className="text-right">
          <div className="text-xs font-mono text-ink/60">7-Day Projection</div>
          <div className="text-lg font-bold font-mono text-teal-brand">
            {spreadData.forecast_7d_projection}/100
          </div>
        </div>
      </div>

      {/* Neighboring District Spread Risks */}
      {spreadData.neighboring_districts_at_risk && spreadData.neighboring_districts_at_risk.length > 0 && (
        <div className="mt-3 pt-3 border-t border-ink/10">
          <div className="text-[11px] font-mono font-semibold text-ink/80 mb-2 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5 text-rose-400" />
            <span>Predicted Neighboring District Spread Risk:</span>
          </div>
          <div className="space-y-1.5">
            {spreadData.neighboring_districts_at_risk.map((n) => (
              <div
                key={n.neighbor_district_id}
                className="flex items-center justify-between text-xs font-mono bg-paper-raised p-1.5 rounded border border-ink/10"
              >
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink">{n.neighbor_district_name}</span>
                  <span className="text-[10px] text-ink/50">({n.distance_km} km)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-ink/60">{n.estimated_arrival_horizon}</span>
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${
                      n.spread_risk_level === "CRITICAL"
                        ? "bg-rose-500/20 text-rose-400"
                        : n.spread_risk_level === "HIGH"
                        ? "bg-amber-500/20 text-amber-400"
                        : "bg-sky-500/20 text-sky-400"
                    }`}
                  >
                    {n.predicted_spread_risk} Risk
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-2.5 text-[9px] font-mono text-ink/40 border-t border-ink/5 pt-1.5">
        ⚠️ {spreadData.disclaimer}
      </div>
    </div>
  );
};
