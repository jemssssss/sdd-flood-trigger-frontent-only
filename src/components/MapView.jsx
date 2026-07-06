import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import StationLayer from "./StationLayer";
import StationPopup from "./StationPopup";
import FootprintPopup from "./FootprintPopup";
import maplibregl from "maplibre-gl";
import bbox from "@turf/bbox";
import "maplibre-gl/dist/maplibre-gl.css";

function MapView({ synopticStations, awsStations, showSynoptic, showAWS, footprints, showFootprints }) {
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

  // helper function
  function buildStationGeoJSON(stations) {
    return {
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
          stationType: station.stationType,
        },
        geometry: {
          type: "Point",
          coordinates: [
            station.longitude,
            station.latitude
          ]
        }
      }))
    };
  }

  function updateStationLayer(
    map,
    layerId,
    sourceId,
    stations,
    popupRef,
    otherPopupRef
  ) {
    const geojson = buildStationGeoJSON(stations);

    if (map.getSource(sourceId)) {
      map.getSource(sourceId).setData(geojson);
      return;
    }

    map.addSource(sourceId, {
      type: "geojson",
      data: geojson,
    });

    map.addLayer({
      id: layerId,
      type: "circle",
      source: sourceId,

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

    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });

    map.on("click", layerId, (e) => {

      e.originalEvent.stopPropagation();

      const feature = e.features[0];

      const popupNode = document.createElement("div");

      const root = createRoot(popupNode);

      root.render(
        <StationPopup
          station={feature.properties}
        />
      );

      otherPopupRef.current.remove();

      popupRef.current
        .setLngLat(feature.geometry.coordinates)
        .setDOMContent(popupNode)
        .addTo(map);
    });
  }

  /* Render synoptic stations */
  useEffect(() => {

    if (!map.current) return;

    const render = () => {

      updateStationLayer(
        map.current,
        "synoptic-layer",
        "synoptic-source",
        synopticStations,
        stationPopup,
        footprintPopup
      );

      map.current.setLayoutProperty(
        "synoptic-layer",
        "visibility",
        showSynoptic ? "visible" : "none"
      );
    };

    if (!map.current.isStyleLoaded())
      map.current.once("load", render);
    else
      render();

  }, [synopticStations, showSynoptic]);

  /* Render AWS stations */
  useEffect(() => {

    if (!map.current) return;

    const render = () => {

      updateStationLayer(
        map.current,
        "aws-layer",
        "aws-source",
        awsStations,
        stationPopup,
        footprintPopup
      );

      map.current.setLayoutProperty(
        "aws-layer",
        "visibility",
        showAWS ? "visible" : "none"
      );
    };

    if (!map.current.isStyleLoaded())
      map.current.once("load", render);
    else
      render();

  }, [awsStations, showAWS]);

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
        
        if (map.current.getLayer("synoptic-layer")) {
          map.current.moveLayer("synoptic-layer");
        }

        if (map.current.getLayer("aws-layer")) {
          map.current.moveLayer("aws-layer");
        }

        map.current.on("click", "footprints-fill", (e) => {

        // If a rainfall station exists at this location,
        // don't open the footprint popup.
        const stations = map.current.queryRenderedFeatures(
          e.point,
          {
            layers: ["synoptic-layer", "aws-layer"]
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

      if (map.current.getLayer("footprints-fill")) {

        map.current.setLayoutProperty(
          "footprints-fill",
          "visibility",
          showFootprints
            ? "visible"
            : "none"
        );

      }

      if (map.current.getLayer("footprints-outline")) {

        map.current.setLayoutProperty(
          "footprints-outline",
          "visibility",
          showFootprints
            ? "visible"
            : "none"
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

    if (map.current.getLayer("synoptic-layer")) {
      map.current.moveLayer("synoptic-layer");
    }

    if (map.current.getLayer("aws-layer")) {
      map.current.moveLayer("aws-layer");
    }

    if (map.current.isStyleLoaded()) {
      addOrUpdateFootprints();
    } else {
      map.current.once("load", addOrUpdateFootprints);
    }

}, [footprints, showFootprints]);

/* Clean up when the component unmounts */
useEffect(() => {
  return () => {
    stationPopup.current?.remove();
    footprintPopup.current?.remove();
  };
}, []);

  return (
  <>

    <StationLayer
      map={map}
      popup={stationPopup}
      stations={synopticStations}
      layerId="synoptic-layer"
      sourceId="synoptic-source"
    />

    <div
      ref={mapContainer}
      style={{
        width: "100%",
        height: "100%"
      }}
    />

  </>
);
}

export default MapView;