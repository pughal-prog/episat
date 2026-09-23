from fastapi import APIRouter, Depends, Query
from app.geospatial.adapters import DemoDataProvider
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["locations"])

demo_provider = DemoDataProvider()

from app.core.all_india_lgd_locations import get_all_states, get_districts_by_state, get_district_by_id_or_name, ALL_INDIA_DISTRICTS

@router.get("/locations", response_model=APIResponse)
async def get_locations():
    locations = [
        {"id": idx + 1, "name": d["district_name"], "state": d["state_id"], "lat": d["lat"], "lon": d["lon"], "has_demo_data": d.get("has_demo_data", True)}
        for idx, d in enumerate(ALL_INDIA_DISTRICTS) if d.get("has_demo_data", True)
    ]
    return APIResponse(
        success=True,
        data=locations,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/locations/states", response_model=APIResponse)
async def get_states():
    """Returns all 36 Indian States and Union Territories with LGD codes."""
    states = get_all_states()
    return APIResponse(
        success=True,
        data=states,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/locations/districts", response_model=APIResponse)
async def get_districts(
    state_id: str = Query(..., description="State Abbreviation ID (e.g. TN, MH, DL, KA, RJ)")
):
    """Returns all districts for a given state filtered by state_id."""
    districts = get_districts_by_state(state_id)
    return APIResponse(
        success=True,
        data=districts,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

from typing import Optional

@router.get("/grid", response_model=APIResponse)
async def get_grid_cells(
    location_name: str = Query("Chennai"),
    resolution: int = Query(500),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    dist = get_district_by_id_or_name(location_name)
    dist_lat, dist_lon = (dist["lat"], dist["lon"]) if dist else (13.0827, 80.2707)
    target_lat = lat if lat is not None else dist_lat
    target_lon = lon if lon is not None else dist_lon

    cells = demo_provider.fetch_grid_cells(location_name, target_lat, target_lon, resolution)
    return APIResponse(
        success=True,
        data=cells,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/wards", response_model=APIResponse)
async def get_ward_boundaries(
    location_name: str = Query("Chennai"),
    lat: Optional[float] = Query(None),
    lon: Optional[float] = Query(None)
):
    """Returns distinct GeoJSON polygon boundaries for administrative wards in the selected district."""
    dist = get_district_by_id_or_name(location_name)
    dist_lat, dist_lon = (dist["lat"], dist["lon"]) if dist else (13.0827, 80.2707)
    target_lat = lat if lat is not None else dist_lat
    target_lon = lon if lon is not None else dist_lon

    wards = demo_provider.fetch_ward_boundaries(location_name, target_lat, target_lon)
    return APIResponse(
        success=True,
        data=wards,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

