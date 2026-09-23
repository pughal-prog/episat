import pytest
from app.ml.models.spread_engine import DiseaseSpreadEngine

def test_spread_neighboring_districts_ranking():
    """
    Part 3.1 Test: Validates neighboring district spatial distance weighting and spread risk ranking.
    """
    engine = DiseaseSpreadEngine()
    result = engine.calculate_district_spread("Chennai", current_risk_score=75.0, previous_risk_score=60.0)
    
    assert result["data_available"] is True
    neighbors = result["neighboring_districts_at_risk"]
    assert len(neighbors) >= 2

    # Check ranking (first neighbor has highest predicted spread risk)
    for i in range(len(neighbors) - 1):
        assert neighbors[i]["predicted_spread_risk"] >= neighbors[i+1]["predicted_spread_risk"]

    # Verify disclaimer is attached
    assert "heuristic" in result["disclaimer"].lower()
