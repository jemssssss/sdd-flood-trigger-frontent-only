import { createRoot } from "react-dom/client";
import bbox from "@turf/bbox";
import FootprintPopup from "../FootprintPopup";

export function updateFootprintLayer({
  map,
  footprints,
  showFootprints,
  hasFitBounds,
  stationPopup,
  footprintPopup
}) {

  if (map.getSource("footprints")) {

    map.getSource("footprints").setData(footprints);

  } else {

    map.addSource("footprints", {
      type: "geojson",
      data: footprints,
    });

    map.addLayer({
      id: "footprints-fill",
      type: "fill",
      source: "footprints",
      paint: {
        "fill-color": [
          "step",
          ["coalesce", ["get", "averageRainfall"], 0],
          "#eef7ff",
          1, "#00e100",
          60, "#ffaa00",
          180, "#ff0000"
        ],
        "fill-opacity": 0.30
      },
    });

    map.addLayer({
      id: "footprints-outline",
      type: "line",
      source: "footprints",
      paint: {
        "line-color": "#1f78b4",
        "line-width": 2,
      },
    });

    if (map.getLayer("synoptic-layer")) {
      map.moveLayer("synoptic-layer");
    }

    if (map.getLayer("aws-layer")) {
      map.moveLayer("aws-layer");
    }

    map.on("click", "footprints-fill", (e) => {

      const stations = map.queryRenderedFeatures(e.point, {
        layers: ["synoptic-layer", "aws-layer"]
      });

      if (stations.length > 0) return;

      const feature = e.features[0];

      const popupNode = document.createElement("div");
      const root = createRoot(popupNode);

      root.render(
        <FootprintPopup footprint={feature.properties} />
      );

      stationPopup.current.remove();

      footprintPopup.current
        .setLngLat(e.lngLat)
        .setDOMContent(popupNode)
        .addTo(map);

    });

    map.on("mouseenter", "footprints-fill", () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "footprints-fill", () => {
      map.getCanvas().style.cursor = "";
    });

  }

  map.setPaintProperty(
    "footprints-fill",
    "fill-color",
    [
      "step",
      ["coalesce", ["get", "averageRainfall"], 0],
      "#eef7ff",
      1, "#00e100",
      60, "#ffaa00",
      180, "#ff0000"
    ]
  );

  map.setLayoutProperty(
    "footprints-fill",
    "visibility",
    showFootprints ? "visible" : "none"
  );

  map.setLayoutProperty(
    "footprints-outline",
    "visibility",
    showFootprints ? "visible" : "none"
  );

  if (!hasFitBounds.current) {

    const bounds = bbox(footprints);

    map.fitBounds(bounds, {
      padding: 40,
      duration: 1000,
    });

    hasFitBounds.current = true;

  }

}