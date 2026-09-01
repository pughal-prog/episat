import pytest
from app.ml.models.anomaly_engine import EnvironmentalAnomalyEngine
from app.ml.models.bsi_model import MosquitoBreedingSuitabilityModel

def test_anomaly_engine_z_scores():
    engine = EnvironmentalAnomalyEngine()
    row = {
        "rainfall_mm_zscore": 2.5,
        "ndwi_index_zscore": 1.8,
        "lst_celsius_zscore": 0.5,
        "ndvi_index_zscore": 1.0,
        "humidity_pct_zscore": 1.2
    }
    res = engine.calculate_score(row)
    assert res["anomaly_score"] > 60.0
    assert res["category"] in ["High Anomaly", "Extreme Anomaly"]
    assert "rainfall_z" in res["z_scores"]

def test_bsi_model_thermal_and_water_curve():
    bsi_model = MosquitoBreedingSuitabilityModel()
    
    # Optimal breeding conditions (~28 deg C, high NDWI, high humidity)
    optimal_row = {
        "ndwi_index": 0.35,
        "rainfall_mm": 60.0,
        "lst_celsius": 28.0,
        "humidity_pct": 75.0,
        "water_persistence": 0.7
    }
    res_optimal = bsi_model.calculate_bsi(optimal_row)
    assert res_optimal["bsi_score"] >= 65.0
    assert res_optimal["risk_level"] in ["High", "Very High"]
    
    # Extreme cold / heat conditions (unfavorable breeding)
    cold_row = {
        "ndwi_index": 0.0,
        "rainfall_mm": 0.0,
        "lst_celsius": 12.0,
        "humidity_pct": 30.0,
        "water_persistence": 0.0
    }
    res_cold = bsi_model.calculate_bsi(cold_row)
    assert res_cold["bsi_score"] < res_optimal["bsi_score"]
