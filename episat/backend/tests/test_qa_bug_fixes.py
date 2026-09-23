import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.all_india_lgd_locations import get_all_states, get_districts_by_state, get_district_by_id_or_name
from app.geospatial.adapters import DemoDataProvider, RealSatelliteProvider

def test_bug_1_and_5_dynamic_district_grid_allocation():
    """Verifies Bug 1 & 5: Grid data is allocated dynamically for arbitrary districts with distinct lat/lon centroids."""
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            for district_name in ["Pune", "Jaipur", "Kochi", "Madurai", "Guwahati"]:
                res = await ac.get(f"/api/v1/grid?location_name={district_name}")
                assert res.status_code == 200
                json_data = res.json()
                assert json_data["success"] is True
                cells = json_data["data"]
                assert len(cells) == 25
                # Verify cells carry proper centroid coordinates for that specific district
                dist_info = get_district_by_id_or_name(district_name)
                assert dist_info is not None
                assert abs(cells[0]["center_lat"] - dist_info["lat"]) < 0.1
                assert abs(cells[0]["center_lon"] - dist_info["lon"]) < 0.1

    asyncio.run(_run())

def test_bug_2_ward_boundary_polygons_endpoint():
    """Verifies Bug 2: Administrative ward boundary polygons render distinctly with valid GeoJSON geometries."""
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/wards?location_name=Pune")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            wards = json_data["data"]
            assert len(wards) == 5
            for w in wards:
                assert "ward_id" in w
                assert "geometry_geojson" in w
                assert w["geometry_geojson"]["type"] == "Polygon"
                assert len(w["geometry_geojson"]["coordinates"][0]) == 5

    asyncio.run(_run())

def test_bug_3_all_36_states_and_districts_coverage():
    """Verifies Bug 3: Complete registry coverage for all 36 Indian States/UTs with valid district listings."""
    states = get_all_states()
    assert len(states) == 36
    
    state_ids = [s["state_id"] for s in states]
    assert "TN" in state_ids
    assert "MH" in state_ids
    assert "RJ" in state_ids
    assert "KL" in state_ids
    assert "UP" in state_ids
    assert "DL" in state_ids

    # Confirm every state has districts populated
    for state in states:
        districts = get_districts_by_state(state["state_id"])
        assert len(districts) >= 1, f"State {state['state_name']} has no districts"

def test_bug_4_transparent_data_provider_health_check():
    """Verifies Bug 4: Satellite provider transparently reports demo vs real mode without deceptive labels."""
    provider = RealSatelliteProvider()
    health = provider.check_credentials_health()
    assert "credentials_valid" in health
    assert "fallback_to_demo" in health
    assert "reason" in health
    if not health["credentials_valid"]:
        assert health["fallback_to_demo"] is True
