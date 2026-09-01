# EpiSat 2.0 — System Architecture & Data Pipeline

## Overview
EpiSat 2.0 is an India-focused, hyperlocal, explainable space-to-action AI platform that converts Earth Observation (EO) data into 4-week-ahead vector-borne disease early warning forecasts and targeted public health intervention recommendations.

```text
               EARTH OBSERVATION SENSORS
                           │
       ┌───────────────────┼───────────────────┐
       ↓                   ↓                   ↓
  Sentinel-2 MSI      Landsat-8 TIRS        GPM IMERG
   (NDVI / NDWI)         (LST)           (Precipitation)
       │                   │                   │
       └───────────────────┼───────────────────┘
                           ↓
                   DATA FUSION LAYER
                           ↓
                HYPERLOCAL 500m GRID ENGINE
                           ↓
            ENVIRONMENTAL ANOMALY INDEX (EAI)
                           ↓
           BREEDING SUITABILITY MODEL (BSI)
                           ↓
         MULTI-HORIZON DISEASE FORECAST (7-28D)
                           ↓
                  SPATIAL RISK FUSION
                           ↓
            DBSCAN HOTSPOT DETECTION ENGINE
                           ↓
                 EXPLAINABLE AI (SHAP)
                           ↓
            INTERVENTION RECOMMENDATION ENGINE
                           ↓
     ┌─────────────────────┼─────────────────────┐
     ↓                     ↓                     ↓
Command Center       What-If Simulator       Alert System
     ↑
     │
Citizen Reports (PyTorch MobileNet Water Classifier)
```

## System Components
1. **Frontend Command Center**: Built with Next.js 15, React 19, MapLibre GL, Recharts, Framer Motion, and Tailwind CSS.
2. **Backend REST API**: Powered by FastAPI, Pydantic V2, SQLAlchemy 2.0, and PostGIS.
3. **ML & GIS Engines**:
   - Environmental Anomaly Index (EAI): Standardized Z-scores across LST, rainfall, NDWI, NDVI, humidity.
   - Mosquito Breeding Suitability Index (BSI): Environmental suitability model (0-100 scale).
   - Multi-Horizon Forecasting: Random Forest, XGBoost, LightGBM, and PyTorch LSTM.
   - Spatial Hotspots: DBSCAN spatial clustering and 7D-28D future projection timeline.
   - Computer Vision: PyTorch MobileNetV3 stagnant water classifier for geotagged citizen reports.
