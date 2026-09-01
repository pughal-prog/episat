import pytest
import pandas as pd
from app.ml.features.feature_store import generate_grid_timeseries, build_feature_store_df
from app.ml.models.anomaly_engine import EnvironmentalAnomalyEngine
from app.ml.models.bsi_model import MosquitoBreedingSuitabilityModel
from app.ml.models.forecast_engine import DiseaseForecastEngine
from app.ml.models.risk_fusion import RiskFusionEngine
from app.ml.models.explainability import ExplainableAIEngine

def test_feature_store():
    df_raw = generate_grid_timeseries("Chennai", n_weeks=52)
    assert len(df_raw) > 0
    df_feat = build_feature_store_df(df_raw)
    assert "rainfall_mm_zscore" in df_feat.columns
    assert "lst_lag2" in df_feat.columns

def test_anomaly_engine():
    engine = EnvironmentalAnomalyEngine()
    row = {"rainfall_mm_zscore": 1.5, "ndwi_index_zscore": 1.2, "lst_celsius_zscore": 0.8}
    res = engine.calculate_score(row)
    assert 0 <= res["anomaly_score"] <= 100
    assert "category" in res

def test_bsi_model():
    model = MosquitoBreedingSuitabilityModel()
    row = {"ndwi_index": 0.25, "rainfall_mm": 45.0, "lst_celsius": 28.0, "humidity_pct": 70.0}
    res = model.calculate_bsi(row)
    assert 0 <= res["bsi_score"] <= 100
    assert res["risk_level"] in ["Very Low", "Low", "Moderate", "High", "Very High"]

def test_risk_fusion():
    fusion = RiskFusionEngine()
    res = fusion.fuse_risk(anomaly_score=70.0, bsi_score=80.0, forecast_cases=40.0)
    assert 0 <= res["episat_risk_score"] <= 100
    assert res["risk_level"] in ["Very Low", "Low", "Moderate", "High", "Critical"]

def test_explainability():
    xai = ExplainableAIEngine()
    row = {"cell_id": "CELL_001", "rainfall_mm_zscore": 2.0, "ndwi_index": 0.3}
    res = xai.explain_cell_prediction("CELL_001", row)
    assert "shap_contributions" in res
    assert res["confidence"] > 0.5
