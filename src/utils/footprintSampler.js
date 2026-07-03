import * as turf from "@turf/turf";
import { fetchPointRainfall } from "../services/panahonApi";

const SAMPLE_POINTS = 7;

export async function sampleFootprint(feature, forecastTime) {

  const bbox = turf.bbox(feature);

  const sampledPoints = [];

  // Generate random points first
  while (sampledPoints.length < SAMPLE_POINTS) {

    const random = turf.randomPoint(1, { bbox });

    const point = random.features[0];

    if (!turf.booleanPointInPolygon(point, feature)) {
      continue;
    }

    sampledPoints.push(point);
  }

  // Fetch rainfall for all sampled points simultaneously
  const rainfallValues = await Promise.all(

    sampledPoints.map(async (point) => {

      const [lon, lat] = point.geometry.coordinates;

      return fetchPointRainfall(
        lat,
        lon,
        forecastTime
      );

    })

  );

  const averageRainfall =
    rainfallValues.reduce((sum, value) => sum + value, 0) /
    rainfallValues.length;

  return {
    averageRainfall,
    rainfallValues,
    sampledPoints
  };

}