import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_assistant_citizen_persona_public_guidance():
    """Verify citizen persona receives public health guidance with medical disclaimer."""
    res = client.post("/api/v1/assistant", json={
        "question": "What is dengue prevention guidance?",
        "location_name": "Chennai",
        "persona": "citizen"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "Disclaimer: This is general public-health information, not medical advice" in data["answer"]
    assert "WHO Vector Control Guidelines" in data["sources_used"]

def test_assistant_citizen_persona_blocked_from_health_officer_shap():
    """Verify citizen persona is blocked from receiving restricted health officer SHAP data."""
    res = client.post("/api/v1/assistant", json={
        "question": "Why is Ward 42 high risk?",
        "location_name": "Chennai",
        "persona": "citizen"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "Access Restricted" in data["answer"]
    assert "Health Officer or Analyst clearance" in data["answer"]

def test_assistant_health_officer_persona_accesses_shap():
    """Verify health officer persona successfully accesses ward SHAP explainability."""
    res = client.post("/api/v1/assistant", json={
        "question": "Why is Ward 42 high risk?",
        "location_name": "Chennai",
        "persona": "health_officer"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "Ward 42 in Chennai is rated CRITICAL RISK" in data["answer"]
    assert "CHIRPS Rainfall Anomaly" in data["answer"]
    assert "SHAP Local Attribution Engine" in data["sources_used"]

def test_assistant_analyst_persona_accesses_model_metrics():
    """Verify analyst persona receives model MAE, R², and ablation benchmarks."""
    res = client.post("/api/v1/assistant", json={
        "question": "What is the model MAE and performance?",
        "location_name": "Chennai",
        "persona": "analyst"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "MAE = 1.04 cases" in data["answer"]
    assert "Sentinel-2 NDWI increases overall forecast error" in data["answer"]

def test_assistant_unavailable_location_returns_strict_no_data():
    """Verify strictly returns no data available when asked about unknown location (e.g. Atlantis)."""
    res = client.post("/api/v1/assistant", json={
        "question": "What is the risk in Atlantis?",
        "location_name": "Atlantis",
        "persona": "citizen"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert "The required data is not available for 'Atlantis'" in data["answer"]
    assert data["context_data"]["status"] == "NO_DATA"

def test_assistant_citizen_report_action_trigger():
    """Verify reporting stagnant water returns OPEN_CITIZEN_REPORT_MODAL action trigger."""
    res = client.post("/api/v1/assistant", json={
        "question": "I want to report stagnant water",
        "location_name": "Chennai",
        "persona": "citizen"
    })
    assert res.status_code == 200
    data = res.json()["data"]
    assert data["action_trigger"] == "OPEN_CITIZEN_REPORT_MODAL"
    assert "VGG19 Computer Vision" in data["answer"]
