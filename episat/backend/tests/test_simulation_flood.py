import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.models.simulator import ScenarioSimulatorEngine
from app.ml.models.flood_mode import PostFloodRiskEngine

def test_scenario_simulator_engine():
    simulator = ScenarioSimulatorEngine()
    
    # Test baseline vs intervention scenario
    res_base = simulator.run_simulation("Chennai", 0.0, 0.0, 0.0, 0.0)
    assert res_base["baseline_risk_score"] == res_base["simulated_risk_score"]

    res_vector_control = simulator.run_simulation("Chennai", 0.0, 0.0, 0.0, bsi_reduction_pct=40.0)
    assert res_vector_control["simulated_risk_score"] < res_base["baseline_risk_score"]
    assert res_vector_control["simulated_cases"] < res_base["baseline_cases"]
    assert "SIMULATION / SCENARIO ESTIMATE" in res_vector_control["disclaimer"]

def test_post_flood_risk_engine():
    flood_engine = PostFloodRiskEngine(rain_threshold_mm=65.0)

    # Normal observations
    obs_normal = [{"cell_id": "CELL_001", "rainfall_mm": 20.0, "ndwi_index_zscore": 0.2}]
    res_normal = flood_engine.evaluate_flood_status(obs_normal)
    assert res_normal["flood_mode_active"] is False
    assert res_normal["severity"] == "NORMAL"

    # Extreme rainfall / flood observation
    obs_flood = [
        {"cell_id": "CELL_001", "rainfall_mm": 85.0, "ndwi_index_zscore": 1.8},
        {"cell_id": "CELL_002", "rainfall_mm": 92.0, "ndwi_index_zscore": 2.2}
    ]
    res_flood = flood_engine.evaluate_flood_status(obs_flood)
    assert res_flood["flood_mode_active"] is True
    assert res_flood["severity"] in ["HIGH", "EXTREME"]
    assert res_flood["affected_cells_count"] == 2

def test_simulation_and_flood_api_endpoints():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # 1. Run Simulation API
            res_sim = await ac.post("/api/v1/simulation", json={
                "location_name": "Chennai",
                "rainfall_change_pct": 20.0,
                "temperature_change_c": 1.5,
                "bsi_reduction_pct": 30.0
            })
            assert res_sim.status_code == 200
            json_sim = res_sim.json()
            assert json_sim["success"] is True
            assert "simulated_risk_score" in json_sim["data"]

            # 2. Get Flood Status API
            res_flood = await ac.get("/api/v1/flood?location_name=Chennai")
            assert res_flood.status_code == 200
            json_flood = res_flood.json()
            assert json_flood["success"] is True
            assert "flood_mode_active" in json_flood["data"]

    asyncio.run(_run())
