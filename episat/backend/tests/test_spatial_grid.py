import pytest
from app.geospatial.adapters import DemoDataProvider

def test_demo_data_provider_grid():
    provider = DemoDataProvider()
    cells = provider.fetch_grid_cells("Chennai", 13.0827, 80.2707, grid_size_m=500)
    assert len(cells) == 25
    first_cell = cells[0]
    assert first_cell["resolution_meters"] == 500
    assert "geometry_geojson" in first_cell
    assert first_cell["geometry_geojson"]["type"] == "Polygon"
    assert len(first_cell["geometry_geojson"]["coordinates"][0]) == 5
