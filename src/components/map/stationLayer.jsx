import { createRoot } from "react-dom/client";
import StationPopup from "../StationPopup";

export function updateStationLayer({
  map,
  stations,
  sourceId,
  layerId,
  popup,
  otherPopup,
  visible
}) {

  const geojson = {
    type: "FeatureCollection",
    features: stations.map(station => ({
      type: "Feature",
      properties: station,
      geometry: {
        type: "Point",
        coordinates: [
          station.longitude,
          station.latitude
        ]
      }
    }))
  };

  if (map.getSource(sourceId)) {
    map.getSource(sourceId).setData(geojson);

  } else {

    map.addSource(sourceId,{
      type:"geojson",
      data:geojson
    });

    map.addLayer({
      id:layerId,
      type:"circle",
      source:sourceId,
      paint:{
        "circle-radius":[
          "step",
          ["get","rainfallMm"],
          5,
          1,7,
          60,11,
          180,13
        ],
          "circle-color":[
            "step",
            ["get","rainfallMm"],
            "#d6eaf8",
            1,"#00e100",
            60,"#ffaa00",
            180,"#ff0000"
          ],
          "circle-stroke-width":2,
          "circle-stroke-color":"white"
        }
      });

      map.on("mouseenter", layerId, () => {
        map.getCanvas().style.cursor = "pointer";
      });

      map.on("mouseleave", layerId, () => {
        map.getCanvas().style.cursor = "";
      });

      map.on("click", layerId, e => {

        e.originalEvent.stopPropagation();

        const popupNode = document.createElement("div");
        const root = createRoot(popupNode);

        root.render(
          <StationPopup
            station={e.features[0].properties}
          />
        );

        otherPopup.current.remove();

        popup.current
          .setLngLat(e.features[0].geometry.coordinates)
          .setDOMContent(popupNode)
          .addTo(map);

      });

  }

  if (map.getLayer(layerId)) {

    map.setLayoutProperty(
      layerId,
      "visibility",
      visible ? "visible" : "none"
    );

  }

}