"""
EpiSat - Risk Scoring & Alert Generation
==========================================
Takes model predictions and converts them into:
  1. Risk buckets (Low/Medium/High/Critical) per district
  2. Plain-language alert text (the "explain it to a human" layer)

This is what the API serves and the dashboard displays.
"""

import sys
import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.append(str(BASE_DIR / "data"))
from feature_engineering import add_risk_bucket


def generate_alert_text(row):
    reasons = []
    if row.get("ndwi_roll4", 0) > 0.05:
        reasons.append("rising standing-water levels")
    if row.get("humidity_roll4", 0) > 55:
        reasons.append("high humidity")
    if row.get("rainfall_roll4", 0) > 15:
        reasons.append("sustained rainfall")
    if row.get("is_post_monsoon", 0) == 1:
        reasons.append("seasonal post-monsoon risk period")

    reason_text = ", ".join(reasons) if reasons else "current environmental conditions"

    level = row["risk_level"]
    if level == "Critical":
        return (f"CRITICAL: {row['district']} is forecast to see a significant dengue case "
                f"rise in the next 4 weeks, driven by {reason_text}. Immediate vector-control "
                f"action recommended.")
    elif level == "High":
        return (f"HIGH RISK: {row['district']} shows elevated dengue risk in the coming weeks "
                f"due to {reason_text}. Consider targeted fogging and public advisories.")
    elif level == "Medium":
        return (f"MODERATE RISK: {row['district']} has moderate dengue risk linked to {reason_text}. "
                f"Monitor closely over the next 2-3 weeks.")
    else:
        return f"LOW RISK: {row['district']} currently shows low dengue risk."


def main():
    predictions_path = BASE_DIR / "data" / "predictions.csv"
    df = pd.read_csv(predictions_path, parse_dates=["week_start"])

    # take the latest available week per district as the "current" snapshot
    latest = df.sort_values("week_start").groupby("district").tail(1).reset_index(drop=True)
    latest = add_risk_bucket(df, col="predicted_cases")  # bucket thresholds computed on full test set
    latest = latest.sort_values("week_start").groupby("district").tail(1).reset_index(drop=True)

    latest["alert_text"] = latest.apply(generate_alert_text, axis=1)

    output_cols = ["district", "week_start", "predicted_cases", "risk_level", "alert_text",
                   "ndwi_roll4", "rainfall_roll4", "humidity_roll4"]
    api_dir = BASE_DIR / "api"
    api_dir.mkdir(parents=True, exist_ok=True)
    latest[output_cols].to_json(api_dir / "current_risk.json", orient="records", date_format="iso", indent=2)

    # also save full historical predictions (for backtest mode + forecast graphs in dashboard)
    df_out = add_risk_bucket(df, col="predicted_cases")
    hist_cols = ["district", "week_start", "target_cases_4wk_ahead", "predicted_cases", "risk_level"]
    df_out[hist_cols].to_json(api_dir / "historical_predictions.json", orient="records", date_format="iso", indent=2)

    print("Current risk snapshot:")
    print(latest[["district", "predicted_cases", "risk_level"]].to_string(index=False))
    print("\nSaved: api/current_risk.json, api/historical_predictions.json")


if __name__ == "__main__":
    main()

