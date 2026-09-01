import pytest
from app.ml.models.explainability import ExplainableAIEngine

def test_explainable_ai_engine():
    engine = ExplainableAIEngine()
    row = {
        "cell_id": "CELL_CHENNAI_001",
        "location_name": "Chennai",
        "ward_name": "Ward 18",
        "rainfall_mm_zscore": 2.1,
        "ndwi_index": 0.32,
        "cases_lag1": 15.0,
        "lst_celsius": 29.5,
        "humidity_pct": 70.0,
        "episat_risk_score": 82.4,
        "risk_level": "Critical"
    }

    res = engine.explain_cell_prediction("CELL_CHENNAI_001", row)
    
    assert res["cell_id"] == "CELL_CHENNAI_001"
    assert "shap_contributions" in res
    assert "contributing_factors" in res
    assert len(res["contributing_factors"]) > 0

    # Verify 100% sum of SHAP percentages
    total_pct = sum(res["shap_contributions"].values())
    assert 99.0 <= total_pct <= 101.0

    # Verify non-causal language rule compliance (no 'cause' in output keys or terms)
    for factor in res["contributing_factors"]:
        assert "cause" not in factor["factor"].lower()
        assert "cause" not in factor["relationship"].lower()
        assert factor["impact"] in ["High", "Moderate", "Low"]

    assert "causation" in res["scientific_disclaimer"].lower() or "association" in res["scientific_disclaimer"].lower()
