function MetricBar({ label, value, color }) {
  return (
    <div className="metric-row">
      <div className="metric-label">{label}</div>
      <div className="metric-bar-wrap">
        <div
          className="metric-bar-fill"
          style={{
            width: `${value}%`,
            backgroundColor: color,
          }}
        />
      </div>
      <div className="metric-value">{value}</div>
    </div>
  );
}

export default MetricBar; 