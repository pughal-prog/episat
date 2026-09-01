from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    email: str
    password: str
    full_name: str
    role: Optional[str] = "health_officer"

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Response Metadata standard (Requirement #43)
class ResponseMetadata(BaseModel):
    timestamp: str
    model_version: str = "RF-v2"
    data_source: str = "demo"
    confidence: float = 0.85
    disclaimer: str = "DEMO DATA — NOT FOR REAL-WORLD PUBLIC-HEALTH DECISIONS"

class APIResponse(BaseModel):
    success: bool = True
    data: Any
    metadata: Optional[ResponseMetadata] = None
    error: Optional[Dict[str, Any]] = None

# Grid & Location Schemas
class GridCellResponse(BaseModel):
    id: str
    location_name: str
    ward_name: Optional[str] = None
    center_lat: float
    center_lon: float
    resolution_meters: int = 500
    geometry_geojson: Dict[str, Any]

# Anomaly & BSI Schemas
class AnomalyScoreResponse(BaseModel):
    cell_id: str
    location_name: str
    anomaly_score: float
    category: str
    drivers: Dict[str, float]
    z_scores: Dict[str, float]

class BSIScoreResponse(BaseModel):
    cell_id: str
    location_name: str
    bsi_score: float
    risk_level: str
    explanation: str

# Risk & Forecast Schemas
class ForecastResponse(BaseModel):
    cell_id: str
    location_name: str
    ward_name: Optional[str] = None
    forecast_horizon_days: int
    predicted_cases: float
    lower_bound: float
    upper_bound: float
    risk_probability: float
    confidence: float

class RiskScoreResponse(BaseModel):
    cell_id: str
    location_name: str
    ward_name: Optional[str] = None
    center_lat: float
    center_lon: float
    episat_risk_score: float
    risk_level: str
    bsi_score: float
    anomaly_score: float
    forecast_cases: float
    primary_drivers: Dict[str, float]

# Hotspot Schema
class HotspotResponse(BaseModel):
    id: str
    location_name: str
    ward_name: str
    center_lat: float
    center_lon: float
    horizon_days: int
    risk_score: float
    bsi_score: float
    anomaly_score: float
    expected_cases: float
    confidence: float
    primary_drivers: Dict[str, float]
    recommended_intervention: str
    geometry_geojson: Dict[str, Any]

# Explainability Schema
class ExplainabilityResponse(BaseModel):
    cell_id: str
    location_name: str
    ward_name: Optional[str] = None
    risk_score: float
    risk_level: str
    shap_contributions: Dict[str, float]
    contributing_factors: List[Dict[str, Any]]
    confidence: float
    model_version: str

# Intervention Schema
class InterventionResponse(BaseModel):
    id: int
    location_name: str
    ward_name: str
    priority: str
    action: str
    reason: str
    target_area: str
    status: str
    suggested_timeline: str

class InterventionUpdate(BaseModel):
    status: str

# Simulation Schema
class SimulationRequest(BaseModel):
    location_name: str = "Chennai"
    rainfall_change_pct: float = 0.0 # e.g. +20.0
    temperature_change_c: float = 0.0 # e.g. +1.0
    water_persistence_change_pct: float = 0.0
    bsi_reduction_pct: float = 0.0 # vector control effectiveness

class SimulationResponse(BaseModel):
    location_name: str
    baseline_risk_score: float
    simulated_risk_score: float
    risk_score_delta: float
    baseline_cases: float
    simulated_cases: float
    drivers: Dict[str, Any]
    disclaimer: str = "SIMULATION / SCENARIO ESTIMATE — NOT A GUARANTEED REAL-WORLD OUTCOME."

# Citizen Report & CV Schema
class CitizenReportCreate(BaseModel):
    latitude: float
    longitude: float
    description: Optional[str] = ""
    contact: Optional[str] = ""

class CVClassificationResponse(BaseModel):
    standing_water_probability: float
    potential_breeding_site_level: str
    confidence: float
    detected_objects: List[str]

# Assistant Q&A Schema
class AssistantQueryRequest(BaseModel):
    question: str
    location_name: Optional[str] = "Chennai"
    ward_name: Optional[str] = None

class AssistantQueryResponse(BaseModel):
    answer: str
    sources_used: List[str]
    context_data: Dict[str, Any]
