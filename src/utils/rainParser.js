export function parseRainStations(rawData, type = "synoptic") {

  const items = Array.isArray(rawData)
    ? rawData
    : rawData?.data || rawData?.results || [];

  return items
    .map((item, index) => {

      const latitude = Number(item.latitude ?? item.lat);
      const longitude = Number(item.longitude ?? item.lon ?? item.lng);

      if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      ) {
        return null;
      }

      // Synoptic = 3-hour rainfall
      // AWS = 24-hour rainfall
      const rainfallMm =
        type === "aws"
          ? Number(item["24_hr_value"] ?? 0)
          : Number(item.value ?? 0);

      return {

        id:
          item.id ??
          item.site_id ??
          item.station_id ??
          `station-${index}`,

        stationName:
          item.stationName ??
          item.site_name ??
          item.station_name ??
          item.name ??
          "Unknown Station",

        latitude,
        longitude,

        rainfallMm,

        observedAt:
          item.observedAt ??
          item.observed_at ??
          item.datetime ??
          item.timestamp ??
          null,

        readableUnit:
          item.readable_unit ??
          "mm",

        stationType: type,

        raw: item

      };

    })
    .filter(Boolean);

}