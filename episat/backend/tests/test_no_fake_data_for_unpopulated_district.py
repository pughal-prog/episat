import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_no_fake_data_for_unpopulated_district():
    """
    Part 3.1 Test: Confirms API returns data_available=False for an unpopulated district rather than fabricating scores.
    """
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/spread?district=TN-THI") # Tiruvallur has no underlying grid data
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            data = json_data["data"]
            assert data["data_available"] is False
            assert "No underlying grid cell data" in data["message"]

    asyncio.run(_run())
