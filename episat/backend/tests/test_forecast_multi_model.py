import pytest
from pathlib import Path
from app.ml.models.forecast_engine import DiseaseForecastEngine
from app.core.config import settings

def test_multi_horizon_prediction():
    engine = DiseaseForecastEngine()
    row = {
        "lst_celsius": 28.5,
        "rainfall_mm": 25.0,
        "ndwi_index": 0.2,
        "humidity_pct": 65.0,
        "population_proxy": 15000.0,
        "cases_lag1": 5.0,
        "cases_lag4": 4.0,
        "cases_roll4": 4.5
    }

    for horizon in [7, 14, 21, 28]:
        res = engine.predict_horizon(row, horizon_days=horizon)
        assert res["forecast_horizon_days"] == horizon
        assert res["predicted_cases"] >= 0.0
        assert res["lower_bound"] <= res["predicted_cases"] <= res["upper_bound"]
        assert 0.65 <= res["confidence"] <= 0.98

def test_backtest_plot_artifacts():
    storage = settings.MODEL_STORAGE_PATH
    assert (storage / "backtest_predicted_vs_actual_7d.png").exists()
    assert (storage / "backtest_predicted_vs_actual_14d.png").exists()
    assert (storage / "backtest_predicted_vs_actual_21d.png").exists()
    assert (storage / "backtest_predicted_vs_actual_28d.png").exists()
    assert (storage / "backtest_predicted_vs_actual.png").exists()
