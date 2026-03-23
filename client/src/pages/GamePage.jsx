import { useEffect, useState, useMemo } from "react";
import { api } from "../utils/api";
import DecisionCard from "../components/DecisionCard";
import MetricBar from "../components/MetricBar";

const LEVEL_CONFIG = {
  household: { icon: "🏠", label: "Household", timeUnit: "Day", objective: 50, unlockAt: 25, difficulty: "normal" },
  city: { icon: "🏙️", label: "City", timeUnit: "Week", objective: 52, unlockHint: "Complete at least 25 Household turns to unlock", difficulty: "normal→hard" },
  country: { icon: "🌍", label: "Country", timeUnit: "Month", objective: 60, unlockHint: "Complete at least 50 Household turns and 26 City turns to unlock", difficulty: "hard" },
};

/** Mirror of server getDifficultyMode — keeps phase badge in sync */
function getDifficultyMode(level, turnsCompleted) {
  if (level === "country") return "hard";
  if (level === "city" && turnsCompleted >= 30) return "hard";
  return "normal";
}

/** Returns phase label + multiplier string for the header badge */
function getPhaseBadge(level, turnsCompleted, objective) {
  const pct = turnsCompleted / objective;
  const mode = getDifficultyMode(level, turnsCompleted);
  const phase = pct <= 0.3 ? "early" : pct <= 0.7 ? "mid" : "late";
  const labels = {
    normal: { early: "Early Game (1.3× bonus)", mid: "Mid Game (1.0×)", late: "Late Game (0.8×)" },
    hard:   { early: "Hard Mode (1.1× bonus)", mid:  "Hard Mode (0.85×)", late: "Hard Mode (0.65×)" },
  };
  return { phase, mode, text: labels[mode][phase] };
}

const ACHIEVEMENTS = {
  first_step: { label: "First Step", icon: "🌱", description: "Complete your first turn" },
  household_complete: { label: "Home Keeper", icon: "🏠", description: "Complete the Household level" },
  city_unlock: { label: "City Planner", icon: "🏙️", description: "Unlock the City level" },
  country_unlock: { label: "World Leader", icon: "🌍", description: "Unlock the Country level" },
  streak_5: { label: "On a Roll", icon: "🔥", description: "5-turn positive streak" },
  streak_10: { label: "Unstoppable", icon: "⚡", description: "10-turn positive streak" },
  five_stars: { label: "Perfection", icon: "⭐", description: "Earn 5 stars on any level" },
  sustainability_90: { label: "Green Champion", icon: "♻️", description: "Reach 90+ sustainability" },
  all_levels: { label: "Full Circle", icon: "🎯", description: "Play all three levels" },
  city_complete: { label: "City Master", icon: "🌆", description: "Complete the City level" },
  country_complete: { label: "Nation Builder", icon: "🗺️", description: "Complete the Country level" },
  streak_20: { label: "Legendary", icon: "💎", description: "20-turn positive streak" },
  centurion: { label: "Centurion", icon: "💯", description: "Complete 100 turns across all levels" },
  sustainability_100: { label: "Eco Warrior", icon: "🌿", description: "Reach a perfect 100 sustainability score" },
};

/** Fisher-Yates shuffle — returns new array with original indices tracked */
function shuffleOptions(options) {
  const indexed = options.map((opt, i) => ({ ...opt, _originalIndex: i }));
  for (let i = indexed.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indexed[i], indexed[j]] = [indexed[j], indexed[i]];
  }
  return indexed;
}

/* ── Hint helpers ────────────────────────────────────────────── */
const HINTS_STORAGE_KEY = (userId) => `ecosim_hints_${userId}`;
const HINT_START = 25;

function loadHints(userId) {
  try {
    const raw = localStorage.getItem(HINTS_STORAGE_KEY(userId));
    if (raw !== null) return parseInt(raw, 10);
  } catch (_) {}
  // First time this user is seen — write the starting value immediately
  saveHints(userId, HINT_START);
  return HINT_START;
}

function saveHints(userId, count) {
  try { localStorage.setItem(HINTS_STORAGE_KEY(userId), String(count)); } catch (_) {}
}

