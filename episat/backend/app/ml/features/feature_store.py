import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, Any, List

from app.core.all_india_lgd_locations import get_district_by_id_or_name

DISTRICT_PROFILES = {
    "Chennai": {"base_temp": 29.4, "base_rain": 24.5, "base_pop": 26900, "lat": 13.0827, "lon": 80.2707},
    "Delhi":   {"base_temp": 27.2, "base_rain": 18.0, "base_pop": 11300, "lat": 28.6139, "lon": 77.2090},
    "Kochi":   {"base_temp": 28.1, "base_rain": 35.2, "base_pop": 6340,  "lat": 9.9312,  "lon": 76.2673},
    "Pune":    {"base_temp": 25.4, "base_rain": 14.2, "base_pop": 6300,  "lat": 18.5204, "lon": 73.8567},
}

def generate_grid_timeseries(location_name: str = "Chennai", n_weeks: int = 156) -> pd.DataFrame:
    """
    Generates a 3-year weekly time-series across grid cells for the given location,
    encoding realistic mosquito breeding lags and seasonal curves.
    """
    rng = np.random.default_rng(hash(location_name) % (2**32))
    profile = DISTRICT_PROFILES.get(location_name)
    if not profile:
        dist_info = get_district_by_id_or_name(location_name)
        lat, lon = (dist_info["lat"], dist_info["lon"]) if dist_info else (13.0827, 80.2707)
        profile = {"base_temp": 27.0, "base_rain": 20.0, "base_pop": 15000, "lat": lat, "lon": lon}

    end_date = pd.Timestamp.now().normalize()
    dates = pd.date_range(end=end_date, periods=n_weeks, freq="W-MON")

    # Generate 25 grid cells per district location matching 5x5 geospatial grid
    cells = [f"CELL_{location_name.upper()}_{i+1:03d}" for i in range(25)]
    rows = []

    for cell_id in cells:
        cell_offset = (int(cell_id.split("_")[-1]) - 5) * 0.1
        cell_breeding_history = []

        for date in dates:
            week_of_year = date.isocalendar()[1]
            
            # Seasonal curves
            seasonal_temp = 5.5 * np.sin(2 * np.pi * (week_of_year - 10) / 52)
            lst = profile["base_temp"] + seasonal_temp + cell_offset + rng.normal(0, 1.0)
            
            monsoon_exp = np.exp(-0.5 * ((week_of_year - 30) / 7.5) ** 2)
            rainfall = max(0.0, profile["base_rain"] * monsoon_exp * (1 + 0.2 * cell_offset) + rng.normal(0, 4.0))

            prior_rain = rows[-1]["rainfall_mm"] if rows and rows[-1]["cell_id"] == cell_id else 0.0
            ndwi = -0.15 + 0.005 * (rainfall + 0.6 * prior_rain) + rng.normal(0, 0.03)
            ndwi = float(np.clip(ndwi, -0.4, 0.65))

            humidity = float(np.clip(45 + 25 * monsoon_exp + rng.normal(0, 3.0), 30, 95))
            ndvi = float(np.clip(0.2 + 0.35 * monsoon_exp + rng.normal(0, 0.04), 0.05, 0.85))
            water_persistence = float(np.clip(0.1 + 0.7 * max(0, ndwi) + rng.normal(0, 0.05), 0.0, 1.0))
            pop_proxy = profile["base_pop"] * (1 + 0.05 * cell_offset)

            # Latent breeding suitability index calculation
            bsi_raw = (
                0.35 * max(0, ndwi) * 100 +
                0.25 * max(0, lst - 22) * 5 +
                0.25 * (humidity - 35) +
                0.15 * water_persistence * 100
            )
            cell_breeding_history.append(bsi_raw)

            # Dengue cases lag ~3-4 weeks behind breeding conditions
            lag = 4
            if len(cell_breeding_history) >= lag:
                lagged_bsi = np.mean(cell_breeding_history[-lag:])
            else:
                lagged_bsi = bsi_raw * 0.4

            base_cases = 2.0 + 0.35 * lagged_bsi * (pop_proxy / 10000.0)
            # Occasional outbreak spike (~2% chance)
            spike = rng.uniform(8, 20) if rng.random() < 0.02 else 0.0
            cases = max(0, int(round(base_cases + spike + rng.normal(0, 1.2))))

            rows.append({
                "cell_id": cell_id,
                "location_name": location_name,
                "week_start": date,
                "week_of_year": week_of_year,
                "lst_celsius": round(lst, 2),
                "rainfall_mm": round(rainfall, 2),
                "ndwi_index": round(ndwi, 3),
                "ndvi_index": round(ndvi, 3),
                "humidity_pct": round(humidity, 1),
                "water_persistence": round(water_persistence, 3),
                "population_proxy": round(pop_proxy, 1),
                "dengue_cases": cases
            })

    df = pd.DataFrame(rows)
    return df

def build_feature_store_df(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Constructs lag features, rolling windows, and standardized Z-score anomalies.
    """
    df = raw_df.copy()
    df["week_start"] = pd.to_datetime(df["week_start"])
    df = df.sort_values(["cell_id", "week_start"]).reset_index(drop=True)

    frames = []
    for cell_id, g in df.groupby("cell_id"):
        g = g.sort_values("week_start").reset_index(drop=True)

        # Lag features
        for lag in [1, 2, 3, 4]:
            g[f"lst_lag{lag}"] = g["lst_celsius"].shift(lag)
            g[f"rainfall_lag{lag}"] = g["rainfall_mm"].shift(lag)
            g[f"ndwi_lag{lag}"] = g["ndwi_index"].shift(lag)
            g[f"humidity_lag{lag}"] = g["humidity_pct"].shift(lag)
            g[f"cases_lag{lag}"] = g["dengue_cases"].shift(lag)

        # Rolling averages
        g["rainfall_roll3"] = g["rainfall_mm"].rolling(3).mean()
        g["rainfall_roll7"] = g["rainfall_mm"].rolling(7, min_periods=1).mean()
        g["ndwi_roll4"] = g["ndwi_index"].rolling(4).mean()
        g["humidity_roll4"] = g["humidity_pct"].rolling(4).mean()
        g["cases_roll4"] = g["dengue_cases"].rolling(4).mean()

        # Baseline & Z-Score Anomalies
        for col in ["rainfall_mm", "ndwi_index", "lst_celsius", "humidity_pct", "ndvi_index"]:
            mean_val = g[col].mean()
            std_val = g[col].std() + 1e-6
            g[f"{col}_mean"] = mean_val
            g[f"{col}_anomaly"] = g[col] - mean_val
            g[f"{col}_zscore"] = (g[col] - mean_val) / std_val

        # Targets for multi-horizon forecasts (7, 14, 21, 28 days -> 1, 2, 3, 4 weeks)
        g["target_cases_7d"] = g["dengue_cases"].shift(-1)
        g["target_cases_14d"] = g["dengue_cases"].shift(-2)
        g["target_cases_21d"] = g["dengue_cases"].shift(-3)
        g["target_cases_28d"] = g["dengue_cases"].shift(-4)

        frames.append(g)

    res = pd.concat(frames, ignore_index=True)
    return res.dropna().reset_index(drop=True)
