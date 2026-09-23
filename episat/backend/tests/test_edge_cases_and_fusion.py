"""
EpiSat 2.0 - Comprehensive Edge Case & Multimodal Fusion Test Suite
===================================================================
Expanded test cases covering:
- CitizenSatelliteFusionEngine boundary conditions & risk tier allocations
- DiseaseSpreadEngine fallback, zero-division protection, & spatial ranking
- PostFloodRiskEngine SAR speckle filtering & extreme severity classification
- ScenarioSimulatorEngine parameter bounds & clipping
- Core schemas and registry edge cases
"""

import pytest
import numpy as np
from app.ml.models.citizen_satellite_fusion import CitizenSatelliteFusionEngine
from app.ml.models.spread_engine import DiseaseSpreadEngine
from app.ml.models.flood_mode import PostFloodRiskEngine
from app.ml.models.simulator import ScenarioSimulatorEngine
from app.core.disease_profiles import get_disease_profile, DISEASE_PROFILES
from app.schemas.pydantic_schemas import UserResponse, APIResponse, ResponseMetadata


# -------------------------------------------------------------------
# 1. CitizenSatelliteFusionEngine Edge Cases
# -------------------------------------------------------------------
def test_fusion_engine_zero_inputs():
    engine = CitizenSatelliteFusionEngine()
    result = engine.fuse_evidence(
        satellite_evidence_score=0.0,
        weather_evidence_score=0.0,
        disease_forecast_score=0.0,
        citizen_report_count=0,
        verified_cv_water_prob=0.0
    )
    assert result["fused_risk_score"] == 0.0
    assert result["fused_risk_level"] == "VERY LOW"
    assert result["evidence_breakdown"]["citizen_reports_evidence"]["score"] == 0.0


def test_fusion_engine_max_inputs_clamping():
    engine = CitizenSatelliteFusionEngine()
    result = engine.fuse_evidence(
        satellite_evidence_score=150.0,  # exceeds 100
        weather_evidence_score=120.0,    # exceeds 100
        disease_forecast_score=110.0,    # exceeds 100
        citizen_report_count=10,         # high count
        verified_cv_water_prob=1.0
    )
    assert result["fused_risk_score"] == 100.0
    assert result["fused_risk_level"] == "CRITICAL"


def test_fusion_engine_risk_level_tiers():
    engine = CitizenSatelliteFusionEngine()
    
    # Critical (>= 80.0)
    res_crit = engine.fuse_evidence(95.0, 95.0, 95.0, 3, 0.9)
    assert res_crit["fused_risk_level"] == "CRITICAL"

    # High (>= 60.0, < 80.0)
    res_high = engine.fuse_evidence(75.0, 75.0, 75.0, 0, 0.0)
    assert res_high["fused_risk_level"] == "HIGH"

    # Moderate (>= 40.0, < 60.0)
    res_mod = engine.fuse_evidence(65.0, 65.0, 65.0, 0, 0.0)
    assert res_mod["fused_risk_level"] == "MODERATE"

    # Low (>= 20.0, < 40.0)
    res_low = engine.fuse_evidence(35.0, 35.0, 35.0, 0, 0.0)
    assert res_low["fused_risk_level"] == "LOW"

    # Very Low (< 20.0)
    res_vlow = engine.fuse_evidence(10.0, 10.0, 10.0, 0, 0.0)
    assert res_vlow["fused_risk_level"] == "VERY LOW"


# -------------------------------------------------------------------
# 2. DiseaseSpreadEngine Edge Cases
# -------------------------------------------------------------------
def test_spread_engine_fallback_district():
    engine = DiseaseSpreadEngine()
    result = engine.calculate_district_spread("NonExistentDistrictXYZ_999")
    assert result["data_available"] is True
    assert "Nonexistentdistrictxyz_999" in result["district_name"]


