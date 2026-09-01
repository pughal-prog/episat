import numpy as np
from typing import Dict, Any

DEFAULT_FUSION_WEIGHTS = {
    "anomaly": 0.25,
    "bsi": 0.35,
    "forecast": 0.25,
    "spatial_neighbor": 0.15
}

class RiskFusionEngine:
    """
    Fuses environmental anomaly, breeding suitability, disease forecast, spatial neighbor risk,
    and post-flood triggers into the definitive EpiSat Risk Score (0 - 100).
    """
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_FUSION_WEIGHTS

    def fuse_risk(
        self,
        anomaly_score: float,
        bsi_score: float,
        forecast_cases: float,
        neighbor_risk: float = 30.0,
        flood_event: bool = False
    ) -> Dict[str, Any]:
        
        # Convert forecast cases to normalized 0-100 scale
        forecast_norm = float(np.clip(forecast_cases / 50.0 * 100.0, 0.0, 100.0))

        # Weighted aggregate
        fused = (
            self.weights["anomaly"] * anomaly_score +
            self.weights["bsi"] * bsi_score +
            self.weights["forecast"] * forecast_norm +
            self.weights["spatial_neighbor"] * neighbor_risk
        )

        # Flood multiplier
        if flood_event:
            fused *= 1.25

        final_risk_score = float(np.clip(fused, 0.0, 100.0))

        if final_risk_score < 20:
            risk_level = "Very Low"
        elif final_risk_score < 40:
            risk_level = "Low"
        elif final_risk_score < 60:
            risk_level = "Moderate"
        elif final_risk_score < 80:
            risk_level = "High"
        else:
            risk_level = "Critical"

        return {
            "episat_risk_score": round(final_risk_score, 1),
            "risk_level": risk_level,
            "components": {
                "environmental_anomaly": round(anomaly_score, 1),
                "breeding_suitability": round(bsi_score, 1),
                "forecast_risk": round(forecast_norm, 1),
                "neighbor_risk": round(neighbor_risk, 1),
                "flood_event_applied": flood_event
            }
        }
