import pytest
import asyncio
import os
from pathlib import Path
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.disease_profiles import DISEASE_PROFILES, get_disease_profile
from app.ml.models.bsi_model import MosquitoBreedingSuitabilityModel
from app.ml.models.forecast_engine import DiseaseForecastEngine

def test_disease_profiles_registry():
    assert "dengue" in DISEASE_PROFILES
    assert "malaria" in DISEASE_PROFILES
    assert "chikungunya" in DISEASE_PROFILES
    assert "kala_azar" in DISEASE_PROFILES

    malaria_profile = get_disease_profile("malaria")
    assert malaria_profile.vector == "Anopheles stephensi / culicifacies"
    assert malaria_profile.status == "active"
    assert "elevation_m" in malaria_profile.relevant_features

def test_malaria_bsi_model_calculation():
    bsi_model = MosquitoBreedingSuitabilityModel()
    row = {"ndwi_index": 0.25, "rainfall_mm": 35.0, "lst_celsius": 26.0, "humidity_pct": 75.0, "water_persistence": 0.5}
    
    # Compare Dengue (Aedes) vs Malaria (Anopheles)
    res_dengue = bsi_model.calculate_bsi(row, disease="dengue")
    res_malaria = bsi_model.calculate_bsi(row, disease="malaria")

    assert res_dengue["disease"] == "dengue"
    assert res_malaria["disease"] == "malaria"
    assert 0.0 <= res_malaria["bsi_score"] <= 100.0

def test_malaria_forecast_engine():
    engine = DiseaseForecastEngine()
    row = {"lst_celsius": 26.5, "rainfall_mm": 20.0, "ndwi_index": 0.15, "cases_lag1": 15}
    
    res = engine.predict_horizon(row, horizon_days=21, disease="malaria")
    assert res["disease"] == "malaria"
    assert res["predicted_cases"] >= 0.0
    assert "malaria" in res["model_version"].lower()

def test_multi_disease_api_endpoints():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. GET /api/v1/forecast?disease=malaria
            res_fc = await ac.get("/api/v1/forecast?disease=malaria&location_name=Chennai")
            assert res_fc.status_code == 200
            json_fc = res_fc.json()
            assert json_fc["success"] is True
            assert json_fc["data"]["disease"] == "malaria"
            assert "Anopheles" in json_fc["data"]["vector"]

            # 2. GET /api/v1/models
            res_m = await ac.get("/api/v1/models")
            assert res_m.status_code == 200
            json_m = res_m.json()
            assert json_m["success"] is True
            model_ids = [m["model_id"] for m in json_m["data"]["models"]]
            assert "dengue_rf_v1" in model_ids
            assert "malaria_rf_v1" in model_ids

    asyncio.run(_run())
