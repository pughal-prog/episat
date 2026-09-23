import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_districts_endpoint_filters_by_state():
    """
    Part 3.1 Test: Confirms GET /api/v1/locations/districts?state_id=TN filters Tamil Nadu districts.
    """
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/locations/districts?state_id=TN")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            districts = json_data["data"]
            assert len(districts) >= 3
            
            district_names = [d["district_name"] for d in districts]
            assert "Chennai" in district_names
            assert "Coimbatore" in district_names
            assert "Madurai" in district_names
            assert "Mumbai Suburban" not in district_names

    asyncio.run(_run())
