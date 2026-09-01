"""
EpiSat - Feature Engineering
=============================
Turns the raw weekly master_dataset.csv into a model-ready feature table.

Key idea: dengue cases lag behind environmental conditions by several weeks
(mosquito breeding + incubation cycle), so the model needs to see PAST
environmental readings to predict FUTURE case counts. We build lag features
at 2, 4, and 6 weeks for exactly this reason.
"""

import pandas as pd
import numpy as np

FORECAST_HORIZON_WEEKS = 4   # how far ahead we predict
LAGS = [2, 4, 6]


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["week_start"] = pd.to_datetime(df["week_start"])
    df = df.sort_values(["district", "week_start"]).reset_index(drop=True)

    feature_frames = []
    for district, g in df.groupby("district"):
        g = g.sort_values("week_start").reset_index(drop=True)

        # --- lag features for environmental variables ---
        for lag in LAGS:
            g[f"lst_lag{lag}"] = g["lst_celsius"].shift(lag)
            g[f"rainfall_lag{lag}"] = g["rainfall_mm"].shift(lag)
            g[f"ndwi_lag{lag}"] = g["ndwi_index"].shift(lag)
            g[f"humidity_lag{lag}"] = g["humidity_proxy_pct"].shift(lag)

        # --- rolling averages (4-week smoothed signal) ---
        g["rainfall_roll4"] = g["rainfall_mm"].rolling(4).mean()
        g["ndwi_roll4"] = g["ndwi_index"].rolling(4).mean()
        g["humidity_roll4"] = g["humidity_proxy_pct"].rolling(4).mean()

        # --- seasonal indicators ---
        g["month"] = g["week_start"].dt.month
        g["is_monsoon_season"] = g["month"].isin([6, 7, 8, 9]).astype(int)
        g["is_post_monsoon"] = g["month"].isin([9, 10, 11]).astype(int)

        # --- recent case trend (own past cases help predict near-future cases) ---
        g["cases_lag1"] = g["dengue_cases"].shift(1)
        g["cases_lag4"] = g["dengue_cases"].shift(4)
        g["cases_roll4"] = g["dengue_cases"].rolling(4).mean()

        # --- TARGET: cases FORECAST_HORIZON_WEEKS ahead ---
        g["target_cases_4wk_ahead"] = g["dengue_cases"].shift(-FORECAST_HORIZON_WEEKS)

        feature_frames.append(g)

    result = pd.concat(feature_frames, ignore_index=True)
    result = result.dropna().reset_index(drop=True)
    return result


def add_risk_bucket(df: pd.DataFrame, col="predicted_cases") -> pd.DataFrame:
    """Convert numeric prediction into Low/Medium/High/Critical risk labels."""
    df = df.copy()
    q1, q2, q3 = df[col].quantile([0.5, 0.75, 0.9])

    def bucket(v):
        if v <= q1:
            return "Low"
        elif v <= q2:
            return "Medium"
        elif v <= q3:
            return "High"
        return "Critical"

    df["risk_level"] = df[col].apply(bucket)
    return df


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

if __name__ == "__main__":
    raw = pd.read_csv(BASE_DIR / "data" / "master_dataset.csv")
    features = build_features(raw)
    out_path = BASE_DIR / "data" / "features_dataset.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    features.to_csv(out_path, index=False)
    print(f"Feature dataset built: {features.shape[0]} rows, {features.shape[1]} columns")
    print("\nFeature columns:")
    print([c for c in features.columns if c not in ("district", "week_start")])

