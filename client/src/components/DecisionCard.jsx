function formatEffect(label, value, positiveIsGood = true) {
  const sign = value > 0 ? "+" : "";
  const betterOrWorse =
    value === 0 ? "" : positiveIsGood ? (value > 0 ? "better" : "worse") : (value < 0 ? "better" : "worse");

  return `${label}: ${sign}${value}${betterOrWorse ? ` (${betterOrWorse})` : ""}`;
}

function DecisionCard({ option, index, onChoose, disabled }) {
  return (
    <div className={`decision-card ${option.type}`}>
      <div className="decision-type">{option.type}</div>
      <h3>{option.label}</h3>
      <ul>
        <li>{formatEffect("Waste", option.waste, false)}</li>
        <li>{formatEffect("Resources", option.resources, false)}</li>
        <li>{formatEffect("Cost", option.cost, false)}</li>
        <li>{formatEffect("Sustainability", option.sustainability, true)}</li>
      </ul>
      <button className="primary-btn" onClick={onChoose} disabled={disabled}>
        Choose option {index + 1}
      </button>
    </div>
  );
}

export default DecisionCard;