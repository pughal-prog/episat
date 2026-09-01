from typing import Dict, Any, List
import pandas as pd
import numpy as np

class PostFloodRiskEngine:
    """
    Post-Flood Vector Risk Engine upgraded with Sentinel-1 SAR Cloud-Penetrating Radar.
    Detects observed surface water extent (Sentinel-1 SAR VV/VH backscatter) during monsoon cloud cover,
    supported by GPM IMERG rainfall accumulation fallback.
    """
    def __init__(self, sar_water_threshold: float = 0.25, rain_threshold_mm: float = 65.0):
        self.sar_water_threshold = sar_water_threshold
        self.rain_threshold_mm = rain_threshold_mm

    def evaluate_flood_status(self, observations: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not observations:
            return {
                "flood_mode_active": False,
                "reason": "No environmental observation data provided",
                "severity": "NORMAL",
                "affected_cells_count": 0
            }

        df = pd.DataFrame(observations)
        
        max_sar_extent = df["sar_water_extent"].max() if "sar_water_extent" in df else 0.08
        max_rain = df["rainfall_mm"].max() if "rainfall_mm" in df else 0.0
        avg_rain = df["rainfall_mm"].mean() if "rainfall_mm" in df else 0.0
        max_ndwi_z = df["ndwi_index_zscore"].max() if "ndwi_index_zscore" in df else 0.0

        # Primary trigger: Sentinel-1 SAR water ratio >= 0.25 OR rainfall >= 65mm
        sar_active = bool(max_sar_extent >= self.sar_water_threshold)
        rain_active = bool(max_rain >= self.rain_threshold_mm)
        active = sar_active or rain_active

        if max_sar_extent >= 0.40 or max_rain > 100.0:
            severity = "EXTREME"
        elif active:
            severity = "HIGH"
        else:
            severity = "NORMAL"

        affected_cells = []
        if active and "cell_id" in df:
            high_risk_cells = df[(df.get("sar_water_extent", 0) >= 0.20) | (df["rainfall_mm"] >= 45.0)]
            affected_cells = high_risk_cells["cell_id"].tolist()

        primary_sensor = "Sentinel-1 SAR Radar (Cloud-Penetrating)" if sar_active else "GPM IMERG Precipitation (Fallback)"

        return {
            "flood_mode_active": active,
            "severity": severity,
            "primary_detection_sensor": primary_sensor,
            "max_sar_water_extent": round(float(max_sar_extent), 3),
            "max_rainfall_mm": round(float(max_rain), 1),
            "avg_rainfall_mm": round(float(avg_rain), 1),
            "max_water_anomaly_zscore": round(float(max_ndwi_z), 2),
            "affected_cells_count": len(affected_cells),
            "affected_cell_ids": affected_cells[:10],
            "recommended_action": (
                "Deploy immediate post-flood vector control: larvicide treatment in SAR-mapped inundation zones "
                "and priority fogging within 48 hours." if active else "Routine environmental surveillance."
            )
        }
