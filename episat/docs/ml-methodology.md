# Machine Learning Methodology

## Overview
EpiSat 2.0 uses a multi-stage machine learning pipeline to model vector-borne disease transmission dynamics:

1. **Environmental Anomaly Index (EAI)**: Computes 5-year rolling baselines and standard Z-scores for LST, rainfall, NDWI, NDVI, and humidity.
2. **Mosquito Breeding Suitability Index (BSI)**: Non-linear environmental suitability model capturing vector ecology constraints (temperature 22-32°C, standing water NDWI > 0.1, humidity > 45%).
3. **Multi-Horizon Disease Forecast**:
   - Models: Random Forest, XGBoost, LightGBM, PyTorch LSTM.
   - Horizons: 7, 14, 21, and 28 days ahead.
   - Validation Protocol: Strict chronological train/validation/test split (80% historical train, 20% test) to eliminate temporal data leakage.
4. **Explainable AI (SHAP)**: Provides local feature attribution per grid cell, translating model weights into non-causal natural language explanations.
