from fastapi import APIRouter, Query
from app.ml.features.feature_store import generate_grid_timeseries, build_feature_store_df
from app.ml.models.forecast_engine import DiseaseForecastEngine
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["forecast"])
forecast_engine = DiseaseForecastEngine()

@router.get("/forecast", response_model=APIResponse)
async def get_forecast(
    location_name: str = Query("Chennai"),
    horizon_days: int = Query(21),
    disease: str = Query("dengue", description="Disease ID (dengue, malaria, chikungunya, etc.)")
):
    df_raw = generate_grid_timeseries(location_name=location_name, n_weeks=52)
    df_feat = build_feature_store_df(df_raw)
    latest_row = df_feat.iloc[-1].to_dict()

    fc = forecast_engine.predict_horizon(latest_row, horizon_days=horizon_days, disease=disease)

    res = {
        "cell_id": latest_row["cell_id"],
        "location_name": location_name,
        "ward_name": "Ward 42",
        "disease": fc["disease"],
        "disease_name": fc["disease_name"],
        "vector": fc["vector"],
        "forecast_horizon_days": horizon_days,
        "predicted_cases": fc["predicted_cases"],
        "lower_bound": fc["lower_bound"],
        "upper_bound": fc["upper_bound"],
        "risk_probability": round(min(0.98, max(0.20, fc["predicted_cases"] / 30.0)), 2),
        "confidence": fc["confidence"],
        "model_version": fc["model_version"]
    }

    return APIResponse(
        success=True,
        data=res,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