/** Returns the shuffled index of the best (positive) option, or the highest sustainability one */
function getBestOptionIdx(shuffledOptions) {
  const posIdx = shuffledOptions.findIndex((o) => o.type === "positive");
  if (posIdx !== -1) return posIdx;
  // fallback: pick highest sustainability delta
  let best = 0;
  shuffledOptions.forEach((o, i) => { if (o.sustainability > shuffledOptions[best].sustainability) best = i; });
  return best;
}

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
function GamePage({ user, view, viewProps, navigate, onLogout }) {
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(true);

  useEffect(() => { loadSummary(); }, [user.id]);

  async function loadSummary() {
    try {
      setSummaryLoading(true);
      const result = await api.getSummary(user.id);
      setSummary(result);
    } catch (err) {
      console.error(err);
    } finally {
      setSummaryLoading(false);
    }
  }

  function isUnlocked(level) {
    if (user.role === "admin") return true;
    return summary?.levels?.[level]?.unlocked;
  }

  const navBar = (
    <header className="top-bar">
      <div className="top-bar-left">
        <div>
          <h1 className="brand-title" onClick={() => navigate("dashboard")}>EcoSim</h1>
          <p className="subtext">Logged in as {user.name} ({user.role})</p>
        </div>
      </div>
      <div className="top-bar-nav">
        <button className={`nav-btn ${view === "dashboard" ? "active" : ""}`} onClick={() => navigate("dashboard")}>Dashboard</button>
        <button className={`nav-btn ${view === "leaderboard" ? "active" : ""}`} onClick={() => navigate("leaderboard")}>Leaderboard</button>
        <button className="secondary-btn" onClick={onLogout}>Sign Out</button>
      </div>
    </header>
  );

  if (summaryLoading || !summary) {
    return (
      <div className="game-page">
        {navBar}
        <div className="loading-center"><div className="spinner" /><p>Loading...</p></div>
      </div>
    );
  }

  let content;
  switch (view) {
    case "game":
      content = <PlayView user={user} level={viewProps.level || "household"} navigate={navigate} onUpdate={loadSummary} />;
      break;
    case "history":
      content = <HistoryView user={user} level={viewProps.level || "household"} navigate={navigate} />;
      break;
    case "leaderboard":
      content = <LeaderboardView user={user} navigate={navigate} />;
      break;
    case "summary":
      content = <SummaryView level={viewProps.level} result={viewProps.result} navigate={navigate} />;
      break;
    default:
      content = <DashboardView user={user} summary={summary} navigate={navigate} isUnlocked={isUnlocked} />;
  }

  return (
    <div className="game-page">
      {navBar}
      {content}
    </div>
  );
}

/* ============================================================
   DASHBOARD VIEW
   ============================================================ */
