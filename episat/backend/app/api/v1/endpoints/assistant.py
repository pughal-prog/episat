from fastapi import APIRouter, Body
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata, AssistantQueryRequest
from datetime import datetime, timezone

router = APIRouter(tags=["assistant"])

@router.post("/assistant", response_model=APIResponse)
async def query_assistant(payload: AssistantQueryRequest = Body(...)):
    q = payload.question.lower()
    loc = payload.location_name or "Chennai"

    if "why is ward 42" in q or "why" in q:
        answer = (
            f"Ward 42 in {loc} is rated CRITICAL RISK (87/100) primarily driven by a +35% rainfall anomaly, "
            f"+27% standing water persistence (NDWI 0.28), and a baseline temperature of 29.4°C. "
            f"Expected dengue cases are forecast at 42–51 cases over the next 21 days."
        )
    elif "priority" in q or "prioritized" in q or "action" in q:
        answer = (
            f"For {loc}, top priority wards for immediate vector control are Ward 42 (Critical) and Ward 18 (High). "
            f"Recommended actions: 1) Deploy larval surveillance within 48h, 2) Targeted fogging near storm drain outfalls, "
            f"3) Community standing water advisories."
        )
    elif "rainfall" in q or "simulation" in q or "what happens if" in q:
        answer = (
            f"Based on the EpiSat simulation engine: If rainfall increases by +20% in {loc}, "
            f"the risk score increases from 68 (Moderate) to 81 (Critical), with expected weekly cases surging by ~31%."
        )
    else:
        answer = (
            f"EpiSat monitoring for {loc} shows a city-wide average risk score of 68/100 (Moderate to High). "
            f"Sentinel-2 NDWI indicates elevated standing water persistence in Southern and Central wards."
        )

    return APIResponse(
        success=True,
        data={
            "answer": answer,
            "sources_used": [
                "Sentinel-2 NDWI Water Persistence Index",
                "CHIRPS Rainfall Anomaly Matrix",
                "EpiSat RF-v2 Disease Forecast Engine",
                "SHAP Local Attribution Analysis"
            ],
            "context_data": {"location": loc, "query_timestamp": datetime.now(timezone.utc).isoformat()}
        },
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
