"""
EpiSat - REAL Data Loading Template
====================================
Run this on YOUR machine (needs internet + free API accounts). It produces
the exact same master_dataset.csv schema as generate_synthetic_data.py, so
feature_engineering.py and train_model.py work unchanged.

Required signups (do these first, before your hackathon starts):
  1. Google Earth Engine account -> https://earthengine.google.com/signup
  2. data.gov.in API key         -> https://data.gov.in
  3. (optional) Kaggle account   -> for the DengAI dataset as a fallback

Install:  pip install earthengine-api pandas requests
"""

import ee
import pandas as pd

# ---------------------------------------------------------------------------
# STEP 1: Authenticate Google Earth Engine (run once, opens a browser prompt)
# ---------------------------------------------------------------------------
# ee.Authenticate()
# ee.Initialize(project="YOUR_GCP_PROJECT_ID")

DISTRICTS = {
    # name: (lat, lon, buffer_km) -- use district centroid + a radius
    "Delhi":   (28.6139, 77.2090, 25),
    "Chennai": (13.0827, 80.2707, 25),
    "Kochi":   (9.9312, 76.2673, 20),
    "Pune":    (18.5204, 73.8567, 25),
}


def get_lst_weekly(lat, lon, buffer_km, start_date, end_date):
    """Land Surface Temperature from MODIS (MOD11A2, 8-day composite)."""
    point = ee.Geometry.Point([lon, lat]).buffer(buffer_km * 1000)
    collection = (
        ee.ImageCollection("MODIS/061/MOD11A2")
        .filterDate(start_date, end_date)
        .filterBounds(point)
        .select("LST_Day_1km")
    )

    def reduce_image(img):
        mean = img.reduceRegion(ee.Reducer.mean(), point, 1000).get("LST_Day_1km")
        # MODIS LST is scaled by 0.02 and in Kelvin
        kelvin = ee.Number(mean).multiply(0.02)
        celsius = kelvin.subtract(273.15)
        return ee.Feature(None, {"date": img.date().format("YYYY-MM-dd"), "lst_celsius": celsius})

    features = collection.map(reduce_image).getInfo()["features"]
    return pd.DataFrame([f["properties"] for f in features])


def get_rainfall_weekly(lat, lon, buffer_km, start_date, end_date):
    """Rainfall from CHIRPS daily, aggregated weekly."""
    point = ee.Geometry.Point([lon, lat]).buffer(buffer_km * 1000)
    collection = (
        ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
        .filterDate(start_date, end_date)
        .filterBounds(point)
    )

    def reduce_image(img):
        mean = img.reduceRegion(ee.Reducer.mean(), point, 5000).get("precipitation")
        return ee.Feature(None, {"date": img.date().format("YYYY-MM-dd"), "rainfall_mm": mean})

    features = collection.map(reduce_image).getInfo()["features"]
    df = pd.DataFrame([f["properties"] for f in features])
    df["date"] = pd.to_datetime(df["date"])
    weekly = df.set_index("date").resample("W-MON")["rainfall_mm"].sum().reset_index()
    return weekly


def get_ndwi_monthly(lat, lon, buffer_km, start_date, end_date):
    """Standing water index (NDWI) from Sentinel-2."""
    point = ee.Geometry.Point([lon, lat]).buffer(buffer_km * 1000)
    collection = (
        ee.ImageCollection("COPERNICUS/S2_SR_HARMONIZED")
        .filterDate(start_date, end_date)
        .filterBounds(point)
        .filter(ee.Filter.lt("CLOUDY_PIXEL_PERCENTAGE", 20))
    )

    def add_ndwi(img):
        ndwi = img.normalizedDifference(["B3", "B8"]).rename("NDWI")
        mean = ndwi.reduceRegion(ee.Reducer.mean(), point, 20).get("NDWI")
        return ee.Feature(None, {"date": img.date().format("YYYY-MM-dd"), "ndwi_index": mean})

    features = collection.map(add_ndwi).getInfo()["features"]
    return pd.DataFrame([f["properties"] for f in features])


def get_dengue_cases(district_name, start_date, end_date):
    """
    Dengue case counts from NVBDCP / IDSP via data.gov.in.
    data.gov.in resource IDs change over time -- search their portal for
    "dengue cases district wise" to get the current resource_id, then:

        import requests
        url = f"https://api.data.gov.in/resource/{resource_id}"
        params = {"api-key": YOUR_KEY, "format": "json", "filters[district]": district_name}
        resp = requests.get(url, params=params).json()

    If district-level weekly data isn't available/complete, fall back to the
    Kaggle "DengAI: Predicting Disease Spread" dataset to validate your
    pipeline end-to-end, then plug in real Indian data once access is
    confirmed -- this is a completely reasonable, honest scoping choice to
    state in your SIH presentation.
    """
    raise NotImplementedError("Wire this up to data.gov.in once you have an API key.")


if __name__ == "__main__":
    print("This is a template. Fill in ee.Initialize() with your GCP project,")
    print("then call the functions above per district and merge into the")
    print("same schema as data/master_dataset.csv")
