from typing import List, Dict, Any

class InterventionRecommendationEngine:
    """
    Public-Health Decision Support Engine (Req #20).
    Generates actionable, non-medical recommendations for health authorities based on risk level, drivers, and forecast.
    """
    def generate_recommendations(
        self,
        location_name: str,
        ward_name: str,
        risk_level: str,
        bsi_score: float,
        forecast_cases: float,
        flood_mode: bool = False
    ) -> List[Dict[str, Any]]:
        
        actions = []

        if risk_level in ["Critical", "High"] or flood_mode:
            actions.append({
                "id": 1,
                "location_name": location_name,
                "ward_name": ward_name,
                "priority": "HIGH",
                "action": "Inspect stagnant-water hotspots and conduct targeted larval surveillance.",
                "reason": f"Elevated breeding suitability index ({bsi_score:.1f}/100) and forecast surge ({forecast_cases:.1f} expected cases).",
                "target_area": f"{ward_name} — High Density Sectors",
                "status": "Recommended",
                "suggested_timeline": "Within 48 hours"
            })
            actions.append({
                "id": 2,
                "location_name": location_name,
                "ward_name": ward_name,
                "priority": "HIGH",
                "action": "Deploy vector-control field personnel for focal larviciding / anti-larval treatment.",
                "reason": "High risk threshold exceeded in spatial grid cells.",
                "target_area": f"{ward_name} Drainage Outfalls & Construction Sites",
                "status": "In Progress",
                "suggested_timeline": "1–3 days"
            })
            actions.append({
                "id": 3,
                "location_name": location_name,
                "ward_name": ward_name,
                "priority": "MEDIUM",
                "action": "Broadcast hyperlocal community advisories regarding standing water removal.",
                "reason": "Preemptive community engagement reduces container breeding sites.",
                "target_area": f"{ward_name} Residential & School Zones",
                "status": "Recommended",
                "suggested_timeline": "This week"
            })
        else:
            actions.append({
                "id": 4,
                "location_name": location_name,
                "ward_name": ward_name,
                "priority": "LOW",
                "action": "Maintain routine vector surveillance and monitor weekly satellite indicators.",
                "reason": "Risk level is currently manageable within baseline bounds.",
                "target_area": ward_name,
                "status": "Completed",
                "suggested_timeline": "Routine (Weekly)"
            })

        return actions
