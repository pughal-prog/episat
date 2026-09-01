"use client";

import React from "react";
import { Clock, AlertTriangle, ShieldCheck } from "lucide-react";

interface DataFreshnessBadgeProps {
  sourceName?: string;
  timestamp?: string;
  ageHours?: number;
  isStale?: boolean;
  stalenessReason?: string | null;
  compact?: boolean;
}

export const DataFreshnessBadge: React.FC<DataFreshnessBadgeProps> = ({
  sourceName = "MODIS_LST",
  timestamp = "2026-08-31T14:00:00Z",
  ageHours = 3.5,
  isStale = false,
  stalenessReason = null,
  compact = false
}) => {
  const formattedTime = new Date(timestamp).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  if (isStale) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20" title={stalenessReason || "Data pass delayed"}>
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>
          Last updated: {Math.round(ageHours / 24)}d ago ({stalenessReason ? "cloud cover" : "pass delayed"})
        </span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
      <span>
        Updated as of {formattedTime} ({ageHours < 1 ? "<1h" : `${Math.round(ageHours)}h`} ago)
      </span>
    </div>
  );
};
