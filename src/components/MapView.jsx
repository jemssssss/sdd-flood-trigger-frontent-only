import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import RainStationPopup from "./RainStationPopup";
import FootprintPopup from "./FootprintPopup";
import maplibregl from "maplibre-gl";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";

function MapView({ stations, footprints }) {
  /* Map general settings */
  const mapContainer = useRef(null);
  const map = useRef(null);

  const hasFitBounds = useRef(false);

  const stationPopup = useRef(null);
  const footprintPopup = useRef(null);

  // Initialize the map only once
  useEffect(() => {
    if (map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
      center: [121.774, 12.8797],
      zoom: 5,
    });

    map.current.addControl(
      new maplibregl.NavigationControl(),
      "top-right"
    );

    stationPopup.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
    });

    footprintPopup.current = new maplibregl.Popup({
      closeButton: true,
      closeOnClick: true,
    });
  }, []);

  /* Rendered rainfall stations*/
  // Update rainfall layer whenever stations change
  useEffect(() => {
    if (!map.current) return;

    // Obtain parameters
    const geojson = {
      type: "FeatureCollection",
      features: stations.map((station) => ({
        type: "Feature",
        properties: {
          id: station.id,
          stationName: station.stationName,
          rainfallMm: station.rainfallMm,
          observedAt: station.observedAt,
          latitude: station.latitude,
          longitude: station.longitude,
        },
        geometry: {
          type: "Point",
          coordinates: [station.longitude, station.latitude],
        },
      })),
    };

    const updateRainfallLayer = () => {

      if (map.current.getSource("rainfall")) {
        map.current.getSource("rainfall").setData(geojson);

        // Always keep rainfall stations above polygons
        if (map.current.getLayer("rainfall-layer")) {
          map.current.moveLayer("rainfall-layer");
        }

        return;
      }

      map.current.addSource("rainfall", {
        type: "geojson",
        data: geojson,
      });

      map.current.addLayer({
        id: "rainfall-layer",
        type: "circle",
        source: "rainfall",
        paint: {
          "circle-radius": [
            "step",
            ["get", "rainfallMm"],
            5,
            1, 7,
            10, 9,
            25, 11,
            50, 13
          ],
          "circle-color": [
            "step",
            ["get", "rainfallMm"],
            "#d6eaf8",
            1, "#00e100",
            10, "#ffff00",
            25, "#ffaa00",
            50, "#ff0000"
          ],
          "circle-opacity": 1,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff"
        }

      });

      map.current.on("click", "rainfall-layer", (e) => {
        e.originalEvent.stopPropagation();

        const feature = e.features[0];
        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        root.render(
          <RainStationPopup
            station={feature.properties}
          />
        );

        footprintPopup.current.remove();

        stationPopup.current
          .setLngLat(feature.geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map.current);

      });

      map.current.on("mouseenter", "rainfall-layer", () => {
        map.current.getCanvas().style.cursor = "pointer";
      });

      map.current.on("mouseleave", "rainfall-layer", () => {
        map.current.getCanvas().style.cursor = "";
      });

    };

    if (!map.current.isStyleLoaded()) {
      map.current.once("load", updateRainfallLayer);
    } else {
      updateRainfallLayer();
    }

  }, [stations]);

  /* Rendered polygons */
  useEffect(() => {

    if (!map.current || !footprints) return;

    // Update and add layer
    const addOrUpdateFootprints = () => {

      if (map.current.getSource("footprints")) {

        map.current
          .getSource("footprints")
          .setData(footprints);

      } else {

        map.current.addSource("footprints", {
          type: "geojson",
          data: footprints,
        });

        map.current.addLayer({
          id: "footprints-fill",
          type: "fill",
          source: "footprints",
          paint: {
            "fill-color": [
              "step",
              ["coalesce", ["get", "averageRainfall"], 0],
              "#eef7ff",
              1, "#00e100",
              10, "#ffff00",
              25, "#ffaa00",
              50, "#ff0000"
            ],
            "fill-opacity": 0.30
          },
        });

        map.current.addLayer({
          id: "footprints-outline",
          type: "line",
          source: "footprints",
          paint: {
            "line-color": "#1f78b4",
            "line-width": 2,
          },
        });
        
        if (map.current.getLayer("rainfall-layer")) {
          map.current.moveLayer("rainfall-layer");
        }

        map.current.on("click", "footprints-fill", (e) => {

        // If a rainfall station exists at this location,
        // don't open the footprint popup.
        const stations = map.current.queryRenderedFeatures(
          e.point,
          {
            layers: ["rainfall-layer"]
          }
        );

        if (stations.length > 0) {
          return;
        }

        const feature = e.features[0];
        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        root.render(
          <FootprintPopup
            footprint={feature.properties}
          />
        );

        stationPopup.current.remove();

        footprintPopup.current
          .setLngLat(e.lngLat)
          .setDOMContent(popupNode)
          .addTo(map.current);

      });

        map.current.on("mouseenter", "footprints-fill", () => {
          map.current.getCanvas().style.cursor = "pointer";
        });

        map.current.on("mouseleave", "footprints-fill", () => {
          map.current.getCanvas().style.cursor = "";
        });
      }

      if (map.current.getLayer("footprints-fill")) {

        map.current.setPaintProperty(
          "footprints-fill",
          "fill-color",
          [
            "step",
            ["coalesce", ["get", "averageRainfall"], 0],

            "#eef7ff",
            1, "#00e100",
            10, "#ffff00",
            25, "#ffaa00",
            50, "#ff0000"
          ]
        );

      }

      // Fit map to polygons
      
      if (!hasFitBounds.current) {

        const bounds = bbox(footprints);

        map.current.fitBounds(bounds, {
          padding: 40,
          duration: 1000,
        });

        hasFitBounds.current = true;
      }
    };

    if (map.current.getLayer("rainfall-layer")) {
      map.current.moveLayer("rainfall-layer");
    }

    if (map.current.isStyleLoaded()) {
      addOrUpdateFootprints();
    } else {
      map.current.once("load", addOrUpdateFootprints);
    }

}, [footprints]);

/* Clean up when the component unmounts */
useEffect(() => {
  return () => {
    stationPopup.current?.remove();
    footprintPopup.current?.remove();
  };
}, []);

  return (
    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%",
      }}
    />
  );
}

export default MapView;