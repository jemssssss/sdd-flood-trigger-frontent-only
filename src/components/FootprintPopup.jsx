import { getLatestTimeDate } from "../utils/timeUtils";

function FootprintPopup({ footprint }) {
  const timeAndDate = getLatestTimeDate();

  return (
    <div className="popup">

      <h3>Sentinel-1 Footprint</h3>

      <p>
        <strong>Tile:</strong><br />
        {footprint.TileNumber}
      </p>

      <p>
        <strong>Average Rainfall (1h):</strong><br />
        {Number(footprint.averageRainfall).toFixed(2)} mm
      </p>

      <p>
        <strong>Observed:</strong><br />
        {timeAndDate}
      </p>

    </div>
  );

}

export default FootprintPopup;