import { useEffect, useState } from "react";
import { api } from "../utils/api";
import DecisionCard from "../components/DecisionCard";
import MetricBar from "../components/MetricBar";

function GamePage({ user, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState("household");
  const [progress, setProgress] = useState(null);
  const [event, setEvent] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadSummary();
  }, [user.id]);

  useEffect(() => {
    if (summary) {
      loadLevel(selectedLevel);
    }
  }, [selectedLevel, summary]);

  async function loadSummary() {
    try {
      const result = await api.getSummary(user.id);
      setSummary(result);
    } catch (err) {
      setError(err.message);
    }
  }

  async function loadLevel(level) {
    try {
      setLoading(true);
      setError("");
      const result = await api.getProgress(user.id, level);
      setProgress(result.progress);
      setEvent(result.event);
      setMessage("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleChoose(optionIndex) {
    if (!event) return;

    try {
      setChoosing(true);
      setError("");
      const result = await api.chooseOption({
        userId: user.id,
        level: selectedLevel,
        eventKey: event.key,
        optionIndex,
      });

      setProgress(result.progress);
      setSummary((prev) => ({
        ...prev,
        levels: result.summary,
      }));
      setEvent(result.nextEvent);
      setMessage(`You selected: ${result.selectedOption.label}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setChoosing(false);
    }
  }

  function isUnlocked(level) {
    if (user.role === "admin") return true;
    return summary?.levels?.[level]?.unlocked;
  }

  return (
    <div className="game-page">
      <header className="top-bar">
        <div>
          <h1>SDG 12 Sustainability Simulator</h1>
          <p className="subtext">
            Logged in as {user.name} ({user.id}) | Role: {user.role}
          </p>
        </div>
        <button className="secondary-btn" onClick={onLogout}>
          Logout
        </button>
      </header>

      <section className="level-switcher">
        <div>
          <h2>Current Level: {selectedLevel.charAt(0).toUpperCase() + selectedLevel.slice(1)}</h2>
          <p className="subtext">
            Choose another unlocked level if you want to test progression quickly.
          </p>
        </div>
        <div className="level-buttons">
          {["household", "city", "country"].map((level) => (
            <button
              key={level}
              className={selectedLevel === level ? "active" : ""}
              onClick={() => setSelectedLevel(level)}
              disabled={!isUnlocked(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>
      </section>

      {error && <p className="error-text">{error}</p>}
      {message && <p className="success-text">{message}</p>}

      {loading || !progress ? (
        <p>Loading level data...</p>
      ) : (
        <>
          <div className="dashboard-grid">
            <section className="panel">
              <h3>Sustainability Indicators</h3>
              <MetricBar label="Waste Generation" value={progress.waste} color="#b65c3a" />
              <MetricBar label="Resource Usage" value={progress.resources} color="#a6762c" />
              <MetricBar label="Financial Cost" value={progress.cost} color="#7d4ea8" />
              <MetricBar label="Sustainability Score" value={progress.sustainability} color="#2f9b4e" />
              <p className="subtext">
                Lower values are better for waste, resources, and cost. Higher values are better for sustainability.
              </p>
            </section>

            <section className="panel">
              <h3>Progress Summary</h3>
              {summary &&
                ["household", "city", "country"].map((level) => {
                  const info = summary.levels[level];
                  const target = level === "household" ? 50 : level === "city" ? 52 : 60;
                  return (
                    <div key={level} className="summary-row">
                      <strong>{level.charAt(0).toUpperCase() + level.slice(1)}</strong>
                      <div>
                        Turns: {info.turns_completed} / {target} | Unlocked: {info.unlocked ? "Yes" : "No"} | Stars: {info.stars}
                      </div>
                    </div>
                  );
                })}
            </section>
          </div>

          {event && (
            <section className="event-panel">
              <h2>{event.title}</h2>
              <p>{event.description}</p>

              <div className="cards-column">
                {event.options.map((option, index) => (
                  <DecisionCard
                    key={index}
                    option={option}
                    index={index}
                    onChoose={() => handleChoose(index)}
                    disabled={choosing}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default GamePage;