from fastapi import APIRouter, File, UploadFile, Form, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.ml.models.cv_water_detector import StagnantWaterCVClassifier
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone

router = APIRouter(tags=["citizen-reports"])

cv_classifier = StagnantWaterCVClassifier()

@router.post("/citizen-reports", response_model=APIResponse)
async def submit_citizen_report(
    latitude: float = Form(...),
    longitude: float = Form(...),
    description: str = Form("Stagnant water near drain outfall"),
    image: UploadFile = File(None),
    db: AsyncSession = Depends(get_db)
):
    cv_res = cv_classifier.classify_image() if image else {
        "standing_water_probability": 0.85,
        "potential_breeding_site_level": "HIGH",
        "confidence": 0.82,
        "detected_objects": ["Reported Stagnant Pool"]
    }

    report = {
        "id": 101,
        "latitude": latitude,
        "longitude": longitude,
        "description": description,
        "status": "Pending Verification",
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "computer_vision": cv_res,
        "satellite_ground_fusion": {
            "satellite_water_anomaly": "HIGH",
            "citizen_ground_evidence": "HIGH",
            "fused_priority": "CRITICAL"
        }
    }

    return APIResponse(
        success=True,
        data=report,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/citizen-reports", response_model=APIResponse)
async def list_citizen_reports():
    reports = [
        {
            "id": 101,
            "latitude": 13.085,
            "longitude": 80.272,
            "location_name": "Chennai",
            "ward_name": "Ward 42",
            "description": "Large pool of standing rainwater stagnant for >10 days",
            "cv_standing_water_prob": 0.91,
            "cv_breeding_site_level": "HIGH",
            "status": "Verified",
            "submitted_at": "2026-08-30T10:15:00Z"
        },
        {
            "id": 102,
            "latitude": 13.080,
            "longitude": 80.268,
            "location_name": "Chennai",
            "ward_name": "Ward 18",
            "description": "Blocked storm drain accumulating water near construction zone",
            "cv_standing_water_prob": 0.84,
            "cv_breeding_site_level": "HIGH",
            "status": "Pending",
            "submitted_at": "2026-08-31T08:20:00Z"
        }
    ]
    return APIResponse(
        success=True,
        data=reports,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
