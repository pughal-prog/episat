import pytest
from app.geospatial.adapters import (
    SatelliteProvider, WeatherProvider, GISProvider, DiseaseDataProvider,
    DemoDataProvider, RealSatelliteProvider, get_data_provider
)
from app.core.config import settings

def test_provider_abstractions():
    demo = DemoDataProvider()
    assert isinstance(demo, SatelliteProvider)
    assert isinstance(demo, WeatherProvider)
    assert isinstance(demo, GISProvider)
    assert isinstance(demo, DiseaseDataProvider)

def test_real_satellite_provider_catalogs():
    real = RealSatelliteProvider()
    assert real.MODIS_LST_CATALOG == "MODIS/061/MOD11A2"
    assert real.CHIRPS_RAINFALL_CATALOG == "UCSB-CHG/CHIRPS/DAILY"
    assert real.SENTINEL2_CATALOG == "COPERNICUS/S2_SR_HARMONIZED"
    assert "14580510" in real.EPICLIM_ZENODO_URL
    assert "worldpop" in real.WORLDPOP_INDIA_URL.lower()

def test_provider_factory():
    provider = get_data_provider()
    assert isinstance(provider, DemoDataProvider)