function DashboardView({ user, summary, navigate, isUnlocked }) {
  const levels = summary.levels;
  const totalStars = Object.values(levels).reduce((s, l) => s + (l.stars || 0), 0);
  const totalTurns = Object.values(levels).reduce((s, l) => s + (l.turns_completed || 0), 0);
  const bestSust = Math.max(...Object.values(levels).map((l) => l.sustainability || 0));
  const earnedKeys = new Set((summary.achievements || []).map((a) => a.achievement_key));

  return (
    <>
      <section className="panel hero-panel">
        <div>
          <h2>Welcome back, {user.name}</h2>
          <p className="subtext">Your sustainability journey at a glance</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat"><span className="hero-num">{totalTurns}</span><span className="hero-label">Decisions</span></div>
          <div className="hero-stat"><span className="hero-num">{totalStars}</span><span className="hero-label">Stars</span></div>
          <div className="hero-stat"><span className="hero-num">{bestSust}</span><span className="hero-label">Best Score</span></div>
        </div>
      </section>

      <section>
        <h2 className="section-title">Your Levels</h2>
        <div className="level-cards">
          {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => {
            const lvl = levels[key] || {};
            const unlocked = isUnlocked(key);
            const pct = Math.min(100, Math.round(((lvl.turns_completed || 0) / cfg.objective) * 100));
            return (
              <div key={key} className={`level-card ${unlocked ? "" : "locked"}`} onClick={() => unlocked && navigate("game", { level: key })}>
                {!unlocked && <div className="lock-badge">🔒</div>}
                {!unlocked && cfg.unlockHint && (
                  <div className="unlock-tooltip">{cfg.unlockHint}</div>
                )}
                <div className="lc-icon">{cfg.icon}</div>
                <h3>{cfg.label}</h3>
                <p className="subtext">{cfg.timeUnit}-based decisions</p>
                <p className="lc-difficulty">
                  {cfg.difficulty === "hard" ? "🔴 Hard mode" : cfg.difficulty === "normal→hard" ? "🟡 Normal → Hard at turn 30" : "🟢 Normal mode"}
                  &nbsp;·&nbsp; 🎯 Score 90+ for 5⭐
                </p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
                <p className="subtext">{lvl.turns_completed || 0} / {cfg.objective} turns</p>
                <div className="lc-bottom">
                  <span>Score: {lvl.sustainability || 0}</span>
                  <span>{"⭐".repeat(lvl.stars || 0)}{"☆".repeat(5 - (lvl.stars || 0))}</span>
                </div>
                {unlocked && (
                  <div className="lc-actions">
                    <button className="primary-btn" onClick={(e) => { e.stopPropagation(); navigate("game", { level: key }); }}>
                      {(lvl.turns_completed || 0) > 0 ? "Continue" : "Start"} →
                    </button>
                    <button className="ghost-btn" onClick={(e) => { e.stopPropagation(); navigate("history", { level: key }); }}>History</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="section-title">Achievements <span className="subtext">({earnedKeys.size}/{Object.keys(ACHIEVEMENTS).length})</span></h2>
        <div className="achievements-grid">
          {Object.entries(ACHIEVEMENTS).map(([key, def]) => (
            <div key={key} className={`achievement ${earnedKeys.has(key) ? "unlocked" : "locked"}`}>
              <span className="ach-icon">{def.icon}</span>
              <div><strong>{def.label}</strong><br /><span className="subtext">{def.description}</span></div>
              {!earnedKeys.has(key) && <span className="ach-lock">🔒</span>}
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* ============================================================
   PLAY VIEW
   ============================================================ */
function PlayView({ user, level, navigate, onUpdate }) {
  const [progress, setProgress] = useState(null);
  const [event, setEvent] = useState(null);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [choosing, setChoosing] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [chosenShuffledIdx, setChosenShuffledIdx] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [showReset, setShowReset] = useState(false);
  const [pendingNextEvent, setPendingNextEvent] = useState(null);
  const [hints, setHints] = useState(() => loadHints(user.id));
  const [showHint, setShowHint] = useState(false);
  const [hintIdx, setHintIdx] = useState(null);
  const [levelComplete, setLevelComplete] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const meta = LEVEL_CONFIG[level];

  useEffect(() => { loadLevel(); }, [level, user.id]);

  // Shuffle options whenever a new event arrives
  useEffect(() => {
    if (event && event.options) {
      setShuffledOptions(shuffleOptions(event.options));
      setRevealed(false);
      setChosenShuffledIdx(null);
      setFeedback(null);
    }
  }, [event]);

  async function loadLevel() {
    try {
      setLoading(true);
      setFeedback(null);
      setRevealed(false);
      setChosenShuffledIdx(null);
      setPendingNextEvent(null);
      setLevelComplete(false);
      setShowFeedbackModal(false);
      const result = await api.getProgress(user.id, level);
      setProgress(result.progress);
      setEvent(result.event);

      // If this is a fresh player (no turns completed on household), reset hints to starting value
      if (level === "household" && (result.progress.turns_completed || 0) === 0) {
        saveHints(user.id, HINT_START);
        setHints(HINT_START);
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  }

  function addToast(msg, type = "info") {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }

  function useHint() {
    if (hints <= 0 || revealed || choosing) return;
    const bestIdx = getBestOptionIdx(shuffledOptions);
    setHintIdx(bestIdx);
    setShowHint(true);
    const newCount = hints - 1;
    setHints(newCount);
    saveHints(user.id, newCount);
  }

  async function handleChoose(shuffledIdx) {
    if (!event || choosing || revealed) return;

    const originalIndex = shuffledOptions[shuffledIdx]._originalIndex;

    try {
      setChoosing(true);
      const result = await api.chooseOption({ userId: user.id, level, eventKey: event.key, optionIndex: originalIndex });
      const opt = result.selectedOption;

      setChosenShuffledIdx(shuffledIdx);
      setRevealed(true);

      setFeedback({
        label: opt.label, type: opt.type,
        changes: { waste: opt.waste, resources: opt.resources, cost: opt.cost, sustainability: opt.sustainability },
        timeMultiplier: result.timeMultiplier, streakBonus: result.streakBonus, streak: result.progress.streak,
        isBest: opt.type === "positive",
      });
      setShowFeedbackModal(true);

      if (result.newAchievements?.length) {
        result.newAchievements.forEach((a) => addToast(`${a.icon} Achievement: ${a.label}`, "achievement"));
      }
      if (result.streakBonus > 0) addToast(`🔥 Streak bonus! +${result.streakBonus} sustainability`, "streak");

      setProgress(result.progress);
      setPendingNextEvent(result.nextEvent);
      onUpdate();

      const newTurns = result.progress.turns_completed;
      const prevTurns = newTurns - 1;
      const alreadyCompleted = prevTurns >= meta.objective;

      if (!alreadyCompleted) {
        let updatedHints = hints;

        if (newTurns >= meta.objective && result.progress.stars > 0 && !levelComplete) {
          setLevelComplete(true);
          updatedHints += 10;
          saveHints(user.id, updatedHints);
          setHints(updatedHints);
        } else {
          if (Math.floor(newTurns / 5) > Math.floor(prevTurns / 5)) {
            updatedHints += 1;
            addToast("💡 You earned a hint! (" + updatedHints + " remaining)", "info");
          }
          if (updatedHints !== hints) {
            setHints(updatedHints);
            saveHints(user.id, updatedHints);
          }
        }
      }
    } catch (err) {
      addToast(err.message, "error");
    } finally {
      setChoosing(false);
    }
  }

  function handleNextTurn() {
    setEvent(pendingNextEvent);
    setPendingNextEvent(null);
  }

  async function handleReset() {
    try {
      await api.resetLevel(user.id, level);
      setShowReset(false);
      addToast("Level reset successfully", "info");
      loadLevel();
      onUpdate();
    } catch (err) {
      addToast(err.message, "error");
    }
  }

  if (loading || !progress) {
    return <div className="loading-center"><div className="spinner" /><p>Loading {meta.label} level...</p></div>;
  }

  const turnPct = Math.min(100, Math.round((progress.turns_completed / meta.objective) * 100));
  const { phase, mode, text: phaseBadgeText } = getPhaseBadge(level, progress.turns_completed, meta.objective);

  return (
    <>
      {/* Toasts */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>{t.msg}</div>
        ))}
      </div>

      {/* Game Header */}
      <div className="game-header">
        <div className="game-header-left">
          <button className="ghost-btn" onClick={() => navigate("dashboard")}>← Back</button>
          <span className="game-level-icon">{meta.icon}</span>
          <div>
            <h2>{meta.label} Level</h2>
            <p className="subtext">{meta.timeUnit} {progress.turns_completed} of {meta.objective}</p>
          </div>
        </div>
        <div className="game-header-right">
          <span className={`phase-badge phase-${phase} ${mode === "hard" ? "phase-hard" : ""}`}>
            {phaseBadgeText}
          </span>
          {progress.streak > 0 && <span className="streak-badge">🔥 {progress.streak} streak</span>}
          <button
            className={`hint-btn ${hints <= 0 || revealed || choosing ? "hint-btn-disabled" : ""}`}
            onClick={useHint}
            disabled={hints <= 0 || revealed || choosing}
            title={hints <= 0 ? "No hints remaining" : "Use a hint to reveal the best option"}
          >
            💡 {hints} hints
          </button>
        </div>
      </div>

      {/* Turn Progress */}
      <div className="turn-progress">
        <div className="progress-bar full-width"><div className="progress-fill" style={{ width: `${turnPct}%` }} /></div>
      </div>

      {/* Metrics */}
      <div className="dashboard-grid">
        <section className="panel">
          <h3>Sustainability Indicators</h3>
          <MetricBar label="Waste Generation" value={progress.waste} color="#555" invertGood />
          <MetricBar label="Resource Usage" value={progress.resources} color="#777" invertGood />
          <MetricBar label="Financial Cost" value={progress.cost} color="#999" invertGood />
          <MetricBar label="Sustainability Score" value={progress.sustainability} color="#3b82f6" />
          <p className="subtext">Lower = better for waste, resources, cost. Higher = better for sustainability.</p>
          <p className="objective-hint">
            🎯 Target: <strong>90+</strong> for 5⭐ &nbsp;·&nbsp; <strong>80+</strong> for 4⭐ &nbsp;·&nbsp; <strong>70+</strong> for 3⭐ &nbsp;·&nbsp; current: <strong style={{color: progress.sustainability >= 90 ? "#4ade80" : progress.sustainability >= 70 ? "#facc15" : "var(--red)"}}>{progress.sustainability}</strong>
          </p>
          {progress.stars > 0 && (
            <p className="stars-display">{"⭐".repeat(progress.stars)}{"☆".repeat(5 - progress.stars)} — {progress.stars}/5 Stars</p>
          )}
        </section>
      </div>

      {/* Feedback Modal (shown after each decision) */}
      {showFeedbackModal && feedback && (
        <div className="modal-overlay">
          <div className="modal-card feedback-modal">
            <div className={`feedback-modal-header feedback-modal-${feedback.type}`}>
              <span className="feedback-badge">
                {feedback.type === "positive" ? "✅ Best Choice!" : feedback.type === "negative" ? "⚠️ Unsustainable Choice" : "➡️ Moderate Choice"}
              </span>
              {feedback.timeMultiplier !== 1.0 && (
                <span className="subtext">Time effect: {feedback.timeMultiplier}×</span>
              )}
            </div>
            <p className="feedback-modal-label">{feedback.label}</p>
            <div className="feedback-modal-changes">
              {[
                { key: "waste",          label: "Waste Generation", invertGood: true  },
                { key: "resources",      label: "Resource Usage",   invertGood: true  },
                { key: "cost",           label: "Financial Cost",   invertGood: true  },
                { key: "sustainability", label: "Sustainability",    invertGood: false },
              ].map(({ key, label, invertGood }) => {
                const v = feedback.changes[key];
                if (v === 0) return null;
                const good = invertGood ? v < 0 : v > 0;
                return (
                  <div key={key} className={`feedback-row ${good ? "good" : "bad"}`}>
                    <span className="feedback-row-label">{label}</span>
                    <span className="feedback-row-value">{v > 0 ? "+" : ""}{v}</span>
                  </div>
                );
              })}
              {feedback.streakBonus > 0 && (
                <div className="feedback-row good">
                  <span className="feedback-row-label">🔥 Streak Bonus</span>
                  <span className="feedback-row-value">+{feedback.streakBonus}</span>
                </div>
              )}
            </div>
            {levelComplete && (
              <p className="feedback-complete-msg">🎉 Level complete! +10 hints awarded!</p>
            )}
            <div className="modal-actions">
              <button
                className="primary-btn"
                onClick={() => {
                  setShowFeedbackModal(false);
                  if (levelComplete) {
                    navigate("summary", { level, result: progress });
                  }
                }}
              >
                {levelComplete ? "See Results →" : "Continue →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Event */}
      {event && shuffledOptions.length > 0 && (
        <section className="event-panel">
          <div className="event-header">
            <span className="turn-badge">{meta.timeUnit} {progress.turns_completed + (revealed ? 0 : 1)}</span>
            <h2>{event.title}</h2>
          </div>
          <p className="event-desc">{event.description}</p>
          <div className="cards-column">
            {shuffledOptions.map((option, idx) => (
              <DecisionCard
                key={idx}
                option={option}
                index={idx}
                onChoose={() => handleChoose(idx)}
                disabled={choosing}
                revealed={revealed}
                chosen={revealed && idx === chosenShuffledIdx}
                hinted={!revealed && hintIdx === idx}
              />
            ))}
          </div>

          {/* Next Turn button appears after reveal */}
          {revealed && pendingNextEvent && (
            <div className="next-turn-row">
              <button className="primary-btn" onClick={handleNextTurn}>Next Turn →</button>
            </div>
          )}
        </section>
      )}

      {/* Actions */}
      <div className="game-actions">
        <button className="ghost-btn" onClick={() => navigate("history", { level })}>Decision History</button>
        <button className="danger-ghost-btn" onClick={() => setShowReset(true)}>Reset Level</button>
      </div>

      {/* Hint Modal */}
      {showHint && hintIdx !== null && (
        <div className="modal-overlay" onClick={() => setShowHint(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>💡 Hint</h3>
            <p>The best option for this turn is:</p>
            <p className="hint-option-label"><strong>Option {hintIdx + 1}: {shuffledOptions[hintIdx]?.label}</strong></p>
            <p className="subtext">This choice has the most positive impact on your sustainability score. You have <strong>{hints}</strong> hint{hints !== 1 ? "s" : ""} remaining.</p>
            <div className="modal-actions">
              <button className="primary-btn" onClick={() => setShowHint(false)}>Got it!</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Modal */}
      {showReset && (
        <div className="modal-overlay" onClick={() => setShowReset(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>Reset {meta.label} Level?</h3>
            <p>This will erase all progress and decision history for this level. This cannot be undone.</p>
            <div className="modal-actions">
              <button className="ghost-btn" onClick={() => setShowReset(false)}>Cancel</button>
              <button className="danger-btn" onClick={handleReset}>Reset Level</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   HISTORY VIEW
   ============================================================ */
function HistoryView({ user, level, navigate }) {
  const [selectedLevel, setSelectedLevel] = useState(level);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getHistory(user.id, selectedLevel).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [user.id, selectedLevel]);

  const stats = data?.stats || {};
  const decisions = data?.decisions || [];
  const total = stats.total_decisions || 0;

  return (
    <>
      <div className="view-header">
        <button className="ghost-btn" onClick={() => navigate("dashboard")}>← Dashboard</button>
        <h2>Decision History</h2>
      </div>
      <div className="level-switcher-row">
        {["household", "city", "country"].map((l) => (
          <button key={l} className={selectedLevel === l ? "active" : ""} onClick={() => setSelectedLevel(l)}>
            {LEVEL_CONFIG[l].icon} {LEVEL_CONFIG[l].label}
          </button>
        ))}
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : (
        <>
          {total > 0 && (
            <div className="history-stats">
              <div className="stat-card"><span className="stat-num">{total}</span><span className="stat-label">Total</span></div>
              <div className="stat-card stat-positive"><span className="stat-num">{stats.positive_count || 0}</span><span className="stat-label">Sustainable</span></div>
              <div className="stat-card stat-neutral"><span className="stat-num">{stats.neutral_count || 0}</span><span className="stat-label">Moderate</span></div>
              <div className="stat-card stat-negative"><span className="stat-num">{stats.negative_count || 0}</span><span className="stat-label">Unsustainable</span></div>
              <div className="stat-card"><span className="stat-num">{(stats.avg_sustainability_change || 0).toFixed(1)}</span><span className="stat-label">Avg. Impact</span></div>
            </div>
          )}
          {total > 0 && (
            <div className="dist-bar">
              <div className="dist-fill dist-positive" style={{ width: `${(stats.positive_count / total) * 100}%` }} />
              <div className="dist-fill dist-neutral" style={{ width: `${(stats.neutral_count / total) * 100}%` }} />
              <div className="dist-fill dist-negative" style={{ width: `${(stats.negative_count / total) * 100}%` }} />
            </div>
          )}
          <div className="timeline">
            {decisions.length === 0 ? (
              <div className="empty-state">
                <p>No decisions recorded for this level yet.</p>
                <button className="primary-btn" onClick={() => navigate("game", { level: selectedLevel })}>Start Playing →</button>
              </div>
            ) : decisions.map((d, i) => (
              <div key={i} className={`timeline-entry tl-${d.option_type}`}>
                <div className="tl-turn">Turn {d.turn_number}</div>
                <div className={`tl-dot tl-dot-${d.option_type}`} />
                <div className="tl-content">
                  <p className="tl-label">{d.option_label}</p>
                  <div className="tl-changes">
                    {d.waste_change !== 0 && <span>W:{d.waste_change > 0 ? "+" : ""}{d.waste_change}</span>}
                    {d.resources_change !== 0 && <span>R:{d.resources_change > 0 ? "+" : ""}{d.resources_change}</span>}
                    {d.cost_change !== 0 && <span>C:{d.cost_change > 0 ? "+" : ""}{d.cost_change}</span>}
                    {d.sustainability_change !== 0 && <span>S:{d.sustainability_change > 0 ? "+" : ""}{d.sustainability_change}</span>}
                    {d.time_multiplier !== 1.0 && <span className="tl-mult">×{d.time_multiplier}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
}

/* ============================================================
   LEADERBOARD VIEW
   ============================================================ */
function LeaderboardView({ user, navigate }) {
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getLeaderboard(selectedLevel).then(setData).catch(console.error).finally(() => setLoading(false));
  }, [selectedLevel]);

  const rows = data?.leaderboard || [];

  return (
    <>
      <div className="view-header">
        <button className="ghost-btn" onClick={() => navigate("dashboard")}>← Dashboard</button>
        <h2>Leaderboard</h2>
      </div>
      <div className="level-switcher-row">
        <button className={selectedLevel === null ? "active" : ""} onClick={() => setSelectedLevel(null)}>Overall</button>
        {["household", "city", "country"].map((l) => (
          <button key={l} className={selectedLevel === l ? "active" : ""} onClick={() => setSelectedLevel(l)}>
            {LEVEL_CONFIG[l].icon} {LEVEL_CONFIG[l].label}
          </button>
        ))}
      </div>
      {loading ? <div className="loading-center"><div className="spinner" /></div> : rows.length === 0 ? (
        <div className="empty-state"><p>No players have scored yet.</p></div>
      ) : (
        <div className="table-wrap">
          <table className="lb-table">
            <thead>
              <tr>
                <th>#</th><th>Player</th>
                {selectedLevel ? <><th>Turns</th><th>Sustainability</th><th>Stars</th><th>Streak</th></> :
                  <><th>Total Stars</th><th>Best Sust.</th><th>Turns</th><th>Streak</th></>}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                const isMe = row.id === user.id;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                return (
                  <tr key={row.id} className={isMe ? "lb-me" : ""}>
                    <td className="lb-rank">{medal}</td>
                    <td>{row.name} {isMe && <span className="you-badge">You</span>}</td>
                    {selectedLevel ? (
                      <><td>{row.turns_completed}</td><td className="lb-sust">{row.sustainability}</td><td>{"⭐".repeat(row.stars || 0)}</td><td>{row.best_streak || 0} 🔥</td></>
                    ) : (
                      <><td>{"⭐".repeat(Math.min(row.total_stars || 0, 15))}</td><td className="lb-sust">{row.best_sustainability}</td><td>{row.total_turns}</td><td>{row.best_streak || 0} 🔥</td></>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/* ============================================================
   SUMMARY VIEW
   ============================================================ */
function SummaryView({ level, result, navigate }) {
  const meta = LEVEL_CONFIG[level] || { icon: "🎮", label: "Level" };
  if (!result) {
    return <div className="loading-center"><p>No summary data.</p><button className="primary-btn" onClick={() => navigate("dashboard")}>Dashboard</button></div>;
  }
  const stars = result.stars || 0;
  const grades = [
    { min: 5, letter: "S", msg: "Outstanding! Near-perfect sustainability." },
    { min: 4, letter: "A", msg: "Excellent work balancing sustainability!" },
    { min: 3, letter: "B", msg: "Good balance across all indicators." },
    { min: 2, letter: "C", msg: "Decent effort, room to improve." },
    { min: 0, letter: "D", msg: "Level completed, but sustainability needs work." },
  ];
  const grade = grades.find((g) => stars >= g.min);

  return (
    <div className="summary-center">
      <div className="summary-card panel">
        <div className="summary-icon">{meta.icon}</div>
        <h2>{meta.label} Level Complete!</h2>
        <div className="grade-circle"><span className="grade-letter">{grade.letter}</span></div>
        <div className="summary-stars">{"⭐".repeat(stars)}{"☆".repeat(5 - stars)}</div>
        <p className="subtext">{grade.msg}</p>
        <div className="summary-metrics">
          <div className="sm"><span className="sm-label">Sustainability</span><span className="sm-val highlight">{result.sustainability}</span></div>
          <div className="sm"><span className="sm-label">Waste</span><span className="sm-val">{result.waste}</span></div>
          <div className="sm"><span className="sm-label">Resources</span><span className="sm-val">{result.resources}</span></div>
          <div className="sm"><span className="sm-label">Cost</span><span className="sm-val">{result.cost}</span></div>
          <div className="sm"><span className="sm-label">Best Streak</span><span className="sm-val">🔥 {result.best_streak || 0}</span></div>
          <div className="sm"><span className="sm-label">Total Turns</span><span className="sm-val">{result.turns_completed}</span></div>
        </div>
        <div className="summary-actions">
          <button className="primary-btn" onClick={() => navigate("game", { level })}>Keep Playing →</button>
          <button className="ghost-btn" onClick={() => navigate("history", { level })}>View History</button>
          <button className="ghost-btn" onClick={() => navigate("dashboard")}>Dashboard</button>
        </div>
      </div>
    </div>
  );
}

export default GamePage;
