import numpy as np
from typing import Dict, Any

class MosquitoBreedingSuitabilityModel:
    """
    Dedicated Breeding Suitability Index (BSI) model supporting pluggable disease vector ecologies.
    Evaluates environmental suitability for vector breeding (0 - 100).
    UI Disclaimer: "This score represents environmental suitability for vector breeding. It does not confirm mosquito presence."
    """
    def calculate_bsi(self, row: Dict[str, Any], disease: str = "dengue") -> Dict[str, Any]:
        ndwi = row.get("ndwi_index", 0.0)
        rainfall = row.get("rainfall_mm", 0.0)
        lst = row.get("lst_celsius", 25.0)
        humidity = row.get("humidity_pct", 50.0)
        water_persistence = row.get("water_persistence", 0.2)

        disease_clean = disease.lower()

        if disease_clean == "malaria":
            # Anopheles vector ecology: optimal ~24-28 °C, high humidity, semi-permanent water bodies
            if 18 <= lst <= 32:
                temp_factor = 1.0 - ((lst - 26.0) / 7.0) ** 2
            else:
                temp_factor = 0.15
            temp_factor = float(np.clip(temp_factor, 0.1, 1.0))

            water_factor = float(np.clip((max(0, ndwi) * 70.0 + water_persistence * 30.0), 0.0, 100.0))
            humidity_factor = float(np.clip((humidity - 35.0) / 55.0 * 100.0, 0.0, 100.0))
            rain_factor = float(np.clip(rainfall / 45.0 * 100.0, 0.0, 100.0))

            raw_bsi = (
                0.40 * water_factor +
                0.30 * (temp_factor * 100.0) +
                0.20 * humidity_factor +
                0.10 * rain_factor
            )
        else:
            # Aedes vector ecology (Dengue / Chikungunya): optimal ~26-30 °C
            if 20 <= lst <= 34:
                temp_factor = 1.0 - ((lst - 28.0) / 8.0) ** 2
            else:
                temp_factor = 0.2
            temp_factor = float(np.clip(temp_factor, 0.1, 1.0))

            water_factor = float(np.clip((max(0, ndwi) * 80.0 + water_persistence * 20.0), 0.0, 100.0))
            humidity_factor = float(np.clip((humidity - 30.0) / 60.0 * 100.0, 0.0, 100.0))
            rain_factor = float(np.clip(rainfall / 50.0 * 100.0, 0.0, 100.0))

            raw_bsi = (
                0.35 * water_factor +
                0.30 * (temp_factor * 100.0) +
                0.20 * humidity_factor +
                0.15 * rain_factor
            )

        bsi_score = float(np.clip(raw_bsi, 0.0, 100.0))

        if bsi_score < 20:
            risk_level = "Very Low"
        elif bsi_score < 40:
            risk_level = "Low"
        elif bsi_score < 60:
            risk_level = "Moderate"
        elif bsi_score < 80:
            risk_level = "High"
        else:
            risk_level = "Very High"

        explanation = (
            f"Breeding suitability for {disease.title()} vector is {risk_level.upper()} ({bsi_score:.1f}/100) driven by "
            f"water body index ({water_factor:.1f}), thermal condition ({lst:.1f}°C), "
            f"and humidity ({humidity:.1f}%)."
        )

        return {
            "disease": disease_clean,
            "bsi_score": round(bsi_score, 1),
            "risk_level": risk_level,
            "explanation": explanation,
            "components": {
                "water_factor": round(water_factor, 1),
                "temperature_factor": round(temp_factor * 100.0, 1),
                "humidity_factor": round(humidity_factor, 1),
                "rain_factor": round(rain_factor, 1)
            }
        }
