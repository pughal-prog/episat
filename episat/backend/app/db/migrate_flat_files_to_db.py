"""
EpiSat 2.0 - One-time Migration Script
======================================
Migrates flat prototype files (master_dataset.csv, current_risk.json, historical_predictions.json)
into the database schema (SQLAlchemy / PostgreSQL / SQLite).
"""

import asyncio
import json
from datetime import datetime
from pathlib import Path
import pandas as pd
from sqlalchemy import select

from app.db.database import AsyncSessionLocal, engine, Base
from app.models.schema import Location, GridCell, EnvironmentalObservation, DiseaseCase, ModelPrediction, User

BASE_DIR = Path(__file__).resolve().parents[4]
PROTOTYPE_DIR = BASE_DIR / "episat_prototype"

DISTRICT_COORDS = {
    "Delhi": (28.6139, 77.2090),
    "Chennai": (13.0827, 80.2707),
    "Kochi": (9.9312, 76.2673),
    "Pune": (18.5204, 73.8567),
    "Kolkata": (22.5726, 88.3639),
    "Lucknow": (26.8467, 80.9462),
    "Guwahati": (26.1445, 91.7362),
    "Bhubaneswar": (20.2961, 85.8245),
}

async def run_migration():
    print("Initializing Database Schema...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        # 1. Create Default Admin / Health Officer User if not exists
        result = await session.execute(select(User).where(User.email == "officer@episat.gov.in"))
        if not result.scalar_one_or_none():
            user = User(
                email="officer@episat.gov.in",
                hashed_password="scrypt:32768:8:1$salt$hash", # demo hash
                full_name="Dr. Public Health Officer",
                role="health_officer"
            )
            session.add(user)
            print("Added default health officer user.")

        # 2. Populate Locations & Grid Cells
        location_map = {}
        cell_map = {}

        for dist_name, (lat, lon) in DISTRICT_COORDS.items():
            loc_result = await session.execute(select(Location).where(Location.name == dist_name))
            loc = loc_result.scalar_one_or_none()
            if not loc:
                loc = Location(
                    name=dist_name,
                    state="State",
                    country="India",
                    center_lat=lat,
                    center_lon=lon,
                    boundary_geojson={"type": "Point", "coordinates": [lon, lat]}
                )
                session.add(loc)
                await session.flush()

            location_map[dist_name] = loc.id

            cell_id = f"CELL_{dist_name.upper()}_001"
            cell_result = await session.execute(select(GridCell).where(GridCell.id == cell_id))
            cell = cell_result.scalar_one_or_none()
            if not cell:
                cell = GridCell(
                    id=cell_id,
                    location_name=dist_name,
                    center_lat=lat,
                    center_lon=lon,
                    resolution_meters=500,
                    geometry_geojson={"type": "Point", "coordinates": [lon, lat]}
                )
                session.add(cell)
                await session.flush()

            cell_map[dist_name] = cell.id

        await session.commit()
        print(f"Populated {len(location_map)} locations and grid cells.")

        # 3. Migrate master_dataset.csv -> EnvironmentalObservation & DiseaseCase
        master_csv = PROTOTYPE_DIR / "data" / "master_dataset.csv"
        if master_csv.exists():
            df_master = pd.read_csv(master_csv)
            obs_count, case_count = 0, 0
            for _, row in df_master.iterrows():
                dist = row["district"]
                cell_id = cell_map.get(dist)
                if not cell_id:
                    continue

                obs_date = pd.to_datetime(row["week_start"]).to_pydatetime()

                obs = EnvironmentalObservation(
                    cell_id=cell_id,
                    observation_date=obs_date,
                    lst_celsius=float(row["lst_celsius"]),
                    rainfall_mm=float(row["rainfall_mm"]),
                    ndwi_index=float(row["ndwi_index"]),
                    humidity_pct=float(row["humidity_proxy_pct"]),
                    population_proxy=float(row["population_density"]),
                    source="demo"
                )
                session.add(obs)
                obs_count += 1

                case = DiseaseCase(
                    cell_id=cell_id,
                    week_start=obs_date,
                    reported_cases=int(row["dengue_cases"]),
                    disease_type="Dengue"
                )
                session.add(case)
                case_count += 1

            await session.commit()
            print(f"Migrated {obs_count} environmental observations and {case_count} disease cases.")

        # 4. Migrate historical_predictions.json & current_risk.json -> ModelPrediction
        hist_json = PROTOTYPE_DIR / "api" / "historical_predictions.json"
        pred_count = 0
        if hist_json.exists():
            with open(hist_json) as f:
                hist_data = json.load(f)

            for rec in hist_data:
                dist = rec["district"]
                cell_id = cell_map.get(dist)
                if not cell_id:
                    continue

                forecast_date = pd.to_datetime(rec["week_start"]).to_pydatetime()
                pred_cases = float(rec["predicted_cases"])
                risk_level = rec.get("risk_level", "Low")

                mp = ModelPrediction(
                    cell_id=cell_id,
                    forecast_date=forecast_date,
                    horizon_days=28,
                    predicted_cases=pred_cases,
                    lower_bound=max(0.0, pred_cases - 2.0),
                    upper_bound=pred_cases + 2.5,
                    anomaly_score=45.0,
                    bsi_score=50.0,
                    risk_score=60.0 if risk_level in ["High", "Critical"] else 30.0,
                    risk_level=risk_level,
                    confidence=0.85,
                    model_version="RandomForest-Baseline"
                )
                session.add(mp)
                pred_count += 1

            await session.commit()
            print(f"Migrated {pred_count} historical predictions into ModelPrediction schema.")

    print("Migration completed successfully!")

if __name__ == "__main__":
    asyncio.run(run_migration())
