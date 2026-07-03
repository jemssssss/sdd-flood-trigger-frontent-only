import "../styles/App.css";

function RainStationPopup({ station }) {
  return (
    <div className="rain-popup">
      <h3>{station.stationName}</h3>

      <div className="popup-row">
        <strong>Rainfall (3h):</strong>
        <span>{station.rainfallMm} mm</span>
      </div>

      <div className="popup-row">
        <strong>Observed:</strong>
        <span>{station.observedAt}</span>
      </div>

      <div className="popup-row">
        <strong>Latitude:</strong>
        <span>{station.latitude.toFixed(5)}</span>
      </div>

      <div className="popup-row">
        <strong>Longitude:</strong>
        <span>{station.longitude.toFixed(5)}</span>
      </div>
    </div>
  );
}

export default RainStationPopup;