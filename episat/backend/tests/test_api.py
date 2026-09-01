import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_health_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/health")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert json_data["data"]["status"] == "HEALTHY"
    asyncio.run(_run())

def test_locations_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/locations")
            assert res.status_code == 200
            json_data = res.json()
            assert len(json_data["data"]) >= 4
    asyncio.run(_run())

def test_risk_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/risk?location_name=Chennai&horizon_days=21")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert len(json_data["data"]) > 0
            assert "episat_risk_score" in json_data["data"][0]
    asyncio.run(_run())

def test_simulation_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.post("/api/v1/simulation", json={
                "location_name": "Chennai",
                "rainfall_change_pct": 20.0,
                "temperature_change_c": 1.0,
                "water_persistence_change_pct": 10.0,
                "bsi_reduction_pct": 25.0
            })
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert "simulated_risk_score" in json_data["data"]
    asyncio.run(_run())

def test_flood_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/flood?location_name=Chennai")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert "flood_mode_active" in json_data["data"]
    asyncio.run(_run())

def test_models_registry_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/models")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert json_data["data"]["total_registered_models"] >= 3
    asyncio.run(_run())

def test_ablation_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/models/ablation?location_name=Chennai")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert len(json_data["data"]["ablation_results"]) == 5
    asyncio.run(_run())

def test_data_quality_endpoint():
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/data-quality")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            assert json_data["data"]["overall_quality_score"] > 90.0
    asyncio.run(_run())

