# EpiSat 2.0 Demonstration Guide

## Quick Start (Local Run)

1. **Start Backend Server**:
   ```bash
   cd backend
   python -m uvicorn app.main:app --host 127.0.0.1 --port 5000
   ```
   API Documentation: [http://127.0.0.1:5000/api/v1/docs](http://127.0.0.1:5000/api/v1/docs)

2. **Start Frontend Command Center**:
   ```bash
   cd frontend
   npm run dev
   ```
   Command Center UI: [http://localhost:3000](http://localhost:3000)

## Demo Script Flow (Chennai Scenario)
1. Open [http://localhost:3000](http://localhost:3000) to view the Landing Page showcasing **SPACE → AI → EARLY WARNING → ACTION**.
2. Navigate to [Command Center](/dashboard) to observe live risk indicators, MapLibre GL spatial map, and 7D–28D timeline controls.
3. Open [Hotspots](/dashboard/hotspots) to inspect spatial DBSCAN clusters and future hotspot projections.
4. Open [Explainability](/dashboard/explainability) to view local SHAP factor attribution breakdown for high-risk wards.
5. Open [Interventions](/dashboard/interventions) to view prioritize public health action recommendations and update task statuses.
6. Open [What-If Simulator](/dashboard/simulation) to adjust rainfall and BSI reduction sliders and compare baseline vs simulated risk.
7. Open [Citizen Reporting](/dashboard/citizen) to submit geotagged photos and trigger PyTorch MobileNet stagnant water classification.
8. Open [Model Registry](/dashboard/models) to review model comparison metrics, ablation study performance lift, and feature drift status.
