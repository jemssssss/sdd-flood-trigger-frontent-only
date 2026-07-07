import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import RainStationPopup from "./StationPopup";

function StationLayer({
  map,
  popup,
  stations,
  layerId,
  sourceId,
  visible = true,
}) {

  useEffect(() => {

    if (!map.current) return;

    const geojson = {
      type: "FeatureCollection",
      features: stations.map((station) => ({
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

    const addOrUpdate = () => {

      if (map.current.getSource(sourceId)) {

        map.current
          .getSource(sourceId)
          .setData(geojson);

      }

      else {

        map.current.addSource(sourceId, {
          type: "geojson",
          data: geojson
        });

        map.current.addLayer({

          id: layerId,

          type: "circle",

          source: sourceId,

          layout: {
            visibility:
              visible
                ? "visible"
                : "none"
          },

          paint: {

            "circle-radius": [
              "step",
              ["get", "rainfallMm"],
              5,
              1, 7,
              60, 11,
              180, 13
            ],

            "circle-color": [
              "step",
              ["get", "rainfallMm"],
              "#d6eaf8",
              1, "#00e100",
              60, "#ffaa00",
              180, "#ff0000"
            ],

            "circle-opacity": 1,

            "circle-stroke-width": 2,

            "circle-stroke-color": "#ffffff"

          }

        });

        map.current.on(
          "click",
          layerId,
          (e) => {

            e.originalEvent.stopPropagation();

            const feature =
              e.features[0];

            const popupNode =
              document.createElement("div");

            const root =
              createRoot(popupNode);

            root.render(

              <RainStationPopup
                station={feature.properties}
              />

            );

            popup.current
              .setLngLat(
                feature.geometry.coordinates
              )
              .setDOMContent(popupNode)
              .addTo(map.current);

          }
        );

        map.current.on(
          "mouseenter",
          layerId,
          () => {
            map.current
              .getCanvas()
              .style.cursor = "pointer";
          }
        );

        map.current.on(
          "mouseleave",
          layerId,
          () => {
            map.current
              .getCanvas()
              .style.cursor = "";
          }
        );

      }

    };

    if (!map.current.isStyleLoaded()) {

      map.current.once(
        "load",
        addOrUpdate
      );

    }

    else {

      addOrUpdate();

    }

  }, [stations, visible]);

  return null;

}

export default StationLayer;