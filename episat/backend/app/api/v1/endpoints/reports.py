from fastapi import APIRouter, Response, Query
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata
from datetime import datetime, timezone
import io
import csv

router = APIRouter(tags=["reports"])

@router.get("/reports/summary", response_model=APIResponse)
async def get_report_summary(location_name: str = Query("Chennai")):
    summary = {
        "location_name": location_name,
        "report_date": datetime.now(timezone.utc).isoformat(),
        "overall_status": "ELEVATED RISK WARNING",
        "key_findings": [
            "Hyperlocal 500m grid cell analysis shows 2 critical hotspot zones in Ward 42 and Ward 18.",
            "Breeding Suitability Index (BSI) elevated (78.5/100) due to post-monsoon standing water.",
            "21-day dengue case forecast estimates 42 (+/- 5) cases if unmitigated."
        ],
        "top_contributing_factors": [
            {"factor": "Standing Water Index (NDWI)", "weight_pct": 35.0},
            {"factor": "Rainfall Anomaly", "weight_pct": 27.0},
            {"factor": "Land Surface Temp (29.4°C)", "weight_pct": 18.0}
        ],
        "recommended_priority_actions": [
            "Focal anti-larval treatment in Ward 42 high-density sectors within 48h.",
            "Deploy targeted fogging in construction zones with water accumulation.",
            "Issue community advisories regarding container breeding removal."
        ],
        "disclaimer": "DEMO DATA — NOT FOR REAL-WORLD PUBLIC-HEALTH DECISIONS"
    }

    return APIResponse(
        success=True,
        data=summary,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )

@router.get("/reports/csv")
async def export_csv_report(location_name: str = Query("Chennai")):
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Location", "Ward", "Risk Score", "Risk Level", "Breeding Suitability", "Forecast Cases (21d)", "Top Driver"])
    writer.writerow([location_name, "Ward 42", 87.0, "Critical", 82.0, 42, "Rainfall Anomaly (+35%)"])
    writer.writerow([location_name, "Ward 18", 78.0, "High", 75.0, 31, "Water Persistence (+27%)"])
    writer.writerow([location_name, "Ward 24", 54.0, "Moderate", 58.0, 18, "LST Temperature (29.4°C)"])
    writer.writerow([location_name, "Ward 35", 38.0, "Low", 41.0, 9, "Baseline Trend"])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=EpiSat_Risk_Report_{location_name}.csv"}
    )
