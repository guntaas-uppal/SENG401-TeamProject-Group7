function MetricBar({ label, value, color, invertGood = false }) {
  const status = invertGood
    ? (value <= 30 ? "great" : value <= 50 ? "ok" : "bad")
    : (value >= 70 ? "great" : value >= 50 ? "ok" : "bad");

  return (
    <div className="metric-row">
      <div className="metric-label">{label}</div>
      <div className="metric-bar-wrap">
        <div
          className="metric-bar-fill"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <div className={`metric-value metric-${status}`}>{value}</div>
    </div>
  );
}

export default MetricBar;
