from fastapi import APIRouter, Query, Body
from app.ml.models.interventions import InterventionRecommendationEngine
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata, InterventionUpdate
from datetime import datetime, timezone

router = APIRouter(tags=["interventions"])

intervention_engine = InterventionRecommendationEngine()

@router.get("/interventions", response_model=APIResponse)
async def get_interventions(
    location_name: str = Query("Chennai"),
    ward_name: str = Query("Ward 42"),
    risk_level: str = Query("Critical")
):
    actions = intervention_engine.generate_recommendations(
        location_name=location_name,
        ward_name=ward_name,
        risk_level=risk_level,
        bsi_score=82.0,
        forecast_cases=42.0
    )

    return APIResponse(
        success=True,
        data=actions,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.patch("/interventions/{intervention_id}", response_model=APIResponse)
async def update_intervention_status(
    intervention_id: int,
    payload: InterventionUpdate = Body(...)
):
    return APIResponse(
        success=True,
        data={"id": intervention_id, "status": payload.status, "updated_at": datetime.now(timezone.utc).isoformat()},
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
