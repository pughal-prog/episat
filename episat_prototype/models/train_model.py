"""
EpiSat - Model Training & Backtest Validation
================================================
Trains a Random Forest baseline to predict dengue cases 4 weeks ahead.

NOTE ON XGBOOST: this sandbox has no internet, so XGBoost couldn't be
installed here. RandomForestRegressor from scikit-learn is used instead --
same "ensemble of trees" family, same feature-importance interpretability,
and a completely reasonable baseline to present. On your own machine:

    pip install xgboost
    from xgboost import XGBRegressor
    model = XGBRegressor(n_estimators=300, max_depth=5, learning_rate=0.05)

...is a drop-in replacement for the RandomForestRegressor below -- nothing
else in this script needs to change.

VALIDATION STRATEGY: time-based split (not random shuffle) because this is
a forecasting problem -- the model must never see future data during
training. We train on the first 80% of weeks and test on the most recent
20%, per district.
"""

import pandas as pd
import numpy as np
import joblib
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt

FEATURE_COLS = [
    "lst_celsius", "rainfall_mm", "ndwi_index", "humidity_proxy_pct", "population_density",
    "lst_lag2", "rainfall_lag2", "ndwi_lag2", "humidity_lag2",
    "lst_lag4", "rainfall_lag4", "ndwi_lag4", "humidity_lag4",
    "lst_lag6", "rainfall_lag6", "ndwi_lag6", "humidity_lag6",
    "rainfall_roll4", "ndwi_roll4", "humidity_roll4",
    "month", "is_monsoon_season", "is_post_monsoon",
    "cases_lag1", "cases_lag4", "cases_roll4",
]
TARGET_COL = "target_cases_4wk_ahead"


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def time_based_split(df, train_frac=0.8):
    train_frames, test_frames = [], []
    for district, g in df.groupby("district"):
        g = g.sort_values("week_start")
        cutoff = int(len(g) * train_frac)
        train_frames.append(g.iloc[:cutoff])
        test_frames.append(g.iloc[cutoff:])
    return pd.concat(train_frames), pd.concat(test_frames)


def train():
    df = pd.read_csv(BASE_DIR / "data" / "features_dataset.csv", parse_dates=["week_start"])
    train_df, test_df = time_based_split(df)

    X_train, y_train = train_df[FEATURE_COLS], train_df[TARGET_COL]
    X_test, y_test = test_df[FEATURE_COLS], test_df[TARGET_COL]

    model = RandomForestRegressor(
        n_estimators=300, max_depth=8, min_samples_leaf=3,
        random_state=42, n_jobs=-1
    )
    model.fit(X_train, y_train)

    preds = model.predict(X_test)
    mae = mean_absolute_error(y_test, preds)
    r2 = r2_score(y_test, preds)
    print(f"Test MAE: {mae:.2f} cases/week")
    print(f"Test R^2: {r2:.3f}")

    # feature importance
    importances = pd.Series(model.feature_importances_, index=FEATURE_COLS).sort_values(ascending=False)
    print("\nTop 10 most important features:")
    print(importances.head(10).to_string())

    model_dir = BASE_DIR / "models"
    model_dir.mkdir(parents=True, exist_ok=True)
    data_dir = BASE_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, model_dir / "episat_rf_model.pkl")

    # ---- Save test predictions for the API / dashboard to use ----
    test_df = test_df.copy()
    test_df["predicted_cases"] = preds
    test_df.to_csv(data_dir / "predictions.csv", index=False)

    # ---- BACKTEST PLOT: predicted vs actual, per district (the key demo asset) ----
    fig, axes = plt.subplots(4, 2, figsize=(14, 16), sharex=False)
    axes = axes.flatten()
    for i, (district, g) in enumerate(test_df.groupby("district")):
        g = g.sort_values("week_start")
        ax = axes[i]
        ax.plot(g["week_start"], g["target_cases_4wk_ahead"], label="Actual cases", color="#0B1F3A", linewidth=2)
        ax.plot(g["week_start"], g["predicted_cases"], label="EpiSat predicted", color="#1F6FEB", linewidth=2, linestyle="--")
        ax.set_title(district, fontsize=11, fontweight="bold")
        ax.tick_params(axis="x", rotation=30, labelsize=7)
        ax.legend(fontsize=7)
        ax.set_ylabel("Weekly cases")
    plt.tight_layout()
    plot_path = model_dir / "backtest_predicted_vs_actual.png"
    plt.savefig(plot_path, dpi=150)
    print(f"\nSaved backtest plot -> {plot_path}")

    # ---- Feature importance plot ----
    plt.figure(figsize=(8, 6))
    importances.head(12).sort_values().plot(kind="barh", color="#1F6FEB")
    plt.title("EpiSat - Feature Importance (Random Forest)")
    plt.xlabel("Importance")
    plt.tight_layout()
    fi_plot_path = model_dir / "feature_importance.png"
    plt.savefig(fi_plot_path, dpi=150)
    print(f"Saved feature importance plot -> {fi_plot_path}")

    return model, mae, r2



if __name__ == "__main__":
    train()
