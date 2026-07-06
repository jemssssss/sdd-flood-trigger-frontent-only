import "../styles/App.css";

function StationPopup({ station }) {

  const rainfallLabel =
    station.stationType === "aws"
      ? "Rainfall (24h)"
      : "Rainfall (3h)";

  return (
    <div className="rain-popup">

      <h3>{station.stationName}</h3>

      <div className="popup-row">
        <strong>Type:</strong>
        <span>{station.stationType}</span>
      </div>

      <div className="popup-row">
        <strong>{rainfallLabel}:</strong>
        <span>{station.rainfallMm} mm</span>
      </div>

      <div className="popup-row">
        <strong>Observed:</strong>
        <span>{station.observedAt}</span>
      </div>

      <div className="popup-row">
        <strong>Latitude:</strong>
        <span>{Number(station.latitude).toFixed(5)}</span>
      </div>

      <div className="popup-row">
        <strong>Longitude:</strong>
        <span>{Number(station.longitude).toFixed(5)}</span>
      </div>

    </div>
  );
}

export default StationPopup;