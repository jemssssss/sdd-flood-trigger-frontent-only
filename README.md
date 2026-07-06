# Space Data Dashboard (SDD) Flood Trigger

A web-based rainfall visualization dashboard built with **React**, **Vite**, and **MapLibre GL JS**. The application retrieves both **Synoptic Station** and **Automatic Weather Station (AWS)** rainfall observations from the **Panahon API**, visualizes them as interactive map layers, and computes the average forecast rainfall within Sentinel-1 footprint polygons using pre-generated sampling points.

![SDD Flood Trigger Preview](/docs/dashboard_preview.png)

> **Note**
>
> This application visualizes **rainfall observations and forecast rainfall only**. It does **not** represent flood extent, flood susceptibility, or flood risk.

---

# Features

- Interactive MapLibre map centered on the Philippines
- Displays Synoptic Station rainfall observations (3-hour accumulated rainfall)
- Displays AWS rainfall observations (24-hour accumulated rainfall)
- Layer control panel for toggling:
  - Synoptic Stations
  - AWS Stations
  - Sentinel-1 Footprints
- Displays Sentinel-1 footprint polygons
- Computes average forecast rainfall for every footprint
- Uses pre-generated sampling points for reproducible rainfall averaging
- Parallel rainfall sampling using `Promise.all()`
- Color-coded rainfall stations
- Color-coded footprint polygons
- Interactive station popups
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

Create a `.env` file.

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

A sample `.env.example` may be committed.

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

```bash
npm run dev
```

Open:

```
http://localhost:5173
```

---

# Deploying to GitHub Pages

Deploy using:

```bash
npm run deploy
```

The project is configured to deploy from the **gh-pages** branch.

> **Note**
>
> Since this application currently performs API requests entirely on the frontend, the Panahon API token is included in the production bundle. A backend proxy is recommended for production deployments.

---

# Project Structure

```text
public/
└── data/
    ├── s1a_footprints.geojson
    └── footprintSamplePoints.json

src/
├── components/
│   ├── map/
│   │   ├── footprintLayer.jsx
│   │   └── stationLayer.jsx
│   │
│   ├── LayerControl.jsx
│   ├── FootprintPopup.jsx
│   ├── MapView.jsx
│   ├── RainLegend.jsx
│   ├── StationLayer.jsx
│   └── StationPopup.jsx
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
      ┌──────────────────┼──────────────────┐
      │                  │                  │
      ▼                  ▼                  ▼
 /api/v1/synop      /api/v1/aws      /api/v1/tiles/point
      │                  │                  ▲
      ▼                  ▼                  │
 parseRainStations() parseAWSStations() Sample Points
      │                  │                  │
      ▼                  ▼                  │
 Synoptic Layer      AWS Layer      Average Footprint Rainfall
      └──────────────────┬──────────────────┘
                         │
                         ▼
                      App.jsx
                         │
                         ▼
                     MapView.jsx
                         │
                         ▼
                  MapLibre GL JS Map
```

---

# Panahon API Integration

## Synoptic Stations

Observed rainfall stations:

```text
/api/v1/synop?parameter=rain
```

Represents **3-hour accumulated rainfall**.

---

## Automatic Weather Stations (AWS)

Observed AWS stations:

```text
/api/v1/aws?parameter=accumulated_rain_1h
```

Although the endpoint returns hourly rainfall, this dashboard visualizes the **24_hr_value** field.

---

## Forecast Rainfall Sampling

Forecast rainfall is retrieved from:

```text
/api/v1/tiles/point
```

using:

- latitude
- longitude
- forecast timestamp
- API token

Forecast timestamps are generated automatically using `timeUtils.js`.

---

# Rainfall Station Types

## Synoptic Stations

Visualized using:

- `value`
- 3-hour rainfall
- rainfall station popup

---

## AWS Stations

Visualized using:

- `24_hr_value`
- 24-hour accumulated rainfall
- identical popup layout

---

# Sentinel-1 Footprints

Sentinel-1 acquisition footprints are loaded from:

```
public/data/s1a_footprints.geojson
```

Each footprint:

- displays average forecast rainfall
- is color-coded
- supports interactive popups

---

# Sampling Points

Each footprint uses pre-generated sample coordinates stored in:

```
public/data/footprintSamplePoints.json
```

Advantages:

- deterministic results
- improved performance
- reproducible averages
- easy increase in sampling density

---

# Average Rainfall Computation

For every footprint:

1. Load predefined sample points.
2. Fetch rainfall at every point.
3. Execute requests concurrently.
4. Compute the arithmetic mean.
5. Store as:

```javascript
feature.properties.averageRainfall
```

---

# Layer Controls

The dashboard includes a control panel that allows users to independently toggle:

- Synoptic Stations
- AWS Stations
- Sentinel-1 Footprints

Layer visibility is managed using MapLibre's `layout.visibility` property without reloading map sources.

---

# Station Popups

Clicking either a Synoptic or AWS station displays:

- Station name
- Rainfall amount
- Observation time
- Latitude
- Longitude

The rainfall label automatically changes depending on station type:

- Synoptic → **Rainfall (3h)**
- AWS → **Rainfall (24h)**

---

# Footprint Popups

Clicking a Sentinel-1 footprint displays:

- Tile Number
- Average Forecast Rainfall (mm)

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
- Layer rendering has been modularized into dedicated map layer components.
- Turf.js generated the initial sampling points.
- Sampling points are reused between application runs.
- Forecast rainfall requests execute concurrently using `Promise.all()`.
- Forecast timestamps are generated dynamically.
- API responses are normalized before visualization.
- Environment variables are accessed using `import.meta.env`.

---

# Troubleshooting

## Missing API Token

```
Missing VITE_PANAHON_API_TOKEN
```

Verify:

- `.env` exists
- the token is defined
- the development server has been restarted

---

## Style is not done loading

```
Style is not done loading
```

Ensure MapLibre sources and layers are only added after the map's `load` event.

---

## GitHub Pages Displays a Blank Page

Verify:

- `vite.config.js` contains the correct `base` path
- assets use `import.meta.env.BASE_URL`
- GitHub Pages is configured to deploy from the `gh-pages` branch
- redeploy using:

```bash
npm run deploy
```

---

## No Stations Displayed

Verify:

- the API token is valid
- the Panahon API requests succeed
- valid coordinates are returned
- browser Developer Tools report no JavaScript errors

---

## Incorrect Footprint Rainfall

Verify:

- the generated forecast timestamp matches the latest available forecast
- `footprintSamplePoints.json` contains valid coordinates
- the Panahon forecast endpoint returns valid values

---