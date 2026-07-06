import "./styles/App.css";
import MapView from "./components/MapView";
import RainLegend from "./components/RainLegend";
import { useEffect, useState } from "react";
import { fetchRainSynop } from "./services/panahonApi"
import { parseRainStations } from "./utils/rainParser";
import { sampleFootprint } from "./utils/footprintSampler";
import { getLatestForecastTime } from "./utils/timeUtils";

function App() {

  const [stations, setStations] = useState([]);
  const [footprints, setFootprints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const forecastTime = getLatestForecastTime();
  console.log("Using forecast time:", forecastTime);

  useEffect(() => {
    /* Loading, Error, and Empty States */
    async function fetchStations() {
      setLoading(true);
      setError(null);

      try {
        /* Load rainfall stations */
        const response = await fetchRainSynop();

        const parsedStations = parseRainStations(response);

        console.table(parsedStations);

        setStations(parsedStations);

        /* Load polygons/footprints */
        const footprintResponse = await fetch(`${import.meta.env.BASE_URL}/data/s1a_footprints.geojson`);

        if (!footprintResponse.ok) {
          throw new Error("Failed to load S1A footprint polygons.");
        }

        const footprintData = await footprintResponse.json();

        console.log("S1A Footprints:", footprintData);

        // Load predetermined footprint points
        
        const sampleResponse = await fetch(`${import.meta.env.BASE_URL}/data/footprintSamplePoints.json`);

        if (!sampleResponse.ok) {
          throw new Error("Failed to load footprint sample points.");
        }

        const samplePoints =
          await sampleResponse.json();

        /* Compute average rainfall for every polygon */ 
        await Promise.all( 
          footprintData.features.map(async feature => {

            try {

              const result = await sampleFootprint(
                feature,
                samplePoints,
                forecastTime
              );

              feature.properties.averageRainfall =
                result.averageRainfall;

              console.log(
                feature.properties.TileNumber,
                result.averageRainfall
              );

            }

            catch (err) {

              console.error(
                "Sampling failed:",
                feature.properties.TileNumber,
                err
              );

              feature.properties.averageRainfall = null;

            }
          
          })
        );

        console.table(
          footprintData.features.map(f => ({
            tile: f.properties.TileNumber,
            rainfall: f.properties.averageRainfall
          }))
        );

        setFootprints(footprintData);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, []);

  return (
    <div className="app">
      <header className="header">
        <h1>SDD Flood Trigger Prototype</h1>
        <p>
          PAGASA/Panahon Rainfall Visualization
        </p>
      </header>

      <main className="content">
        {loading && (
          <div className="status-message">
            Loading rainfall data...
          </div>
        )}

        {!loading && error && (
          <div className="status-message error">
            {error}
          </div>
        )}

        {!loading && !error && stations.length === 0 && (
          <div className="status-message">
            No rainfall stations available.
          </div>
        )}

        {!loading && !error && stations.length > 0 && (
          <>
            <MapView 
              stations={stations}
              footprints={footprints} 
            />
            <RainLegend />
          </>
        )}
      </main>
    </div>
  );
}

export default App;