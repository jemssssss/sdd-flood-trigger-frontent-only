import "../styles/App.css";

function RainLegend() {
  const categories = [
    { color: "#d6eaf8", label: "No observed rain (0 mm)" },
    { color: "#00e100", label: "Light rainfall (1–10 mm)" },
    { color: "#ffff00", label: "Moderate rainfall (10–25 mm)" },
    { color: "#ffaa00", label: "Heavy rainfall (25–50 mm)" },
    { color: "#ff0000", label: "Very heavy rainfall (>50 mm)" },
  ];

  return (
    <div className="rain-legend">
      <h3>Rainfall Legend</h3>

      {categories.map((category) => (
        <div className="legend-item" key={category.label}>
          <span
            className="legend-color"
            style={{ backgroundColor: category.color }}
          />
          <span>{category.label}</span>
        </div>
      ))}
    </div>
  );
}

export default RainLegend;