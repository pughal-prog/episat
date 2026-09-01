"""
EpiSat - Backend API (Flask)
==============================
Serves three endpoints for the dashboard:

    GET /predict     -> current risk score + forecast per district
    GET /historical   -> backtest data (predicted vs actual) for demo mode
    GET /alert        -> plain-language alert text per district

NOTE ON FASTAPI: no internet in this sandbox to install fastapi, so this
uses Flask (already available). To swap to FastAPI on your own machine,
the route logic is identical -- replace @app.route with @app.get and
Flask(__name__) with FastAPI(), and `return jsonify(x)` with `return x`.

Run:  python3 app.py
Then open: http://localhost:5000/predict
"""

import json
from pathlib import Path
from flask import Flask, jsonify

app = Flask(__name__)


@app.after_request
def add_cors_headers(response):
    # Manual CORS (flask-cors isn't installable in this offline sandbox;
    # on your machine `pip install flask-cors` + CORS(app) is equivalent)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    return response


DATA_DIR = Path(__file__).parent


def load_json(filename):
    path = DATA_DIR / filename
    if not path.exists():
        return []
    with open(path) as f:
        return json.load(f)


@app.route("/predict", methods=["GET"])
def predict():
    """Current risk snapshot + 4-week forecast per district."""
    data = load_json("current_risk.json")
    return jsonify({"status": "ok", "count": len(data), "districts": data})


@app.route("/historical", methods=["GET"])
def historical():
    """Full predicted-vs-actual history, used for the dashboard's backtest mode."""
    data = load_json("historical_predictions.json")
    return jsonify({"status": "ok", "count": len(data), "records": data})


@app.route("/historical/<district>", methods=["GET"])
def historical_district(district):
    data = load_json("historical_predictions.json")
    filtered = [d for d in data if d["district"].lower() == district.lower()]
    return jsonify({"status": "ok", "count": len(filtered), "records": filtered})


@app.route("/alert", methods=["GET"])
def alert():
    """Plain-language alert text per district (what a health worker would read)."""
    data = load_json("current_risk.json")
    alerts = [{"district": d["district"], "risk_level": d["risk_level"], "alert_text": d["alert_text"]} for d in data]
    return jsonify({"status": "ok", "alerts": alerts})


@app.route("/", methods=["GET"])
def health_check():
    return jsonify({"status": "EpiSat API running", "endpoints": ["/predict", "/historical", "/historical/<district>", "/alert"]})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
