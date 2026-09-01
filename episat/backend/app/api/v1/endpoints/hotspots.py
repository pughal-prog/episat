from fastapi import APIRouter, Query
from app.geospatial.adapters import DemoDataProvider
from app.ml.models.hotspot_detector import HyperlocalHotspotDetector
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["hotspots"])

detector = HyperlocalHotspotDetector()
demo_provider = DemoDataProvider()

@router.get("/hotspots", response_model=APIResponse)
async def get_hotspots(
    location_name: str = Query("Chennai"),
    horizon_days: int = Query(21)
):
    coords = {"Chennai": (13.0827, 80.2707), "Delhi": (28.6139, 77.2090)}.get(location_name, (13.0827, 80.2707))
    cells = demo_provider.fetch_grid_cells(location_name, coords[0], coords[1])
    
    # Enrich cells with risk scores
    for i, c in enumerate(cells):
        c["risk_score"] = 65.0 + (i % 5) * 6.0
        c["bsi_score"] = 70.0 + (i % 4) * 5.0
        c["anomaly_score"] = 60.0 + (i % 3) * 8.0
        c["forecast_cases"] = 15.0 + (i % 5) * 5.0

    hotspots = detector.detect_hotspots(cells, horizon_days=horizon_days)

    return APIResponse(
        success=True,
        data=hotspots,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
