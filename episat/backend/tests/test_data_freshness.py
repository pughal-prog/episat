import pytest
import asyncio
import os
import re
from httpx import AsyncClient, ASGITransport
from app.main import app

def test_data_quality_freshness_api():
    """
    Verifies GET /api/v1/data-quality endpoint returns honest observation timestamps,
    age calculations, and stale-layer flags per Section 58.
    """
    async def _run():
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
            res = await ac.get("/api/v1/data-quality?location_name=Chennai")
            assert res.status_code == 200
            json_data = res.json()
            assert json_data["success"] is True
            
            sources = json_data["data"]["sources"]
            assert len(sources) >= 5

            source_names = [s["source_name"] for s in sources]
            assert "MODIS_LST" in source_names
            assert "GPM_IMERG_EARLY" in source_names
            assert "CHIRPS_PRELIMINARY" in source_names
            assert "SENTINEL2_NDWI" in source_names
            assert "SENTINEL1_SAR" in source_names

            # Verify stale-layer flag for Sentinel-2 optical pass delay
            s2_source = next(s for s in sources if s["source_name"] == "SENTINEL2_NDWI")
            assert s2_source["is_stale"] is True
            assert "cloud cover" in s2_source["staleness_reason"].lower()

            # Verify fresh NRT source
            modis_source = next(s for s in sources if s["source_name"] == "MODIS_LST")
            assert modis_source["is_stale"] is False
            assert modis_source["age_hours"] < 24.0

    asyncio.run(_run())

def test_frontend_copy_audit_zero_unqualified_live_strings():
    """
    Mandatory Section 58.5 Audit:
    Ensures zero unqualified "live" or "real-time" copy strings exist in the frontend codebase.
    """
    frontend_dir = os.path.join(os.path.dirname(__file__), "..", "..", "frontend")
    if not os.path.exists(frontend_dir):
        pytest.skip("Frontend directory not present locally.")

    unqualified_patterns = [
        re.compile(r'\blive satellite\b', re.IGNORECASE),
        re.compile(r'\breal-time satellite\b', re.IGNORECASE),
        re.compile(r'\blive data streaming\b', re.IGNORECASE),
    ]

    violations = []
    for root, _, files in os.walk(frontend_dir):
        if "node_modules" in root or ".next" in root:
            continue
        for f in files:
            if f.endswith((".tsx", ".ts", ".jsx", ".js")):
                filepath = os.path.join(root, f)
                with open(filepath, "r", encoding="utf-8", errors="ignore") as file_handle:
                    content = file_handle.read()
                    for pattern in unqualified_patterns:
                        if pattern.search(content):
                            violations.append(f"{f}: matches '{pattern.pattern}'")

    assert len(violations) == 0, f"Found unqualified copy violations: {violations}"
