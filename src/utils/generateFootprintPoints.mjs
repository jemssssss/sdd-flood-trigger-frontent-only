import fs from "fs";
import * as turf from "@turf/turf";

const SAMPLE_POINTS = Number(import.meta.env.SAMPLING_POINTS ?? 15);

const geojson = JSON.parse(
  fs.readFileSync("./public/data/s1a_footprints.geojson", "utf8")
);

const output = [];

for (const feature of geojson.features) {

  const bbox = turf.bbox(feature);

  const points = [];

  while (points.length < SAMPLE_POINTS) {

    const random = turf.randomPoint(1, { bbox });

    const point = random.features[0];

    if (!turf.booleanPointInPolygon(point, feature)) {
      continue;
    }

    const [lon, lat] = point.geometry.coordinates;

    points.push({
      lat,
      lon
    });
  }

  output.push({
    tile: feature.properties.TileNumber,
    samplePoints: points
  });
}

fs.writeFileSync(
  "./public/data/footprintSamplePoints.json",
  JSON.stringify(output, null, 2)
);

console.log("Sample points generated.");