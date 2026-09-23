"""
EpiSat 2.0 - Disease Spread & Spatial Growth Engine
=====================================================
Calculates week-over-week risk growth rate percentage and spatial risk propagation
to neighboring districts based on distance weighting and source risk trajectory.
"""

import math
from typing import Dict, Any, List, Optional
from app.core.all_india_lgd_locations import get_district_by_id_or_name, ALL_INDIA_DISTRICTS

class DiseaseSpreadEngine:
    """
    Spatial-Proximity & Risk Growth Rate Heuristic Engine.
    """
    def calculate_district_spread(
        self,
        district_name_or_id: str,
        current_risk_score: float = 68.5,
        previous_risk_score: float = 58.0
    ) -> Dict[str, Any]:
        district = get_district_by_id_or_name(district_name_or_id)
        if not district:
            # Generic fallback if district ID not found directly
            target_id = district_name_or_id
            target_name = district_name_or_id
            state_id = "TN"
            neighbors = []
            has_demo_data = False
        else:
            target_id = district["district_id"]
            target_name = district["district_name"]
            state_id = district["state_id"]
            neighbors = district.get("neighbors", [])
            has_demo_data = district.get("has_demo_data", False)

        if not has_demo_data:
            return {
                "district_id": target_id,
                "district_name": target_name,
                "state_id": state_id,
                "data_available": False,
                "message": f"No underlying grid cell data available for district '{target_name}' yet."
            }

        # Week-Over-Week Growth Rate Formula: (current - prev) / prev
        prev_safe = max(1.0, previous_risk_score)
        growth_rate_fraction = (current_risk_score - prev_safe) / prev_safe
        growth_rate_pct = round(growth_rate_fraction * 100.0, 1)

        if growth_rate_pct > 15.0:
            trend_direction = "SURGING"
            trend_badge = "CRITICAL_GROWTH"
        elif growth_rate_pct > 3.0:
            trend_direction = "INCREASING"
            trend_badge = "MODERATE_GROWTH"
        elif growth_rate_pct >= -3.0:
            trend_direction = "STABLE"
            trend_badge = "PLATEAU"
        else:
            trend_direction = "DECREASING"
            trend_badge = "DECLINING"

        # Neighboring District Propagation Ranking
        neighbor_spread_list: List[Dict[str, Any]] = []
        for n_id in neighbors:
            n_dist = get_district_by_id_or_name(n_id)
            if n_dist:
                # Estimate distance using haversine or centroid delta
                lat1, lon1 = district["lat"], district["lon"]
                lat2, lon2 = n_dist["lat"], n_dist["lon"]
                dist_km = round(math.sqrt((lat2 - lat1)**2 + (lon2 - lon1)**2) * 111.0, 1)

                # Propagation weight inversely proportional to distance and driven by growth rate
                spatial_weight = max(0.2, 1.0 - (dist_km / 150.0))
                propagation_factor = max(0.05, growth_rate_fraction * spatial_weight * 0.45)
                predicted_neighbor_risk = min(98.0, round(current_risk_score * (1.0 + propagation_factor), 1))

                neighbor_spread_list.append({
                    "neighbor_district_id": n_dist["district_id"],
                    "neighbor_district_name": n_dist["district_name"],
                    "distance_km": dist_km,
                    "predicted_spread_risk": predicted_neighbor_risk,
                    "spread_risk_level": "CRITICAL" if predicted_neighbor_risk >= 75.0 else ("HIGH" if predicted_neighbor_risk >= 60.0 else "MODERATE"),
                    "estimated_arrival_horizon": "7-14 Days" if growth_rate_pct > 10.0 else "14-28 Days"
                })

        # Sort neighbor districts by predicted spread risk descending
        neighbor_spread_list.sort(key=lambda x: x["predicted_spread_risk"], reverse=True)

        return {
            "district_id": target_id,
            "district_name": target_name,
            "state_id": state_id,
            "data_available": True,
            "current_risk_score": round(current_risk_score, 1),
            "previous_risk_score": round(previous_risk_score, 1),
            "week_over_week_growth_pct": growth_rate_pct,
            "growth_trend_direction": trend_direction,
            "trend_badge": trend_badge,
            "forecast_7d_projection": round(current_risk_score * (1.0 + growth_rate_fraction * 0.5), 1),
            "neighboring_districts_at_risk": neighbor_spread_list,
            "disclaimer": "Spatial-proximity & growth-rate heuristic estimate for early warning vector control; not a clinical epidemiological epidemic model."
        }
