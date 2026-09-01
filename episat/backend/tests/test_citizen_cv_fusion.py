import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.models.cv_water_detector import StagnantWaterCVClassifier, VGG19WaterClassifier
from app.ml.models.citizen_satellite_fusion import CitizenSatelliteFusionEngine

def test_vgg19_classifier_architecture():
    model = VGG19WaterClassifier(num_classes=5)
    # Verify early layers are frozen
    frozen_params = [p.requires_grad for p in list(model.features.parameters())[:20]]
    assert all(p is False for p in frozen_params)

def test_stagnant_water_cv_classifier():
    classifier = StagnantWaterCVClassifier()
    res = classifier.classify_image()
    assert "classification" in res
    assert 0.0 <= res["standing_water_probability"] <= 1.0
    assert res["potential_breeding_site_level"] in ["HIGH", "MODERATE", "LOW"]
    assert "VGG19" in res["model_architecture"]

def test_citizen_satellite_fusion_engine():
    fusion = CitizenSatelliteFusionEngine()
    res = fusion.fuse_evidence(
        satellite_evidence_score=75.0,
        weather_evidence_score=65.0,
        disease_forecast_score=60.0,
        citizen_report_count=3,
        verified_cv_water_prob=0.88
    )
    assert 0.0 <= res["fused_risk_score"] <= 100.0
    assert res["fused_risk_level"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    assert res["evidence_breakdown"]["citizen_reports_evidence"]["report_count"] == 3

def test_citizen_report_submission_api():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.post("/api/v1/citizen-reports", data={
                "latitude": 13.0827,
                "longitude": 80.2707,
                "description": "Standing water near construction site"
            })
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert json_data["data"]["latitude"] == 13.0827
            assert "computer_vision" in json_data["data"]

    asyncio.run(_run())
