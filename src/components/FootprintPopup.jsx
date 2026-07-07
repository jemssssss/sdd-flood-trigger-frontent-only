import { getLatestTimeDate } from "../utils/timeUtils";
import { formatSensingTime } from "../utils/timeUtils";

function FootprintPopup({ footprint }) {
  const timeAndDate = getLatestTimeDate();
  const senseTime = formatSensingTime();

  return (
    <div className="popup">

      <h3>Average Panahon Forecast Rainfall / Rain Rate Sample</h3>

      <p>
        <strong>Sentinel Tile:</strong><br />
        {footprint.TileNumber}
      </p>

      <p>
        <strong>Forecast Date:</strong><br />
        {timeAndDate}
      </p>

      <p>
        <strong>Sensing Time:</strong><br />
        {senseTime}
      </p>

      <p>
        <strong>Sampling points used:</strong><br />
        {Number(import.meta.env.SAMPLING_POINTS ?? 15)}
      </p>

      <p>
        <strong>Forecast Accumulated Rainfall (24h):</strong><br />
        {Number(footprint.averageRainfall).toFixed(2)} mm
      </p>

      <p>
        Not an observed flood extent
      </p>

    </div>
  );

}

export default FootprintPopup;