"use client";

import React from "react";
import { Clock, AlertTriangle, ShieldCheck, RefreshCw, Database } from "lucide-react";

interface DataFreshnessBadgeProps {
  sourceName?: string;
  timestamp?: string;
  ageHours?: number;
  isStale?: boolean;
  stalenessReason?: string | null;
  compact?: boolean;
  envSummary?: string;
  diseaseSummary?: string;
  isRefreshing?: boolean;
  isDemoMode?: boolean;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  sourceName = "MODIS_LST",
  timestamp = "2026-08-31T14:00:00Z",
  ageHours = 3.5,
  isStale = false,
  stalenessReason = null,
  compact = false,
  envSummary,
  diseaseSummary,
  isRefreshing = false,
  isDemoMode = false,
}) => {
  // Global summary display
  if (envSummary || diseaseSummary) {
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono rounded-md bg-paper border border-ink/20 text-ink shadow-sm">
          {isRefreshing ? (
            <RefreshCw className="w-3.5 h-3.5 text-teal-brand animate-spin shrink-0" />
          ) : (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          )}
          <div className="flex items-center gap-2">
            <span>{envSummary || "Environmental data: updated 3h ago"}</span>
            <span className="text-ink/30">•</span>
            <span>{diseaseSummary || "Disease surveillance: updated 4 days ago"}</span>
          </div>
          {isRefreshing && (
            <span className="text-[10px] font-sans px-1.5 py-0.5 rounded bg-teal-brand/10 text-teal-brand animate-pulse">
              Refreshing...
            </span>
          )}
        </div>

        {isDemoMode && (
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded bg-amber-500/10 text-amber-700 border border-amber-500/30"
            title="Running in Demo Mode. Real satellite credentials omitted or invalid."
          >
            <Database className="w-3 h-3 text-amber-600 shrink-0" />
            <span>Demo Mode</span>
          </div>
        )}
      </div>
    );
  }

  const formattedTime = new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isStale) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20" title={stalenessReason || "Data pass delayed"}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
        <span>
          Last updated: {Math.round(ageHours / 24)}d ago ({stalenessReason ? "cloud cover" : "pass delayed"})
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
      <span>
        Updated as of {formattedTime} ({ageHours < 1 ? "<1h" : `${Math.round(ageHours)}h`} ago)
      </span>
    </div>
  );
};

