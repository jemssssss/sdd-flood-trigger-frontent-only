import "./styles/App.css";
import MapView from "./components/MapView";
import LayerControl from "./components/LayerControl";
import RainLegend from "./components/RainLegend";
import FloodSummary from "./components/FloodSummary";
import { useEffect, useState } from "react";
import { fetchRainSynop, fetchAWSRain } from "./services/panahonApi";
import { parseRainStations } from "./utils/rainParser";
import { sampleFootprint } from "./utils/footprintSampler";
import { getAccumulationTimes } from "./utils/timeUtils";

function App() {

  const [synopticStations, setSynopticStations] = useState([]);
  const [awsStations, setAwsStations] = useState([]);
  const [footprints, setFootprints] = useState(null);
  const [floodSummary, setFloodSummary] = useState({moderate: [], heavy: []});
  const [showSynoptic, setShowSynoptic] = useState(true);
  const [showAWS, setShowAWS] = useState(true);
  const [showFootprints, setShowFootprints] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { forecastTime, initTime, hour } = getAccumulationTimes();
  console.log("Accumulation hour:", hour);
  console.log("Forecast time:", forecastTime);
  console.log("Init time:", initTime);

  useEffect(() => {
    /* Loading, Error, and Empty States */
    async function fetchStations() {
      setLoading(true);
      setError(null);

      try {
        /* Load synoptic and AWS rainfall stations */
        const [ synopticResponse, awsResponse ] = await Promise.all([ fetchRainSynop(), fetchAWSRain() ]);

        const parsedSynoptic = parseRainStations(
            synopticResponse,
            "synoptic"
          );

        const parsedAWS =
          parseRainStations(
            awsResponse,
            "aws"
          );

        console.table(parsedSynoptic);
        console.table(parsedAWS);

        setSynopticStations(parsedSynoptic);
        setAwsStations(parsedAWS);

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
                forecastTime,
                initTime
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

        const summary = {moderate: [], heavy: []};
        footprintData.features.forEach(feature => {

          const rainfall = feature.properties.averageRainfall ?? 0;
          const tile = feature.properties.TileNumber;

          if (rainfall >= 60 && rainfall <= 180) {
            summary.moderate.push(tile);
          }
          else if (rainfall > 180) {
            summary.heavy.push(tile);
          }

        });

        summary.moderate.sort();
        summary.heavy.sort();

        setFloodSummary(summary);

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

        {!loading && !error && synopticStations.length === 0 && awsStations.length === 0 && (
          <div className="status-message">
            No rainfall stations available.
          </div>
        )}

        {!loading && !error && synopticStations.length > 0 && awsStations.length > 0 && (
          <>
            <LayerControl

              showSynoptic={showSynoptic}
              setShowSynoptic={setShowSynoptic}

              showAWS={showAWS}
              setShowAWS={setShowAWS}

              showFootprints={showFootprints}
              setShowFootprints={setShowFootprints}

            />

            <FloodSummary

              summary={floodSummary}

            />

            <MapView

              synopticStations={synopticStations}
              awsStations={awsStations}

              showSynoptic={showSynoptic}
              showAWS={showAWS}
              showFootprints={showFootprints}

              footprints={footprints}

            />

            <RainLegend/>

          </>
        )}
      </main>
    </div>
  );
}

export default App;