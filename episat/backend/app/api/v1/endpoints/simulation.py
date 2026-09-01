from fastapi import APIRouter, Body
from app.ml.models.simulator import ScenarioSimulatorEngine
from app.schemas.pydantic_schemas import APIResponse, ResponseMetadata, SimulationRequest
from datetime import datetime, timezone

router = APIRouter(tags=["simulation"])

simulator = ScenarioSimulatorEngine()

@router.post("/simulation", response_model=APIResponse)
async def run_simulation(payload: SimulationRequest = Body(...)):
    res = simulator.run_simulation(
        location_name=payload.location_name,
        rainfall_change_pct=payload.rainfall_change_pct,
        temperature_change_c=payload.temperature_change_c,
        water_persistence_change_pct=payload.water_persistence_change_pct,
        bsi_reduction_pct=payload.bsi_reduction_pct
    )

    return APIResponse(
        success=True,
        data=res,
        metadata=ResponseMetadata(timestamp=datetime.now(timezone.utc).isoformat())
    )
