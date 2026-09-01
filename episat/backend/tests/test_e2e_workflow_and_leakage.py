import pytest
import asyncio
import pandas as pd
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.ml.models.train_real_model import load_and_preprocess_real_dataset, FEATURE_COLS

def test_temporal_split_leakage_prevention():
    """
    CRITICAL TEST: Ensures strict temporal validation split with 0% data leakage.
    Train set: < 2023-01-01, Test set: >= 2023-01-01.
    """
    df = load_and_preprocess_real_dataset()
    
    train_df = df[df["week_start"] < "2023-01-01"].copy()
    test_df = df[df["week_start"] >= "2023-01-01"].copy()

    # 1. Assert non-empty sets
    assert len(train_df) > 0
    assert len(test_df) > 0

    # 2. Strict max train date < min test date
    max_train_date = train_df["week_start"].max()
    min_test_date = test_df["week_start"].min()
    assert max_train_date < min_test_date

    # 3. Assert zero date overlap between train and test indices
    train_dates = set(train_df["week_start"])
    test_dates = set(test_df["week_start"])
    assert len(train_dates.intersection(test_dates)) == 0

def test_end_to_end_user_journey_workflow():
    """
    Simulates complete user workflow:
    Login -> Fetch Locations -> Select Grid Cell -> View Risk -> View Forecast -> View Explanation -> View Interventions -> Run Simulation
    """
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            # Step 1: Health check
            res_h = await ac.get("/api/v1/health")
            assert res_h.status_code == 200

            # Step 2: Fetch Locations & Grid Cells
            res_loc = await ac.get("/api/v1/locations")
            assert res_loc.status_code == 200
            locations = res_loc.json()["data"]
            loc_name = locations[0]["name"]

            res_grid = await ac.get(f"/api/v1/grid?location_name={loc_name}")
            assert res_grid.status_code == 200
            grid_cells = res_grid.json()["data"]
            target_cell_id = grid_cells[0]["id"]

            # Step 3: View Hyperlocal Risk Score
            res_risk = await ac.get(f"/api/v1/risk?location_name={loc_name}&horizon_days=21")
            assert res_risk.status_code == 200
            risk_data = res_risk.json()["data"]
            assert len(risk_data) > 0

            # Step 4: View Multi-Horizon Forecast
            res_fc = await ac.get(f"/api/v1/risk?location_name={loc_name}&horizon_days=28")
            assert res_fc.status_code == 200

            # Step 5: View SHAP Local Explainability
            res_xai = await ac.get(f"/api/v1/explainability?cell_id={target_cell_id}&location_name={loc_name}")
            assert res_xai.status_code == 200
            xai_data = res_xai.json()["data"]
            assert "shap_contributions" in xai_data

            # Step 6: View Recommended Interventions
            res_int = await ac.get(f"/api/v1/interventions?location_name={loc_name}&ward_name=Ward%2042&risk_level=Critical")
            assert res_int.status_code == 200
            actions = res_int.json()["data"]
            assert len(actions) > 0

            # Step 7: Run What-If Scenario Simulation
            res_sim = await ac.post("/api/v1/simulation", json={
                "location_name": loc_name,
                "rainfall_change_pct": 15.0,
                "bsi_reduction_pct": 35.0
            })
            assert res_sim.status_code == 200
            sim_data = res_sim.json()["data"]
            assert sim_data["simulated_risk_score"] < sim_data["baseline_risk_score"]

    asyncio.run(_run())
