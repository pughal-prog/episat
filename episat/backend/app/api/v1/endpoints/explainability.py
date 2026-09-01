from fastapi import APIRouter, Query
from app.ml.models.explainability import ExplainableAIEngine
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["explainability"])

xai_engine = ExplainableAIEngine()

@router.get("/explainability", response_model=APIResponse)
async def get_explainability(
    cell_id: str = Query("CELL_CHENNAI_001"),
    location_name: str = Query("Chennai")
):
    row = {
        "cell_id": cell_id,
        "location_name": location_name,
        "ward_name": "Ward 42",
        "episat_risk_score": 87.0,
        "risk_level": "Critical",
        "rainfall_mm_zscore": 1.85,
        "ndwi_index": 0.28,
        "cases_lag1": 24,
        "lst_celsius": 29.4,
        "humidity_pct": 68.0
    }
    explanation = xai_engine.explain_cell_prediction(cell_id, row)

    return APIResponse(
        success=True,
        data=explanation,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
