from fastapi import APIRouter, Query, HTTPException
from typing import Dict, Any, Optional
from app.ml.features.feature_store import generate_grid_timeseries, build_feature_store_df
from app.ml.models.flood_mode import PostFloodRiskEngine

router = APIRouter()
flood_engine = PostFloodRiskEngine()

@router.get("/flood", response_model=Dict[str, Any])
async def get_flood_status(
    location_name: str = Query("Chennai", description="Location name (e.g. Chennai, Delhi)")
):
    """
    Returns Post-Flood Vector Risk Mode status, extreme precipitation alerts,
    and priority flood-impacted grid cells.
    """
    raw_df = generate_grid_timeseries(location_name=location_name, n_weeks=12)
    feat_df = build_feature_store_df(raw_df)
    latest_rows = feat_df.groupby("cell_id").last().reset_index().to_dict(orient="records")

    status = flood_engine.evaluate_flood_status(latest_rows)
    
    return {
        "success": True,
        "data": {
            "location_name": location_name,
            **status
        }
    }
