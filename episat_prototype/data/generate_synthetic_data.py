"""
EpiSat - Synthetic Data Generator
==================================
Generates a realistic weekly dataset per district, mimicking the real data
sources this pipeline will eventually pull from:

    - Land Surface Temperature (LST)   -> NASA MODIS via Google Earth Engine
    - Rainfall                          -> CHIRPS via Google Earth Engine
    - NDWI (standing water index)       -> Sentinel-2 via Google Earth Engine
    - Population density                -> WorldPop
    - Dengue case counts                -> NVBDCP / IDSP / data.gov.in

WHY SYNTHETIC DATA: this sandbox has no internet access to call the real
APIs. The column names, units, and causal relationships below are built to
match the real sources as closely as possible, so when you swap in the real
data-loading functions (see `load_real_data_TEMPLATE.py`), nothing else in
the pipeline needs to change.

The synthetic generator deliberately encodes realistic epidemiology:
  - Dengue cases rise ~2-6 weeks AFTER standing water + humidity increase
    (mosquito breeding cycle delay)
  - Strong seasonal pattern (post-monsoon peak, Aug-Nov)
  - Random noise + occasional outbreak spikes to test model robustness
"""

import numpy as np
import pandas as pd

np.random.seed(42)

DISTRICTS = ["Delhi", "Chennai", "Kochi", "Pune", "Kolkata", "Lucknow", "Guwahati", "Bhubaneswar"]
START_DATE = "2019-01-06"   # weekly data, 5 years
N_WEEKS = 260                # 5 years of weekly data
DATES = pd.date_range(START_DATE, periods=N_WEEKS, freq="W-MON")


def seasonal_curve(week_of_year, peak_week=36, width=8, amplitude=1.0):
    """Bell-curve centered on post-monsoon peak (~week 36 = early Sept)."""
    return amplitude * np.exp(-0.5 * ((week_of_year - peak_week) / width) ** 2)


def generate_district_series(district_name, base_temp, base_rain, base_pop, rng):
    rows = []
    # latent "breeding risk" state carried across weeks (drives lagged cases)
    breeding_risk_history = []

    for i, date in enumerate(DATES):
        week_of_year = date.isocalendar()[1]

        # --- Land Surface Temperature (deg C) ---
        seasonal_temp = 6 * np.sin(2 * np.pi * (week_of_year - 10) / 52)
        lst = base_temp + seasonal_temp + rng.normal(0, 1.2)

        # --- Rainfall (mm/week) --- monsoon bump June-Sept (weeks ~24-40)
        monsoon = seasonal_curve(week_of_year, peak_week=30, width=7, amplitude=base_rain)
        rainfall = max(0, monsoon + rng.normal(0, base_rain * 0.15))

        # --- NDWI standing water index (-1 to 1, higher = more standing water) ---
        # responds to rainfall with ~1-2 week lag + slow decay
        prior_rain = rows[-1]["rainfall_mm"] if rows else 0
        ndwi = -0.2 + 0.006 * (rainfall + 0.5 * prior_rain) + rng.normal(0, 0.03)
        ndwi = float(np.clip(ndwi, -0.5, 0.6))

        # --- Population density (people/km^2) --- slowly growing, static-ish
        population_density = base_pop * (1 + 0.002 * i / 52) + rng.normal(0, 5)

        # --- latent breeding risk this week (not observed directly) ---
        humidity_proxy = 40 + 15 * seasonal_curve(week_of_year, peak_week=32, width=9, amplitude=1.0)
        breeding_risk = (
            0.5 * max(0, ndwi) * 100
            + 0.3 * max(0, lst - 24)
            + 0.2 * (humidity_proxy - 40)
        )
        breeding_risk_history.append(breeding_risk)

        # --- Dengue cases: driven by breeding risk from 3-5 weeks ago ---
        lag = 4
        if i >= lag:
            lagged_risk = np.mean(breeding_risk_history[max(0, i - lag - 1): i - lag + 1])
        else:
            lagged_risk = breeding_risk_history[0] * 0.3

        base_cases = 3 + 1.8 * lagged_risk * (population_density / base_pop)
        # occasional outbreak spike (simulates a real surge event, ~1% of weeks, smaller magnitude)
        spike = 0
        if rng.random() < 0.01:
            spike = rng.uniform(10, 25)
        noise = rng.normal(0, max(0.8, base_cases * 0.08))
        dengue_cases = max(0, base_cases + spike + noise)

        rows.append({
            "district": district_name,
            "week_start": date,
            "week_of_year": week_of_year,
            "lst_celsius": round(lst, 2),
            "rainfall_mm": round(rainfall, 2),
            "ndwi_index": round(ndwi, 3),
            "humidity_proxy_pct": round(humidity_proxy, 1),
            "population_density": round(population_density, 1),
            "dengue_cases": round(dengue_cases),
        })

    return pd.DataFrame(rows)


from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def main():
    rng = np.random.default_rng(42)
    district_profiles = {
        "Delhi":        dict(base_temp=27, base_rain=18, base_pop=11300),
        "Chennai":      dict(base_temp=29, base_rain=22, base_pop=26900),
        "Kochi":        dict(base_temp=28, base_rain=35, base_pop=6340),
        "Pune":         dict(base_temp=25, base_rain=14, base_pop=6300),
        "Kolkata":      dict(base_temp=27, base_rain=28, base_pop=24700),
        "Lucknow":      dict(base_temp=26, base_rain=17, base_pop=7300),
        "Guwahati":     dict(base_temp=24, base_rain=30, base_pop=1400),
        "Bhubaneswar":  dict(base_temp=27, base_rain=25, base_pop=2100),
    }

    all_dfs = []
    for district, profile in district_profiles.items():
        df = generate_district_series(district, rng=np.random.default_rng(hash(district) % (2**32)), **profile)
        all_dfs.append(df)

    master = pd.concat(all_dfs, ignore_index=True)
    out_path = BASE_DIR / "data" / "master_dataset.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    master.to_csv(out_path, index=False)
    print(f"Generated {len(master)} rows across {len(district_profiles)} districts.")
    print(master.head(10).to_string(index=False))


if __name__ == "__main__":
    main()

