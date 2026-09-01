# Hyperlocal Geospatial Methodology

## Grid Engine
EpiSat 2.0 operates on a configurable spatial grid system:
- **Default Resolution**: 500m × 500m (~0.25 km² per cell).
- **Supported Resolutions**: 250m, 500m, 1km.
- **Hierarchy Aggregation**: Grid Cell → Ward → Zone → City/District.

## Spatial Clustering & Hotspot Detection
- **DBSCAN Algorithm**: Groups contiguous grid cells exceeding high risk and BSI thresholds into spatial vector risk clusters.
- **Future Hotspot Projection**: Computes dynamic risk maps across +7D, +14D, +21D, and +28D timelines.
- **MapLibre GL Vector Tiles**: Renders GPU-accelerated interactive spatial layers for risk heatmaps, water anomalies, citizen hazard reports, and active interventions.
