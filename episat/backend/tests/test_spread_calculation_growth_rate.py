import pytest
from app.ml.models.spread_engine import DiseaseSpreadEngine

def test_spread_calculation_growth_rate():
    """
    Part 3.1 Test: Unit test validating week-over-week risk growth rate formula: (current - prev) / prev
    """
    engine = DiseaseSpreadEngine()
    
    # Case 1: Surging Growth (68.5 from 58.0) -> +18.1%
    result1 = engine.calculate_district_spread("Chennai", current_risk_score=68.5, previous_risk_score=58.0)
    assert result1["data_available"] is True
    assert result1["week_over_week_growth_pct"] == 18.1
    assert result1["growth_trend_direction"] == "SURGING"
    assert result1["trend_badge"] == "CRITICAL_GROWTH"

    # Case 2: Plateau Growth (60.0 from 59.0) -> +1.7%
    result2 = engine.calculate_district_spread("Chennai", current_risk_score=60.0, previous_risk_score=59.0)
    assert result2["week_over_week_growth_pct"] == 1.7
    assert result2["growth_trend_direction"] == "STABLE"

    # Case 3: Declining Growth (40.0 from 50.0) -> -20.0%
    result3 = engine.calculate_district_spread("Chennai", current_risk_score=40.0, previous_risk_score=50.0)
    assert result3["week_over_week_growth_pct"] == -20.0
    assert result3["growth_trend_direction"] == "DECREASING"
