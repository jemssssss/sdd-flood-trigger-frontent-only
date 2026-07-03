# Space Data Dashboard (SDD) Flood Trigger

A web-based rainfall visualization dashboard built with **React**, **Vite**, and **MapLibre GL JS**. The application retrieves rainfall observations from the **Panahon API**, visualizes rainfall stations across the Philippines, and computes the average rainfall within Sentinel-1 footprint polygons by sampling gridded rainfall values.

> **Note**
>
> This application visualizes **rainfall observations only**. It does **not** represent flood extent, flood susceptibility, or flood risk.

---

# Features

- Interactive MapLibre map centered on the Philippines
- Fetches rainfall station observations from the Panahon API
- Normalizes raw API responses into a consistent station object model
- Displays rainfall stations using color- and size-based symbology
- Interactive rainfall station popups
- Interactive Sentinel-1 footprint polygon popups
- Computes average rainfall inside each footprint using sampled grid points
- Rainfall legend
- Loading, error, and empty states during data retrieval

---

# Tech Stack

| Technology | Version |
|------------|---------|
| Node.js | v22.20.0 |
| npm | 10.9.3 |
| Vite | 8.1.0 |
| React | 19.2.7 |
| MapLibre GL JS | Latest compatible version |
| Turf.js | Latest compatible version |

---

# Prerequisites

Install:

- Node.js (v22.20.0 or newer recommended)
- npm (v10.9.3 or newer)

Verify the installation:

```bash
node -v
npm -v
```

---

# Project Setup

Clone the repository:

```bash
git clone https://github.com/jemssssss/sdd-flood-trigger.git
cd sdd-flood-trigger
```

---

# Environment Variables

Create a `.env` file in the project root.

```env
VITE_PANAHON_API_TOKEN=YOUR_API_TOKEN
```

Obtain a valid **Panahon API token** from your project supervisor.

---

## Do NOT Commit the API Token

Ensure `.env` is ignored by Git.

```gitignore
.env
```

A sample `.env.example` may be committed:

```env
VITE_PANAHON_API_TOKEN=
```

---

# Installation

Install project dependencies.

```bash
npm install
```

---

# Running the Application

Start the development server.

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# Project Structure

```text
src/
├── components/
│   ├── FootprintPopup.jsx
│   ├── MapView.jsx
│   ├── RainLegend.jsx
│   └── RainStationPopup.jsx
│
├── services/
│   └── panahonApi.js
│
├── utils/
│   ├── footprintSampler.js
│   ├── rainParser.js
│   └── timeUtils.js
│
├── styles/
│   ├── App.css
│   └── index.css
│
├── App.jsx
└── main.jsx

public/
└── data/
    └── s1a_footprints.geojson
```

---

# Application Workflow

```text
                      Panahon API
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
   /api/v1/synop                 /api/v1/tiles/point
         │                                   │
         ▼                                   ▼
 fetchRainSynop()                 sampleFootprint()
         │                                   │
         ▼                                   │
 parseRainStations()                         │
         │                                   │
         ▼                                   │
 Rainfall Stations                Average Rainfall per Polygon
         └──────────────┬────────────────────┘
                        │
                        ▼
                    App.jsx
                        │
                        ▼
                    MapView.jsx
                        │
                        ▼
            MapLibre GL JS Visualization
```

---

# Panahon API Integration

## Rainfall Stations

The application retrieves observed rainfall stations using:

```text
https://www.panahon.gov.ph/api/v1/synop?token=<TOKEN>&parameter=rain
```

---

## Rainfall Grid Sampling

Average rainfall for Sentinel-1 footprints is computed by sampling the Panahon gridded rainfall endpoint.

```text
https://www.panahon.gov.ph/api/v1/tiles/point?url=prate&t=<YYYY>-<MM>-<DD>T<HH>:00:00&lon=<longitude>&lat=<latitude>&token=<TOKEN>
```

Parameters include:

- latitude
- longitude
- forecast timestamp (`t`)
- API token

