import { fetchPointRainfall } from "../services/panahonApi";

export async function sampleFootprint(
  feature,
  samplePoints,
  forecastTime
) {

  const tile = feature.properties.TileNumber;

  const samples =
    samplePoints.find(item => item.tile === tile);

  if (!samples) {
    throw new Error(`No sample points for ${tile}`);
  }

  const rainfallValues = await Promise.all(

    samples.samplePoints.map(point =>
      fetchPointRainfall(
        point.lat,
        point.lon,
        forecastTime
      )
    )

  );

  const averageRainfall =
    rainfallValues.reduce((a, b) => a + b, 0) /
    rainfallValues.length;

  return {

    averageRainfall,

    rainfallValues,

    sampledPoints: samples.samplePoints

  };

}