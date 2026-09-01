import pandas as pd
import numpy as np
from typing import Dict, Any, List
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score
from app.ml.features.feature_store import generate_grid_timeseries, build_feature_store_df

ABLATION_FEATURE_SETS = {
    "Disease Only": ["cases_lag1", "cases_lag4", "cases_roll4"],
    "Weather Only": ["lst_celsius", "rainfall_mm", "humidity_pct", "lst_lag2", "rainfall_lag2", "humidity_lag2"],
    "Satellite Only": ["ndwi_index", "ndvi_index", "water_persistence", "ndwi_lag2", "ndwi_roll4"],
    "Satellite + Weather": ["lst_celsius", "rainfall_mm", "ndwi_index", "ndvi_index", "humidity_pct", "water_persistence"],
    "Satellite + Weather + Disease": [
        "lst_celsius", "rainfall_mm", "ndwi_index", "humidity_pct", "population_proxy",
        "lst_lag2", "rainfall_lag2", "ndwi_lag2", "humidity_lag2",
        "rainfall_roll3", "ndwi_roll4", "humidity_roll4",
        "cases_lag1", "cases_lag4", "cases_roll4"
    ]
}

def run_ablation_study(location_name: str = "Chennai") -> pd.DataFrame:
    """
    Evaluates feature subsets to quantify the value added by Earth Observation (satellite + weather)
    over baseline historical surveillance data alone.
    """
    raw_df = generate_grid_timeseries(location_name=location_name, n_weeks=156)
    df = build_feature_store_df(raw_df)

    # Chronological temporal split (80% train, 20% test)
    train_frames, test_frames = [], []
    for cell_id, g in df.groupby("cell_id"):
        g = g.sort_values("week_start")
        cutoff = int(len(g) * 0.8)
        train_frames.append(g.iloc[:cutoff])
        test_frames.append(g.iloc[cutoff:])
        
    train_df = pd.concat(train_frames)
    test_df = pd.concat(test_frames)

    results = []
    target_col = "target_cases_21d" # 21-day forecast horizon

    for set_name, feature_list in ABLATION_FEATURE_SETS.items():
        X_train = train_df[feature_list]
        y_train = train_df[target_col]
        X_test = test_df[feature_list]
        y_test = test_df[target_col]

        model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
        model.fit(X_train, y_train)
        preds = model.predict(X_test)

        mae = mean_absolute_error(y_test, preds)
        rmse = root_mean_squared_error(y_test, preds)
        r2 = r2_score(y_test, preds)

        results.append({
            "Feature Subset": set_name,
            "Feature Count": len(feature_list),
            "MAE (cases/wk)": round(mae, 2),
            "RMSE": round(rmse, 2),
            "R² Score": round(r2, 3),
            "Validation Protocol": "Chronological (80/20)"
        })

    res_df = pd.DataFrame(results)
    return res_df

if __name__ == "__main__":
    df_res = run_ablation_study("Chennai")
    print(df_res.to_string(index=False))
