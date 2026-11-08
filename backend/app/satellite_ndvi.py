import random
import datetime
from typing import Dict, Any, List
from pydantic import BaseModel

class FieldNdviProfile(BaseModel):
    field_id: str
    field_name: str
    crop: str
    mean_ndvi: float
    min_ndvi: float
    max_ndvi: float
    mean_ndwi_water_index: float
    vegetation_vigor_status: str  # VIGOROUS, MODERATE_HEALTH, STRESSED, BARE_SOIL
    canopy_coverage_pct: float
    chlorophyll_content_index: float
    spatial_raster_grid: List[List[float]]
    satellite_source: str
    acquisition_date: str
    cloud_cover_pct: float

class SatelliteNdviEngine:
    """
    Geospatial Satellite & Drone Imagery Analytics Engine.
    Simulates Sentinel-2 10m Multispectral Bands (B4 Red, B8 NIR, B11 SWIR).
    NDVI = (NIR - Red) / (NIR + Red)
    NDWI = (NIR - SWIR) / (NIR + SWIR)
    """

    def analyze_field_ndvi(self, field_id: str, field_name: str, crop: str, growth_stage: str) -> FieldNdviProfile:
        # Determine baseline NDVI based on crop growth stage
        stage_lower = growth_stage.lower()
        if "persemaian" in stage_lower or "seedling" in stage_lower:
            base_ndvi = 0.38
        elif "vegetatif" in stage_lower or "vegetative" in stage_lower:
            base_ndvi = 0.74
        elif "flowering" in stage_lower or "pengisian" in stage_lower or "generatif" in stage_lower:
            base_ndvi = 0.82
        else:  # Pematangan / ripener
            base_ndvi = 0.58

        # Create 6x6 spatial raster grid with slight spatial noise
        grid = []
        all_vals = []
        for r in range(6):
            row = []
            for c in range(6):
                # Edge effect: slightly lower at boundaries
                edge_penalty = 0.05 if (r == 0 or r == 5 or c == 0 or c == 5) else 0.0
                val = round(max(0.15, min(0.92, base_ndvi - edge_penalty + random.uniform(-0.06, 0.06))), 2)
                row.append(val)
                all_vals.append(val)
            grid.append(row)

        mean_ndvi = round(sum(all_vals) / len(all_vals), 2)
        min_ndvi = min(all_vals)
        max_ndvi = max(all_vals)

        # NDWI water index (-1.0 to 1.0)
        mean_ndwi = round(mean_ndvi * 0.45 - 0.12, 2)

        if mean_ndvi >= 0.70:
            vigor = "VIGOROUS (Kanopi Lebat & Hijau Sempurna)"
        elif mean_ndvi >= 0.50:
            vigor = "MODERATE_HEALTH (Kondisi Kanopi Sehat Wajar)"
        elif mean_ndvi >= 0.30:
            vigor = "STRESSED (Indikasi Stres Air / Kekurangan Hara)"
        else:
            vigor = "BARE_SOIL (Tutupan Kanopi Minim / Tanah Terbuka)"

        canopy_cov = round(min(98.5, max(25.0, mean_ndvi * 115.0)), 1)
        chlorophyll = round(mean_ndvi * 42.0, 1)

        return FieldNdviProfile(
            field_id=field_id,
            field_name=field_name,
            crop=crop,
            mean_ndvi=mean_ndvi,
            min_ndvi=min_ndvi,
            max_ndvi=max_ndvi,
            mean_ndwi_water_index=mean_ndwi,
            vegetation_vigor_status=vigor,
            canopy_coverage_pct=canopy_cov,
            chlorophyll_content_index=chlorophyll,
            spatial_raster_grid=grid,
            satellite_source="Copernicus Sentinel-2B MSI (Level-2A BOA)",
            acquisition_date=(datetime.datetime.now() - datetime.timedelta(days=2)).strftime("%d %B %Y"),
            cloud_cover_pct=3.2
        )

satellite_engine = SatelliteNdviEngine()
