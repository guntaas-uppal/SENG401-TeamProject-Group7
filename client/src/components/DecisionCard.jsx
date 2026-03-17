function DecisionCard({ option, index, onChoose, disabled, revealed, chosen }) {
  const typeLabels = {
    positive: "Sustainable",
    neutral: "Moderate",
    negative: "Unsustainable",
  };

  const typeLabel = typeLabels[option.type] || "Moderate";

  function renderChange(label, value, invertGood = false) {
    if (value === 0) return null;
    const isGood = invertGood ? value < 0 : value > 0;
    return (
      <span className={`change-tag ${isGood ? "good" : "bad"}`}>
        {label} {value > 0 ? "+" : ""}{value}
      </span>
    );
  }

  return (
    <div className={`decision-card ${revealed ? option.type : ""} ${chosen ? "chosen" : ""}`}>
      <div className="decision-type-label">{typeLabel}</div>
      <h3>{option.label}</h3>

      {revealed && (
        <div className="decision-changes">
          {renderChange("Waste", option.waste, true)}
          {renderChange("Resources", option.resources, true)}
          {renderChange("Cost", option.cost, true)}
          {renderChange("Sustainability", option.sustainability, false)}
        </div>
      )}

      {!revealed && (
        <button className="primary-btn" onClick={onChoose} disabled={disabled}>
          {disabled ? "Processing..." : `Choose Option ${index + 1}`}
        </button>
      )}

      {revealed && chosen && (
        <div className="chosen-badge">Your Choice</div>
      )}
    </div>
  );
}

export default DecisionCard;
