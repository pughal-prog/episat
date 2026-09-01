import pytest
from app.ml.models.risk_fusion import RiskFusionEngine
from app.ml.models.hotspot_detector import HyperlocalHotspotDetector
from app.geospatial.adapters import DemoDataProvider

def test_risk_fusion_engine():
    fusion = RiskFusionEngine()
    res_normal = fusion.fuse_risk(anomaly_score=60.0, bsi_score=70.0, forecast_cases=25.0, neighbor_risk=40.0, flood_event=False)
    assert 0.0 <= res_normal["episat_risk_score"] <= 100.0
    assert res_normal["risk_level"] in ["Moderate", "High", "Critical"]

    res_flood = fusion.fuse_risk(anomaly_score=60.0, bsi_score=70.0, forecast_cases=25.0, neighbor_risk=40.0, flood_event=True)
    assert res_flood["episat_risk_score"] >= res_normal["episat_risk_score"]
    assert res_flood["components"]["flood_event_applied"] is True

def test_dbscan_hotspot_detector():
    provider = DemoDataProvider()
    cells = provider.fetch_grid_cells("Chennai", 13.0827, 80.2707)
    
    # Annotate test cells with risk scores
    for i, c in enumerate(cells):
        c["episat_risk_score"] = 75.0 if i < 8 else 30.0
        c["bsi_score"] = 65.0
        c["anomaly_score"] = 60.0
        c["forecast_cases"] = 12.0

    detector = HyperlocalHotspotDetector(risk_threshold=50.0)
    hotspots = detector.detect_hotspots(cells, horizon_days=21)
    
    assert len(hotspots) > 0
    first_hs = hotspots[0]
    assert "HOTSPOT_" in first_hs["id"]
    assert first_hs["risk_score"] >= 50.0
    assert "geometry_geojson" in first_hs
