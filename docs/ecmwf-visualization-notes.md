# ECMWF research task

ECMWF should be treated as research first, because forecast/weather datasets may be returned as NetCDF or GRIB and may need backend processing before visualization.

Reference link: https://www.ecmwf.int/en/computing/software/ecmwf-web-api

* **What ECMWF datasets are relevant to flood triggering?**
    * According to https://www.ecmwf.int/en/forecasts/datasets/open-data, the most relevant dataset to flood triggering would be **total precipitation (tp)**.
* **Does access require an ECMWF account or API key?**
    * According to the provided reference link, both are needed.
* **What formats are returned, such as NetCDF, GRIB, or JSON?**
    * According to the provided reference link, **all three mentioned formats can be returned** depending on the API service used.
* **Can the frontend fetch and visualize the data directly?**
    * **Not directly**, especially since React doesn't immediately understand GRIB and NetCDF (relevant for weather forecasts).
* **Or should Django/backend process it later?**
    * In relation to the previous answer, **yes**. Django should retrieve the ECMWF data, process the GRIB/NetCDF files, extract the required variables (e.g., precipitation), and expose a frontend-friendly API or map service.
* **How can NetCDF or GRIB be converted into map layers or tiles?**
    * Web browsers and MapLibre cannot natively read scientific, multidimensional NetCDF or GRIB files, hence a **tool** is needed first in order to extract the data it can read. Along with ECMWF, GDAL can also be used for a **pre-processing approach**, wherein it is used to extract specific variables or time steps from NetCDF or GRIB and convert them into GeoTIFFs or COGs. Afterwards, they are passed to tiling utilities, which cut the data into discrete, fast-loading image tiles (XYZ tiles) or vector files (MBTiles) that the frontend can easily ingest.
* **What is the easiest prototype path for SDD?**
    * ```text
    ECMWF API
        │
        ▼
    GRIB/NetCDF
        │
        ▼
    GDAL (or other geospatial tools)
        │
        ▼
    GeoTIFFs/COGs/GeoJSON
        │
        ▼
    Django
        │
        ▼
    React + MapLibre
    ```
        * This setup allows the fewest changes to the present frontend.