from typing import Dict, Any, List

class CitizenSatelliteFusionEngine:
    """
    Multimodal Risk Fusion Engine combining Earth Observation (Satellite + Weather),
    Epidemiological disease surveillance, and Citizen-submitted geotagged water hazard reports.
    """
    def fuse_evidence(
        self,
        satellite_evidence_score: float,
        weather_evidence_score: float,
        disease_forecast_score: float,
        citizen_report_count: int,
        verified_cv_water_prob: float = 0.0
    ) -> Dict[str, Any]:
        """
        Combines 4 evidence streams into a unified public health risk score.
        """
        sat_weight = 0.30
        weather_weight = 0.25
        disease_weight = 0.30
        citizen_weight = 0.15

        # Citizen evidence boost based on verified photo reports in grid cell
        citizen_evidence_score = min(100.0, citizen_report_count * 25.0 + verified_cv_water_prob * 30.0)

        fused_score = (
            satellite_evidence_score * sat_weight +
            weather_evidence_score * weather_weight +
            disease_forecast_score * disease_weight +
            citizen_evidence_score * citizen_weight
        )
        fused_score = min(100.0, max(0.0, fused_score))

        if fused_score >= 80.0:
            level = "CRITICAL"
        elif fused_score >= 60.0:
            level = "HIGH"
        elif fused_score >= 40.0:
            level = "MODERATE"
        elif fused_score >= 20.0:
            level = "LOW"
        else:
            level = "VERY LOW"

        return {
            "fused_risk_score": round(fused_score, 1),
            "fused_risk_level": level,
            "evidence_breakdown": {
                "satellite_evidence": {
                    "score": round(satellite_evidence_score, 1),
                    "status": "HIGH" if satellite_evidence_score > 60 else "NORMAL"
                },
                "weather_evidence": {
                    "score": round(weather_evidence_score, 1),
                    "status": "HIGH" if weather_evidence_score > 60 else "NORMAL"
                },
                "disease_forecast_evidence": {
                    "score": round(disease_forecast_score, 1),
                    "status": "ELEVATED" if disease_forecast_score > 50 else "STABLE"
                },
                "citizen_reports_evidence": {
                    "score": round(citizen_evidence_score, 1),
                    "report_count": citizen_report_count,
                    "verified_water_prob": round(verified_cv_water_prob, 2)
                }
            },
            "summary_tag": f"Satellite ({int(satellite_evidence_score)}) + Weather ({int(weather_evidence_score)}) + Citizen ({citizen_report_count} reports)"
        }