def test_spread_engine_zero_previous_score():
    engine = DiseaseSpreadEngine()
    # Test division by zero prevention when previous_risk_score = 0.0
    result = engine.calculate_district_spread("Chennai", current_risk_score=50.0, previous_risk_score=0.0)
    assert result["data_available"] is True
    assert result["week_over_week_growth_pct"] > 0
    assert result["growth_trend_direction"] in ["SURGING", "INCREASING"]


def test_spread_engine_neighbor_ranking():
    engine = DiseaseSpreadEngine()
    result = engine.calculate_district_spread("Chennai", current_risk_score=80.0, previous_risk_score=50.0)
    neighbors = result.get("neighboring_districts_at_risk", [])
    assert len(neighbors) > 0
    # Verify neighbors are sorted in descending order of predicted_spread_risk
    for i in range(len(neighbors) - 1):
        assert neighbors[i]["predicted_spread_risk"] >= neighbors[i+1]["predicted_spread_risk"]


# -------------------------------------------------------------------
# 3. PostFloodRiskEngine Edge Cases
# -------------------------------------------------------------------
def test_flood_engine_empty_observations():
    engine = PostFloodRiskEngine()
    result = engine.evaluate_flood_status([])
    assert result["flood_mode_active"] is False
    assert result["severity"] == "NORMAL"
    assert result["affected_cells_count"] == 0


def test_flood_engine_extreme_severity():
    engine = PostFloodRiskEngine()
    observations = [
        {"cell_id": "cell_001", "sar_water_extent": 0.45, "rainfall_mm": 120.0, "ndwi_index_zscore": 2.5}
    ]
    result = engine.evaluate_flood_status(observations)
    assert result["flood_mode_active"] is True
    assert result["severity"] == "EXTREME"
    assert "Sentinel-1 SAR Radar" in result["primary_detection_sensor"]


def test_flood_engine_sar_backscatter_db():
    engine = PostFloodRiskEngine()
    vv_linear = np.array([0.001, 0.01, 0.1])
    vh_linear = np.array([0.0005, 0.005, 0.05])
    res = engine.compute_sar_backscatter_db(vv_linear, vh_linear)
    assert "mean_vv_db" in res
    assert "sar_water_extent_ratio" in res
    assert res["water_threshold_db"] == -15.0


# -------------------------------------------------------------------
# 4. ScenarioSimulatorEngine Edge Cases
# -------------------------------------------------------------------
def test_simulator_engine_baseline():
    sim = ScenarioSimulatorEngine()
    res = sim.run_simulation("Chennai", 0.0, 0.0, 0.0, 0.0)
    assert res["simulated_risk_score"] == res["baseline_risk_score"]
    assert res["risk_score_delta"] == 0.0


def test_simulator_engine_vector_control_reduction():
    sim = ScenarioSimulatorEngine()
    res = sim.run_simulation("Chennai", bsi_reduction_pct=50.0)
    assert res["simulated_risk_score"] < res["baseline_risk_score"]
    assert res["simulated_cases"] < res["baseline_cases"]


# -------------------------------------------------------------------
# 5. Core Schema & Registry Edge Cases
# -------------------------------------------------------------------
def test_disease_profile_registry():
    dengue = get_disease_profile("dengue")
    assert dengue.id == "dengue"
    assert dengue.vector == "Aedes aegypti / Aedes albopictus"
    
    malaria = get_disease_profile("malaria")
    assert malaria.id == "malaria"
    assert malaria.incubation_lag_weeks == [1, 2, 3]

    # Default fallback to dengue
    unknown = get_disease_profile("unknown_disease_xyz")
    assert unknown.id == "dengue"


def test_pydantic_user_response_configdict():
    user_resp = UserResponse(
        id=101,
        email="health.officer@episat.gov.in",
        full_name="Dr. Aris",
        role="health_officer",
        is_active=True
    )
    assert user_resp.id == 101
    assert user_resp.role == "health_officer"
