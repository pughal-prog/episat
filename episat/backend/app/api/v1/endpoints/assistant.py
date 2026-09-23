from fastapi import APIRouter, Body
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata, AssistantQueryRequest, AssistantQueryResponse
from datetime import datetime, timezone

router = APIRouter(tags=["assistant"])

# Valid known locations in demo database
KNOWN_LOCATIONS = {
    "chennai": "Chennai",
    "coimbatore": "Coimbatore",
    "mumbai": "Mumbai",
    "delhi": "Delhi",
    "tn": "Tamil Nadu",
    "mh": "Maharashtra",
    "dl": "Delhi UT",
    "ka": "Karnataka",
    "ts": "Telangana",
    "wb": "West Bengal",
    "rj": "Rajasthan"
}

# Persona access control tiers
ROLE_TIERS = {
    "anonymous": 0,
    "citizen": 1,
    "health_officer": 2,
    "analyst": 3,
    "admin": 4
}

MEDICAL_DISCLAIMER = (
    "\n\n⚠️ Disclaimer: This is general public-health information, not medical advice. "
    "If you or someone in your community is experiencing fever or outbreak symptoms, please consult a qualified physician or local health authority immediately."
)

@router.post("/assistant", response_model=APIResponse)
async def query_assistant(payload: AssistantQueryRequest = Body(...)):
    q = payload.question.lower().strip()
    raw_loc = (payload.location_name or "Chennai").strip().lower()
    persona = (payload.persona or "citizen").strip().lower()
    disease = (payload.disease or "dengue").strip().capitalize()
    
    # 1. Location Validation (Strict Non-Hallucination Rule)
    matched_loc = None
    for key, val in KNOWN_LOCATIONS.items():
        if key in raw_loc or raw_loc in key:
            matched_loc = val
            break
            
    if not matched_loc:
        return APIResponse(
            success=True,
            data=AssistantQueryResponse(
                answer=f"The required data is not available for '{payload.location_name}' in the EpiSat vector surveillance database.",
                sources_used=["EpiSat Location Registry"],
                context_data={"location": payload.location_name, "persona": persona, "status": "NO_DATA"},
                action_trigger=None,
                timestamp="Data observation timestamp: unavailable"
            ).model_dump(),
            metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
        )

    loc = matched_loc
    user_tier = ROLE_TIERS.get(persona, 1)

    # 2. Check if topic is supported
    supported_keywords = [
        "dengue", "malaria", "chikungunya", "risk", "cases", "ward", "rainfall", 
        "temp", "vector", "forecast", "water", "drainage", "flood", "action", 
        "priority", "simulation", "why", "report", "stagnant", "prevention", 
        "symptoms", "mae", "xgboost", "random forest", "sentinel", "modis", 
        "freshness", "how it works", "color", "map", "ablation"
    ]
    if not any(kw in q for kw in supported_keywords):
        return APIResponse(
            success=True,
            data=AssistantQueryResponse(
                answer=f"The required data is not available.",
                sources_used=["EpiSat Knowledge Filter"],
                context_data={"location": loc, "persona": persona, "status": "UNSUPPORTED_TOPIC"},
                action_trigger=None,
                timestamp=f"Data observation timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}"
            ).model_dump(),
            metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
        )

    action_trigger = None
    sources = []
    answer = ""

    # 3. Tool Dispatching Logic & Persona RBAC Checks

    # Tool A: Citizen Stagnant Water Report Trigger
    if any(kw in q for kw in ["report", "stagnant water", "puddle", "mosquito breeding", "upload photo"]):
        action_trigger = "OPEN_CITIZEN_REPORT_MODAL"
        answer = (
            f"I have opened the Citizen Stagnant Water Report tool for you! "
            f"Please attach a geotagged photo of the stagnant water site in {loc}. "
            f"Our VGG19 Computer Vision model will automatically analyze breeding risk and notify local vector control officers."
        )
        sources = ["EpiSat Citizen Surveillance API", "PyTorch VGG19 Water Classifier"]

    # Tool B: Model Registry & Performance Metrics (Analyst / Admin Only)
    elif any(kw in q for kw in ["mae", "r2", "r^2", "xgboost", "random forest", "ablation", "model performance"]):
        if user_tier < ROLE_TIERS["analyst"]:
            answer = (
                f"Access Restricted: Model registry metrics, MAE benchmarks, and ablation study outputs "
                f"require Analyst or Admin clearance. Current persona: [{persona.upper()}]."
            )
            sources = ["EpiSat Role-Based Access Control (RBAC) System"]
        else:
            answer = (
                f"EpiSat Model Performance Benchmarks for {disease}:\n"
                f"• Dengue Random Forest (21-Day): MAE = 1.04 cases, R² = 0.810.\n"
                f"• Malaria Random Forest (21-Day): MAE = 2.07 cases, R² = 0.848.\n"
                f"• XGBoost vs RF Comparison: XGBoost yields +4.2% lower MAE in post-monsoon surges.\n"
                f"• Satellite Feature Ablation: Removing Sentinel-2 NDWI increases overall forecast error by +34.2%."
            )
            sources = ["EpiSat Model Registry", "PyTest Temporal Validation Suite", "Ablation Study Matrix"]

    # Tool C: Data Freshness & Pipeline Staleness (Analyst / Admin Only)
    elif any(kw in q for kw in ["how current", "freshness", "staleness", "sentinel", "modis", "last ingestion"]):
        if user_tier < ROLE_TIERS["analyst"]:
            answer = (
                f"Access Restricted: Data pipeline freshness and satellite layer staleness tracking "
                f"require Analyst or Admin clearance. Current persona: [{persona.upper()}]."
            )
            sources = ["EpiSat Role-Based Access Control (RBAC) System"]
        else:
            answer = (
                f"EpiSat Data Layer Freshness Status for {loc}:\n"
                f"• Sentinel-2 MSI (10m NDWI): Updated 3 hours ago (Observation: 2026-08-31).\n"
                f"• CHIRPS / GPM Rainfall (500m): Updated 6 hours ago (Observation: 2026-08-31).\n"
                f"• MODIS Terra LST (1km): NRT LANCE Feed Active (Observation: 2026-08-31).\n"
                f"• PostGIS Spatial Grid Index: 100% Synced (500m x 500m resolution)."
            )
            sources = ["EpiSat Data Quality Endpoint", "NASA Earthdata NRT", "Copernicus Sentinel Hub API"]

    # Tool D: Scenario Simulator / What-If (Health Officer / Admin Only)
    elif any(kw in q for kw in ["what happens if", "increase 20%", "rainfall", "temperature", "simulate", "simulation"]):
        if user_tier < ROLE_TIERS["health_officer"]:
            answer = (
                f"Access Restricted: Scenario simulation and what-if environmental impact recalculations "
                f"require Health Officer or Admin clearance. Current persona: [{persona.upper()}]."
            )
            sources = ["EpiSat Role-Based Access Control (RBAC) System"]
        else:
            action_trigger = "OPEN_SIMULATOR_MODAL"
            answer = (
                f"Based on the EpiSat Scenario Simulator for {loc}:\n"
                f"If rainfall increases by +20% over baseline, the predicted city-wide risk score rises from 68 (Moderate) "
                f"to 81 (Critical Risk), with expected weekly {disease} cases surging by +31.4%.\n"
                f"I have opened the What-If Simulator modal for you to test custom vector control scenarios."
            )
            sources = ["EpiSat Scenario Simulator Module", "HydroSHEDS Catchment Matrix", "RF-v2 Forecast Engine"]

    # Tool E: Ward Explainability & SHAP Drivers (Health Officer / Analyst / Admin Only)
    elif any(kw in q for kw in ["why is ward", "why", "shap", "factor", "increased risk this week"]):
        if user_tier < ROLE_TIERS["health_officer"]:
            answer = (
                f"Access Restricted: Detailed ward-level SHAP factor attributions and raw surveillance telemetry "
                f"require Health Officer or Analyst clearance. Current persona: [{persona.upper()}]."
            )
            sources = ["EpiSat Role-Based Access Control (RBAC) System"]
        else:
            ward = payload.ward_name or "Ward 42"
            answer = (
                f"{ward} in {loc} is rated CRITICAL RISK (87/100) for {disease}.\n"
                f"Primary SHAP attributions:\n"
                f"1. CHIRPS Rainfall Anomaly (+35% above 10-year mean) → +38.2 pts\n"
                f"2. Sentinel-2 NDWI Standing Water Persistence (0.28) → +27.4 pts\n"
                f"3. MODIS Land Surface Temp (29.4°C baseline) → +15.1 pts\n"
                f"Forecast: 42–51 expected cases over the next 21 days."
            )
            sources = ["Sentinel-2 NDWI Water Persistence Index", "CHIRPS Rainfall Matrix", "SHAP Local Attribution Engine"]

    # Tool F: Priority Hotspots & Interventions (Health Officer / Analyst / Admin Only)
    elif any(kw in q for kw in ["priority", "prioritized", "highest risk areas", "hotspot", "action", "intervention"]):
        if user_tier < ROLE_TIERS["health_officer"]:
            answer = (
                f"Access Restricted: Priority ward rankings and operational intervention targets "
                f"require Health Officer or Analyst clearance. Current persona: [{persona.upper()}]."
            )
            sources = ["EpiSat Role-Based Access Control (RBAC) System"]
        else:
            answer = (
                f"EpiSat Vector Control Priority Rankings for {loc} ({disease}):\n"
                f"1. Ward 42 (Critical - 87/100): Immediate larval surveillance within 48h & targeted thermal fogging.\n"
                f"2. Ward 18 (High - 79/100): Drainage desilting & community standing water advisories.\n"
                f"3. Ward 12 (High - 74/100): Anti-larval spraying at identified construction sites."
            )
            sources = ["EpiSat DBSCAN Hotspot Module", "Ward Risk Ranking Table", "Priority Action Engine"]

    # Tool G: Public Guidance & General Prevention (Citizen / All Personas)
    elif any(kw in q for kw in ["prevention", "symptoms", "what is episat", "how it works", "interpret map", "color", "precaution"]):
        answer = (
            f"EpiSat 2.0 is an Earth Observation AI platform that uses satellite radar, rainfall data, and machine learning "
            f"to predict vector-borne disease outbreaks up to 28 days in advance.\n\n"
            f"Key Public Health Guidance for {disease} Prevention:\n"
            f"1. Inspect and empty standing water containers (coolers, pots, tires) at least once a week.\n"
            f"2. Use mosquito repellents and wear light-colored, long-sleeved clothing.\n"
            f"3. Keep water storage barrels tightly covered."
            f"{MEDICAL_DISCLAIMER}"
        )
        sources = ["WHO Vector Control Guidelines", "NVBDCP Public Health Guidance", "EpiSat Public Portal"]

    # Default Fallback: Public Risk Overview (Citizen Safe)
    else:
        answer = (
            f"EpiSat Vector Surveillance Summary for {loc} ({disease}):\n"
            f"The overall city risk index is currently 68/100 (MODERATE TO HIGH RISK).\n"
            f"Sentinel-2 satellite radar shows elevated standing water persistence in low-lying sectors."
        )
        if user_tier <= ROLE_TIERS["citizen"]:
            answer += MEDICAL_DISCLAIMER
        sources = ["Sentinel-2 NDWI Water Persistence Index", "EpiSat RF-v2 Disease Forecast Engine"]

    timestamp_str = f"Data observation timestamp: 2026-08-31 12:00 UTC (Updated 3 hours ago)"

    return APIResponse(
        success=True,
        data=AssistantQueryResponse(
            answer=answer,
            sources_used=sources,
            context_data={
                "location": loc,
                "persona": persona,
                "disease": disease,
                "query_timestamp": datetime.now(timezone.utc).isoformat()
            },
            action_trigger=action_trigger,
            timestamp=timestamp_str
        ).model_dump(),
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
