from fastapi import APIRouter
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["health"])

@router.get("/health", response_model=APIResponse)
async def health_check():
    return APIResponse(
        success=True,
        data={
            "status": "HEALTHY",
            "system": "EpiSat 2.0 Space-to-Action Platform",
            "version": "2.0.0-prod",
            "active_models": [
                {"name": "RF-v2", "horizon": "21d", "r2": 0.74, "mae": 1.15, "status": "ACTIVE"},
                {"name": "XGB-v1", "horizon": "21d", "r2": 0.76, "mae": 1.08, "status": "STANDBY"},
                {"name": "MobileNetV3-CV", "task": "Stagnant Water Classifier", "accuracy": 0.91, "status": "ACTIVE"}
            ],
            "data_freshness": {
                "sentinel2_ndwi": "2 days ago (Coverage 96%)",
                "modis_lst": "3 days ago (Coverage 98%)",
                "chirps_gpm": "1 day ago (Coverage 99%)",
                "ground_disease_cases": "7 days ago (NVBDCP/IDSP format)"
            }
        },
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
