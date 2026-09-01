"""
EpiSat 2.0 - Pluggable Multi-Disease Profile Registry
=====================================================
Defines vector ecology, incubation lag, temperature sensitivity, and dataset parameters
for vector-borne and climate-linked health hazards (Master Prompt Section 2.1).
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class DiseaseProfile(BaseModel):
    id: str
    name: str
    vector: str
    vector_category: str # mosquito, sandfly, waterborne, climate
    breeding_water_preference: str
    incubation_lag_weeks: List[int]
    temperature_sensitivity: str # high, moderate, low
    relevant_features: List[str]
    case_data_source: str
    forecast_model_id: str
    status: str # active, config_only, restricted_data

DISEASE_PROFILES: Dict[str, DiseaseProfile] = {
    "dengue": DiseaseProfile(
        id="dengue",
        name="Dengue Fever",
        vector="Aedes aegypti / Aedes albopictus",
        vector_category="mosquito",
        breeding_water_preference="small containers, artificial stagnant urban water",
        incubation_lag_weeks=[3, 4, 5],
        temperature_sensitivity="moderate",
        relevant_features=["lst_celsius", "rainfall_mm", "ndwi_index", "humidity_pct"],
        case_data_source="epiclim_dengue",
        forecast_model_id="dengue_rf_v1",
        status="active"
    ),
    "malaria": DiseaseProfile(
        id="malaria",
        name="Malaria (Plasmodium falciparum / vivax)",
        vector="Anopheles stephensi / culicifacies",
        vector_category="mosquito",
        breeding_water_preference="clean, slow-moving, semi-permanent water bodies, ground pools",
        incubation_lag_weeks=[1, 2, 3], # Faster parasite extrinsic incubation response to thermal shifts
        temperature_sensitivity="high",
        relevant_features=["lst_celsius", "rainfall_mm", "ndwi_index", "humidity_pct", "elevation_m"],
        case_data_source="ncvbdc_epiclim_malaria",
        forecast_model_id="malaria_rf_v1",
        status="active"
    ),
    "chikungunya": DiseaseProfile(
        id="chikungunya",
        name="Chikungunya Virus",
        vector="Aedes aegypti / Aedes albopictus",
        vector_category="mosquito",
        breeding_water_preference="stagnant domestic & peri-domestic water containers",
        incubation_lag_weeks=[2, 3, 4],
        temperature_sensitivity="moderate",
        relevant_features=["lst_celsius", "rainfall_mm", "ndwi_index", "humidity_pct"],
        case_data_source="ncvbdc_chikungunya",
        forecast_model_id="chikungunya_rf_v1",
        status="config_only"
    ),
    "japanese_encephalitis": DiseaseProfile(
        id="japanese_encephalitis",
        name="Japanese Encephalitis (JE)",
        vector="Culex tritaeniorhynchus",
        vector_category="mosquito",
        breeding_water_preference="flooded rice paddies, agricultural irrigation canals",
        incubation_lag_weeks=[2, 4, 6],
        temperature_sensitivity="high",
        relevant_features=["lst_celsius", "rainfall_mm", "ndvi_index", "paddy_coverage"],
        case_data_source="ncvbdc_je_aes",
        forecast_model_id="je_rf_v1",
        status="config_only"
    ),
    "kala_azar": DiseaseProfile(
        id="kala_azar",
        name="Kala-azar (Visceral Leishmaniasis)",
        vector="Phlebotomus argentipes (Sandfly)",
        vector_category="sandfly",
        breeding_water_preference="high soil moisture, mud-plastered housing, cattle sheds",
        incubation_lag_weeks=[4, 8, 12],
        temperature_sensitivity="high",
        relevant_features=["humidity_pct", "soil_moisture", "mud_housing_proxy"],
        case_data_source="kamis_nvbdcp_restricted",
        forecast_model_id="kala_azar_rf_v1",
        status="restricted_data"
    ),
    "cholera": DiseaseProfile(
        id="cholera",
        name="Cholera / Waterborne Diarrhoeal Disease",
        vector="Vibrio cholerae (Waterborne)",
        vector_category="waterborne",
        breeding_water_preference="flooded drainage contamination, un-chlorinated water sources",
        incubation_lag_weeks=[1, 2],
        temperature_sensitivity="moderate",
        relevant_features=["rainfall_mm", "flood_extent", "water_contamination_proxy"],
        case_data_source="epiclim_diarrhoeal",
        forecast_model_id="cholera_rule_v1",
        status="config_only"
    )
}

def get_disease_profile(disease_id: str) -> DiseaseProfile:
    """Returns disease profile object defaulting to dengue for backward compatibility."""
    return DISEASE_PROFILES.get(disease_id.lower(), DISEASE_PROFILES["dengue"])
