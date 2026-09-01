import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.models.interventions import InterventionRecommendationEngine

def test_intervention_recommendation_engine():
    engine = InterventionRecommendationEngine()
    actions = engine.generate_recommendations("Chennai", "Ward 42", "Critical", 82.0, 42.0)
    assert len(actions) >= 3
    first_action = actions[0]
    assert first_action["priority"] == "HIGH"
    assert "Ward 42" in first_action["target_area"]
    assert first_action["status"] in ["Recommended", "In Progress"]

def test_reports_and_interventions_api_endpoints():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Get Interventions
            res_int = await ac.get("/api/v1/interventions?location_name=Chennai&ward_name=Ward%2042&risk_level=Critical")
            assert res_int.status_code == 200
            json_int = res_int.json()
            assert json_int["success"] is True
            assert len(json_int["data"]) > 0

            # 2. Patch Intervention Status
            res_patch = await ac.patch("/api/v1/interventions/1", json={"status": "In Progress"})
            assert res_patch.status_code == 200
            json_patch = res_patch.json()
            assert json_patch["data"]["status"] == "In Progress"

            # 3. Get Report Summary
            res_sum = await ac.get("/api/v1/reports/summary?location_name=Chennai")
            assert res_sum.status_code == 200
            json_sum = res_sum.json()
            assert json_sum["success"] is True
            assert "ELEVATED RISK" in json_sum["data"]["overall_status"]

            # 4. Export CSV Report
            res_csv = await ac.get("/api/v1/reports/csv?location_name=Chennai")
            assert res_csv.status_code == 200
            assert "text/csv" in res_csv.headers["content-type"]
            assert "Location,Ward,Risk Score" in res_csv.text

    asyncio.run(_run())
