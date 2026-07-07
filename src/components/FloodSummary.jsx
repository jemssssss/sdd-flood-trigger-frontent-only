import "../styles/App.css";

function FloodSummary({ summary }) {

  return (

    <div className="flood-summary">

      <h3>Flood Summary</h3>

      <div className="summary-section">

        <h4>
          Moderate Rainfall (60–180 mm)
        </h4>

        <p>
          {summary.moderate.length} Sentinel Tile(s)
        </p>

        {summary.moderate.length > 0 ? (

          <ul>
            {summary.moderate.map(tile => (
              <li key={tile}>{tile}</li>
            ))}
          </ul>

        ) : (

          <p className="empty-summary">
            None
          </p>

        )}

      </div>

      <div className="summary-section">

        <h4>
          Heavy Rainfall (&gt;180 mm)
        </h4>

        <p>
          {summary.heavy.length} Sentinel Tile(s)
        </p>

        {summary.heavy.length > 0 ? (

          <ul>
            {summary.heavy.map(tile => (
              <li key={tile}>{tile}</li>
            ))}
          </ul>

        ) : (

          <p className="empty-summary">
            None
          </p>

        )}

      </div>

    </div>

  );

}

export default FloodSummary;