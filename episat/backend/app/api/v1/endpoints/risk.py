from fastapi import APIRouter, Query
from app.geospatial.adapters import DemoDataProvider
from app.ml.features.feature_store import generate_grid_timeseries, build_feature_store_df
from app.ml.models.anomaly_engine import EnvironmentalAnomalyEngine
from app.ml.models.bsi_model import MosquitoBreedingSuitabilityModel
from app.ml.models.forecast_engine import DiseaseForecastEngine
from app.ml.models.risk_fusion import RiskFusionEngine
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["risk"])

anomaly_engine = EnvironmentalAnomalyEngine()
bsi_model = MosquitoBreedingSuitabilityModel()
forecast_engine = DiseaseForecastEngine()
fusion_engine = RiskFusionEngine()
demo_provider = DemoDataProvider()

@router.get("/risk", response_model=APIResponse)
async def get_risk_snapshot(
    location_name: str = Query("Chennai"),
    horizon_days: int = Query(21),
    flood_mode: bool = Query(False)
):
    df_raw = generate_grid_timeseries(location_name=location_name, n_weeks=52)
    df_feat = build_feature_store_df(df_raw)
    
    latest_per_cell = df_feat.groupby("cell_id").tail(1).to_dict("records")
    coords = {"Chennai": (13.0827, 80.2707), "Delhi": (28.6139, 77.2090)}.get(location_name, (13.0827, 80.2707))
    grid_cells = demo_provider.fetch_grid_cells(location_name, coords[0], coords[1])
    cell_map = {c["id"]: c for c in grid_cells}

    results = []
    for row in latest_per_cell:
        c_id = row["cell_id"]
        geom_info = cell_map.get(c_id, {"center_lat": coords[0], "center_lon": coords[1], "ward_name": "Ward 42"})

        anomaly_res = anomaly_engine.calculate_score(row)
        bsi_res = bsi_model.calculate_bsi(row)
        fc_res = forecast_engine.predict_horizon(row, horizon_days=horizon_days)

        fused = fusion_engine.fuse_risk(
            anomaly_score=anomaly_res["anomaly_score"],
            bsi_score=bsi_res["bsi_score"],
            forecast_cases=fc_res["predicted_cases"],
            flood_event=flood_mode
        )

        results.append({
            "cell_id": c_id,
            "location_name": location_name,
            "ward_name": geom_info.get("ward_name", "Ward 42"),
            "center_lat": geom_info["center_lat"],
            "center_lon": geom_info["center_lon"],
            "episat_risk_score": fused["episat_risk_score"],
            "risk_level": fused["risk_level"],
            "bsi_score": bsi_res["bsi_score"],
            "anomaly_score": anomaly_res["anomaly_score"],
            "forecast_cases": fc_res["predicted_cases"],
            "primary_drivers": {
                "Rainfall anomaly": 35,
                "Water persistence": 27,
                "LST": 18,
                "Historical cases": 20
            }
        })

    return APIResponse(
        success=True,
        data=results,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
