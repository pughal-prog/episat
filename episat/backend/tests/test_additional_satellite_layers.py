import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.geospatial.adapters import DemoDataProvider
from app.ml.models.anomaly_engine import EnvironmentalAnomalyEngine
from app.ml.models.flood_mode import PostFloodRiskEngine

def test_grid_cells_contain_all_seven_new_layers():
    provider = DemoDataProvider()
    grid_cells = provider.fetch_grid_cells("Chennai", 13.0827, 80.2707)
    assert len(grid_cells) > 0

    cell = grid_cells[0]
    # Verify 7 new satellite & geospatial fields exist
    assert "elevation_m" in cell
    assert "built_up_density" in cell
    assert "drainage_basin_id" in cell
    assert "nighttime_lights" in cell
    assert cell["elevation_m"] == 15.0
    assert cell["built_up_density"] == 0.55
    assert cell["drainage_basin_id"] == "BASIN_SOUTH_COASTAL_01"

    observations = provider.fetch_observations("Chennai", 13.0827, 80.2707)
    obs_row = observations.iloc[0].to_dict()
    assert "sar_water_extent" in obs_row
    assert "soil_moisture" in obs_row
    assert "aerosol_index" in obs_row
    assert "nighttime_lights" in obs_row

def test_smap_soil_moisture_in_anomaly_engine():
    engine = EnvironmentalAnomalyEngine()
    row = {
        "rainfall_mm_zscore": 1.2,
        "ndwi_index_zscore": 1.5,
        "soil_moisture_zscore": 2.1, # SMAP soil saturation
        "lst_celsius_zscore": 0.4,
        "ndvi_index_zscore": 0.2,
        "humidity_pct_zscore": 0.8
    }
    res = engine.calculate_score(row)
    assert "soil_moisture" in res["drivers"]
    assert "soil_moisture_z" in res["z_scores"]
    assert res["z_scores"]["soil_moisture_z"] == 2.1

def test_sentinel1_sar_flood_mode_trigger():
    flood_engine = PostFloodRiskEngine(sar_water_threshold=0.25)
    
    # Test SAR radar flood detection (during monsoon cloud cover)
    obs_sar_flood = [
        {"cell_id": "CELL_001", "sar_water_extent": 0.35, "rainfall_mm": 20.0, "ndwi_index_zscore": 1.2},
        {"cell_id": "CELL_002", "sar_water_extent": 0.42, "rainfall_mm": 25.0, "ndwi_index_zscore": 1.8}
    ]
    res = flood_engine.evaluate_flood_status(obs_sar_flood)
    assert res["flood_mode_active"] is True
    assert "Sentinel-1 SAR Radar" in res["primary_detection_sensor"]
    assert res["max_sar_water_extent"] == 0.42
    assert res["severity"] == "EXTREME"

def test_static_layers_freshness_label_api():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/data-quality?location_name=Chennai")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            
            sources = json_data["data"]["sources"]
            srtm_source = next(s for s in sources if s["source_name"] == "SRTM_DEM")
            assert srtm_source["typical_latency"] == "Static Geospatial Baseline"
            assert srtm_source["observation_timestamp"] == "Static Baseline"

    asyncio.run(_run())
