function DecisionCard({ option, index, onChoose, disabled }) {
const cfg = {
    positive: { icon: "🌱", label: "Sustainable" },
    neutral: { icon: "⚖️", label: "Moderate" },
    negative: { icon: "⚠️", label: "Unsustainable" },
}[option.type] || { icon: "⚖️", label: "Moderate" };

function renderChange(label, value, invertGood = false) {
    if (value === 0) return null;
    const isGood = invertGood ? value < 0 : value > 0;
    return (
    <span className={⁠ change-tag ${isGood ? "good" : "bad"} ⁠}>
        {label} {value > 0 ? "+" : ""}{value}
    </span>
    );
}

return (
    <div className={⁠ decision-card ${option.type} ⁠}>
    <div className="decision-type">
        <span>{cfg.icon}</span> {cfg.label}
    </div>
    <h3>{option.label}</h3>
    <div className="decision-changes">
        {renderChange("🗑️ Waste", option.waste, true)}
        {renderChange("⛏️ Resources", option.resources, true)}
        {renderChange("💰 Cost", option.cost, true)}
        {renderChange("🌿 Sust.", option.sustainability, false)}
    </div>
    <button className="primary-btn" onClick={onChoose} disabled={disabled}>
        {disabled ? "Processing..." : ⁠ Choose Option ${index + 1} ⁠}
    </button>
    </div>
);
}

export default DecisionCard;