The application automatically generates the latest available forecast hour when requesting sampled rainfall values.

---

# Raw API Response

Example rainfall station response:

```json
{
  "success": true,
  "data": [
    {
      "site_id": "132",
      "site_name": "ITBAYAT, BATANES",
      "lat": "20.79000758",
      "lon": "121.8396475",
      "value": "0",
      "parameter": "rain",
      "observed_at": "2026-06-30 14:00:00",
      "readable_parameter": "3 Hourly Rain",
      "readable_unit": "mm"
    }
  ]
}
```

---

# Normalized Rainfall Station Object

Before visualization, the API response is converted into a standardized format.

```javascript
{
  id: "132",
  stationName: "ITBAYAT, BATANES",
  latitude: 20.79000758,
  longitude: 121.8396475,
  rainfallMm: 0,
  observedAt: "2026-06-30 14:00:00",
  raw: { ... }
}
```

---

# API Field Mapping

| Panahon API | Parsed Field | Description |
|-------------|--------------|-------------|
| `site_id` | `id` | Station identifier |
| `site_name` | `stationName` | Station name |
| `lat` | `latitude` | Latitude |
| `lon` | `longitude` | Longitude |
| `value` | `rainfallMm` | Rainfall amount (millimeters) |
| `observed_at` | `observedAt` | Observation timestamp |

The original API response is preserved in the `raw` property.

---

# Rainfall Station Visualization

Stations are rendered as MapLibre circle layers.

Both **circle size** and **color** represent rainfall intensity.

| Rainfall (mm) | Category |
|--------------:|----------|
| 0 | No observed rain |
| 1–10 | Light rainfall |
| 10–25 | Moderate rainfall |
| 25–50 | Heavy rainfall |
| >50 | Very heavy rainfall |

---

# Sentinel-1 Footprints

Sentinel-1 acquisition footprints are loaded from a GeoJSON file.

Each footprint:

- is rendered as a polygon
- is colored using its computed average rainfall
- can be clicked to display a popup

Each popup displays:

- Tile number
- Average sampled rainfall (mm)
- Observation time

---

# Average Rainfall Computation

Each footprint's rainfall value is computed using the following workflow:

1. Random sample points are generated inside the footprint polygon.
2. Each sample point requests rainfall from the Panahon grid endpoint.
3. Sampled rainfall values are averaged.
4. The average rainfall is stored as:

```javascript
feature.properties.averageRainfall
```

This value is then used for both visualization and popup information.

---

# Rainfall Station Popups

Clicking a rainfall station displays:

- Station name
- Rainfall amount (mm)
- Observation time
- Latitude
- Longitude

---

# Loading States

The application provides user feedback while fetching data.

- Loading
- Error
- Empty state

---

# Development Notes

- React manages application state.
- MapLibre GL JS renders all spatial layers.
- Turf.js generates random sample points inside polygons.
- Rainfall stations are normalized before visualization.
- Footprint rainfall is computed dynamically from sampled Panahon grid values.
- Forecast timestamps are generated dynamically using `timeUtils.js`.
- Environment variables are accessed using `import.meta.env`.

---

# Troubleshooting

## Missing API Token

```
Missing VITE_PANAHON_API_TOKEN
```

Verify that:

- `.env` exists
- `VITE_PANAHON_API_TOKEN` is defined
- the Vite server has been restarted

---

## Style is not done loading

```
Style is not done loading.
```

Sources and layers should only be added after the MapLibre style has finished loading.

---

## No Rainfall Stations Displayed

Verify:

- the API token is valid
- the Panahon API request succeeds
- parsed stations contain valid coordinates
- browser Developer Tools report no errors

---

## Footprint Rainfall Values Look Incorrect

The sampled rainfall endpoint requires a valid forecast timestamp (`t`).

The application automatically generates the latest available forecast hour before requesting rainfall values. If the returned rainfall appears outdated, verify that the generated forecast time matches the latest dataset available from the Panahon API.

---