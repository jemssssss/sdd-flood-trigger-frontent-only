# Space Data Dashboard (SDD) Flood Trigger

A web-based rainfall visualization dashboard built with **React**, **Vite**, and **MapLibre GL JS**. The application retrieves rainfall observations from the **Panahon API**, visualizes rainfall stations across the Philippines, and computes the average forecast rainfall within Sentinel-1 footprint polygons using pre-generated sampling points.

![SDD Flood Trigger Preview](/docs/dashboard_preview.png)

> **Note**
>
> This application visualizes **rainfall observations and forecast rainfall only**. It does **not** represent flood extent, flood susceptibility, or flood risk.

---

# Features

- Interactive MapLibre map centered on the Philippines
- Displays observed rainfall stations from the Panahon API
- Displays Sentinel-1 footprint polygons
- Computes average forecast rainfall for every footprint
- Uses pre-generated sampling points for consistent rainfall averaging
- Parallel rainfall sampling for improved loading performance
- Color-coded rainfall stations
- Color-coded footprint polygons
- Interactive rainfall station popups
- Interactive footprint popups
- Rainfall legend
- Loading, error, and empty states

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

Verify installation:

```bash
node -v
npm -v
```

---

# Project Setup

Clone the repository.

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

Obtain a valid Panahon API token from your project supervisor.

---

## Do NOT Commit the API Token

Ensure `.env` is ignored.

```gitignore
.env
```

A sample `.env.example` file may be committed.

```env
VITE_PANAHON_API_TOKEN=
```

---

# Installation

Install dependencies.

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

# Deploying to GitHub Pages

Build and deploy the application.

```bash
npm run deploy
```

The project is configured to deploy from the `gh-pages` branch.

> **Note**
>
> Because this project currently runs entirely in the frontend, the Panahon API token is bundled into the production build. For production deployments, API requests should ideally be proxied through a backend service.

---

# Project Structure

```text
public/
└── data/
    ├── s1a_footprints.geojson
    └── footprintSamplePoints.json

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
│   ├── generateFootprintPoints.mjs
│   ├── rainParser.js
│   └── timeUtils.js
│
├── styles/
│   ├── App.css
│   └── index.css
│
├── App.jsx
└── main.jsx
```

---

# Application Workflow

```text
                     Panahon API
                          │
        ┌─────────────────┴──────────────────┐
        │                                    │
        ▼                                    ▼
 /api/v1/synop                     /api/v1/tiles/point
        │                                    ▲
        ▼                                    │
 fetchRainSynop()             Pre-generated Sample Points
        │                                    │
        ▼                                    │
 parseRainStations()                         │
        │                                    │
        ▼                                    │
 Rainfall Stations            Average Rainfall per Footprint
        └─────────────────────┬──────────────┘
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

Observed rainfall stations are retrieved using:

```text
https://www.panahon.gov.ph/api/v1/synop?token=<TOKEN>&parameter=rain
```

---

## Forecast Rainfall Sampling

Forecast rainfall values are retrieved from:

```text
https://www.panahon.gov.ph/api/v1/tiles/point?url=prate&t=<YYYY-MM-DDTHH:00:00>&lat=<latitude>&lon=<longitude>&token=<TOKEN>
```

Each request requires:

- latitude
- longitude
- forecast timestamp (`t`)
- API token

The forecast timestamp is generated automatically using `timeUtils.js`.

---

# Raw API Response

Example rainfall station response.

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
| site_id | id | Station identifier |
| site_name | stationName | Station name |
| lat | latitude | Latitude |
| lon | longitude | Longitude |
| value | rainfallMm | Rainfall amount (millimeters) |
| observed_at | observedAt | Observation timestamp |

The original API object is preserved in the `raw` property.

---

# Rainfall Station Visualization

Stations are rendered as MapLibre circle layers.

Both circle size and color represent rainfall intensity.

| Rainfall (mm) | Category |
|--------------:|----------|
| 0 | No observed rain |
| 1–10 | Light rainfall |
| 10–25 | Moderate rainfall |
| 25–50 | Heavy rainfall |
| >50 | Very heavy rainfall |

---

# Sentinel-1 Footprints

Sentinel-1 acquisition footprints are loaded from a GeoJSON dataset.

Each footprint:

- is rendered as a polygon
- is colored by average forecast rainfall
- can be clicked to display additional information

Each popup displays:

- Tile number
- Average rainfall (mm)

---

# Sampling Points

Instead of generating random sampling points every time the application starts, each footprint uses a fixed set of pre-generated sample coordinates stored in:

```text
public/data/footprintSamplePoints.json
```

Advantages include:

- Consistent rainfall calculations
- Faster startup
- Reproducible results
- Easy to increase sampling density in the future

---

# Average Rainfall Computation

For every footprint:

1. Load its predefined sampling points.
2. Request forecast rainfall for each point.
3. Execute all point requests in parallel.
4. Compute the arithmetic mean.
5. Store the result as:

```javascript
feature.properties.averageRainfall
```

The average rainfall is then used for:

- polygon coloring
- popup information

---

# Rainfall Station Popups

Clicking a rainfall station displays:

- Station name
- Rainfall amount
- Observation time
- Latitude
- Longitude

---

# Loading States

The application provides feedback during data retrieval.

- Loading
- Error
- Empty state

---

# Development Notes

- React manages application state.
- MapLibre GL JS renders all spatial layers.
- Turf.js was used to generate the initial sampling points.
- Sampling points are reused across application runs.
- Rainfall station data are normalized before visualization.
- Forecast rainfall is retrieved from the Panahon gridded rainfall endpoint.
- Footprint rainfall requests are executed concurrently using `Promise.all()`.
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
- the development server has been restarted

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

Verify that:

- the generated forecast timestamp matches the most recent available dataset
- the sampling points file contains valid coordinates
- the Panahon forecast endpoint returns valid rainfall values

---

## GitHub Pages Shows a Blank Page or 404 Errors

Verify that:

- `vite.config.js` uses the correct `base` path matching the repository name
- static assets are referenced using `import.meta.env.BASE_URL`
- GitHub Pages is configured to deploy from the `gh-pages` branch
- the application has been rebuilt and redeployed using:

```bash
npm run deploy
```