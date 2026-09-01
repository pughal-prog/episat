from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.db.database import Base

def utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="health_officer") # admin, health_officer, analyst, citizen
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utc_now)

class Location(Base):
    __tablename__ = "locations"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    state = Column(String(255), nullable=False)
    country = Column(String(100), default="India")
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    boundary_geojson = Column(JSON, nullable=True)

class Ward(Base):
    __tablename__ = "wards"
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"))
    ward_number = Column(Integer, nullable=False)
    name = Column(String(255), nullable=False)
    population = Column(Integer, default=150000)
    boundary_geojson = Column(JSON, nullable=True)

class GridCell(Base):
    __tablename__ = "grid_cells"
    id = Column(String(64), primary_key=True, index=True) # e.g. CELL_DELHI_001
    ward_id = Column(Integer, ForeignKey("wards.id"), nullable=True)
    location_name = Column(String(255), index=True)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    resolution_meters = Column(Integer, default=500)
    elevation_m = Column(Float, default=15.0) # SRTM 30m terrain elevation
    built_up_density = Column(Float, default=0.45) # GHSL built-up footprint ratio
    drainage_basin_id = Column(String(64), default="BASIN_SOUTH_COASTAL_01") # HydroSHEDS catchment
    nighttime_lights = Column(Float, default=12.5) # VIIRS Nighttime Lights
    geometry_geojson = Column(JSON, nullable=True)

class EnvironmentalObservation(Base):
    __tablename__ = "environmental_observations"
    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(String(64), ForeignKey("grid_cells.id"), index=True)
    observation_date = Column(DateTime, index=True, nullable=False)
    lst_celsius = Column(Float)
    rainfall_mm = Column(Float)
    ndwi_index = Column(Float)
    ndvi_index = Column(Float)
    water_persistence = Column(Float)
    humidity_pct = Column(Float)
    population_proxy = Column(Float)
    nighttime_lights = Column(Float) # VIIRS Nighttime Lights (urbanization/informal proxy)
    aerosol_index = Column(Float)    # Sentinel-5P UV Aerosol Index
    sar_water_extent = Column(Float) # Sentinel-1 SAR Cloud-Penetrating Water Ratio 0-1
    soil_moisture = Column(Float)    # SMAP Surface & Root-Zone Soil Saturation m3/m3
    elevation_m = Column(Float)      # SRTM Elevation (meters)
    built_up_density = Column(Float) # GHSL Built-Up Surface Density 0-1
    drainage_basin_id = Column(String(64)) # HydroSHEDS Drainage Basin ID
    source = Column(String(50), default="demo") # demo, sentinel2, modis, chirps, era5

class DiseaseCase(Base):
    __tablename__ = "disease_cases"
    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(String(64), ForeignKey("grid_cells.id"), index=True)
    week_start = Column(DateTime, index=True, nullable=False)
    reported_cases = Column(Integer, nullable=False)
    disease_type = Column(String(50), default="Dengue") # Dengue, Malaria, Chikungunya

class ModelPrediction(Base):
    __tablename__ = "model_predictions"
    id = Column(Integer, primary_key=True, index=True)
    cell_id = Column(String(64), ForeignKey("grid_cells.id"), index=True)
    forecast_date = Column(DateTime, index=True)
    horizon_days = Column(Integer, default=21) # 7, 14, 21, 28
    predicted_cases = Column(Float)
    lower_bound = Column(Float)
    upper_bound = Column(Float)
    anomaly_score = Column(Float) # 0 - 100
    bsi_score = Column(Float)     # 0 - 100
    risk_score = Column(Float)    # 0 - 100
    risk_level = Column(String(50)) # Very Low, Low, Moderate, High, Critical
    confidence = Column(Float)
    model_version = Column(String(50), default="RF-v2")
    created_at = Column(DateTime, default=utc_now)

class Hotspot(Base):
    __tablename__ = "hotspots"
    id = Column(String(64), primary_key=True, index=True)
    location_name = Column(String(255), index=True)
    ward_name = Column(String(255))
    center_lat = Column(Float)
    center_lon = Column(Float)
    horizon_days = Column(Integer, default=21)
    risk_score = Column(Float)
    bsi_score = Column(Float)
    anomaly_score = Column(Float)
    expected_cases = Column(Float)
    confidence = Column(Float)
    primary_drivers = Column(JSON) # e.g. {"rainfall_anomaly": 31, "water_persistence": 24}
    geometry_geojson = Column(JSON)

class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    cell_id = Column(String(64), nullable=True)
    image_url = Column(String(500), nullable=True)
    cv_standing_water_prob = Column(Float, nullable=True)
    cv_breeding_site_level = Column(String(50), nullable=True)
    cv_confidence = Column(Float, nullable=True)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="Pending") # Pending, Verified, Actioned
    created_at = Column(DateTime, default=utc_now)

class Intervention(Base):
    __tablename__ = "interventions"
    id = Column(Integer, primary_key=True, index=True)
    location_name = Column(String(255))
    ward_name = Column(String(255))
    priority = Column(String(50)) # HIGH, CRITICAL, MEDIUM, LOW
    action = Column(Text)
    reason = Column(Text)
    target_area = Column(String(255))
    status = Column(String(50), default="Recommended") # Recommended, In Progress, Completed, Overdue
    suggested_timeline = Column(String(100))
    created_at = Column(DateTime, default=utc_now)

class DataFreshness(Base):
    __tablename__ = "data_freshness"
    id = Column(Integer, primary_key=True, index=True)
    source_name = Column(String(100), index=True, nullable=False) # MODIS_LST, GPM_IMERG_EARLY, SENTINEL2_NDWI, etc.
    grid_cell_id = Column(String(64), ForeignKey("grid_cells.id"), index=True, nullable=True)
    observation_timestamp = Column(DateTime, nullable=False)
    ingested_at = Column(DateTime, default=utc_now)
    is_stale = Column(Boolean, default=False)
    staleness_reason = Column(String(255), nullable=True)

