from fastapi import APIRouter, Query
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from app.ml.models.spread_engine import DiseaseSpreadEngine
from datetime import datetime, timezone

router = APIRouter(tags=["spread"])

@router.get("/spread", response_model=APIResponse)
async def get_district_disease_spread(
    district: str = Query("Chennai", description="District ID or Name (e.g. TN-CHE, Chennai, Mumbai Suburban, Delhi Central)")
):
    """
    Returns week-over-week risk growth rate % and spatial neighbor spread propagation risk.
    """
    engine = DiseaseSpreadEngine()
    spread_data = engine.calculate_district_spread(
        district_name_or_id=district,
        current_risk_score=68.5,
        previous_risk_score=58.0
    )

    return APIResponse(
        success=True,
        data=spread_data,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
