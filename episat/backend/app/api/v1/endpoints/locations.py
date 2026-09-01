from fastapi import APIRouter, Depends, Query
from app.geospatial.adapters import DemoDataProvider
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["locations"])

demo_provider = DemoDataProvider()

@router.get("/locations", response_model=APIResponse)
async def get_locations():
    locations = [
        {"id": 1, "name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lon": 80.2707, "wards_count": 5},
        {"id": 2, "name": "Delhi", "state": "Delhi NCR", "lat": 28.6139, "lon": 77.2090, "wards_count": 5},
        {"id": 3, "name": "Kochi", "state": "Kerala", "lat": 9.9312, "lon": 76.2673, "wards_count": 4},
        {"id": 4, "name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lon": 73.8567, "wards_count": 4},
    ]
    return APIResponse(
        success=True,
        data=locations,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/grid", response_model=APIResponse)
async def get_grid_cells(
    location_name: str = Query("Chennai"),
    resolution: int = Query(500)
):
    coords = {"Chennai": (13.0827, 80.2707), "Delhi": (28.6139, 77.2090)}.get(location_name, (13.0827, 80.2707))
    cells = demo_provider.fetch_grid_cells(location_name, coords[0], coords[1], resolution)
    return APIResponse(
        success=True,
        data=cells,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
