import pytest
import asyncio
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_states_endpoint_returns_all_36():
    """
    Part 3.1 Test: Confirms GET /api/v1/locations/states returns all 36 Indian States/UTs.
    """
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/locations/states")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            states = json_data["data"]
            assert len(states) == 36, f"Expected 36 states/UTs, got {len(states)}"
            
            state_ids = [s["state_id"] for s in states]
            assert "TN text" not in state_ids
            assert "TN" in state_ids
            assert "MH" in state_ids
            assert "DL" in state_ids
            assert "KA" in state_ids
            assert "WB" in state_ids

    asyncio.run(_run())
