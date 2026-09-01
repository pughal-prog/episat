import pandas as pd
import numpy as np
from typing import Dict, Any

DEFAULT_ANOMALY_WEIGHTS = {
    "rainfall": 0.25,
    "water": 0.25,
    "soil_moisture": 0.20, # SMAP Soil Saturation pre-pooling indicator
    "lst": 0.15,
    "vegetation": 0.10,
    "humidity": 0.05,
}

class EnvironmentalAnomalyEngine:
    """
    Computes a multi-factor Environmental Anomaly Score (0 - 100) using standardized Z-scores,
    incorporating SMAP Soil Moisture, Sentinel-2 NDWI, CHIRPS rainfall, and MODIS LST.
    Note: Configurable/model-derived weights per Master Prompt Section 11.
    """
    def __init__(self, weights: Dict[str, float] = None):
        self.weights = weights or DEFAULT_ANOMALY_WEIGHTS

    def calculate_score(self, row: Dict[str, Any]) -> Dict[str, Any]:
        # Extract Z-scores or calculate from raw vs mean
        r_z = row.get("rainfall_mm_zscore", 0.0)
        w_z = row.get("ndwi_index_zscore", 0.0)
        sm_z = row.get("soil_moisture_zscore", row.get("soil_moisture", 0.28) * 2.0 - 0.5)
        lst_z = row.get("lst_celsius_zscore", 0.0)
        veg_z = row.get("ndvi_index_zscore", 0.0)
        h_z = row.get("humidity_pct_zscore", 0.0)

        def z_to_score(z: float) -> float:
            return float(np.clip((z + 2.0) / 4.0 * 100.0, 0.0, 100.0))

        scores = {
            "rainfall": z_to_score(r_z),
            "water": z_to_score(w_z),
            "soil_moisture": z_to_score(sm_z),
            "lst": z_to_score(lst_z),
            "vegetation": z_to_score(veg_z),
            "humidity": z_to_score(h_z)
        }

        total_score = float(np.clip(sum(scores[k] * self.weights.get(k, 0.10) for k in scores), 0.0, 100.0))

        if total_score < 20:
            category = "Normal"
        elif total_score < 40:
            category = "Low Anomaly"
        elif total_score < 60:
            category = "Moderate Anomaly"
        elif total_score < 80:
            category = "High Anomaly"
        else:
            category = "Extreme Anomaly"

        return {
            "anomaly_score": round(total_score, 1),
            "category": category,
            "drivers": {k: round(v, 1) for k, v in scores.items()},
            "z_scores": {
                "rainfall_z": round(r_z, 2),
                "water_z": round(w_z, 2),
                "soil_moisture_z": round(sm_z, 2),
                "lst_z": round(lst_z, 2),
                "vegetation_z": round(veg_z, 2),
                "humidity_z": round(h_z, 2)
            }
        }
