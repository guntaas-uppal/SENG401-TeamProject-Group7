import { useEffect, useState, useRef } from "react";
import { api } from "../utils/api";
import DecisionCard from "../components/DecisionCard";
import MetricBar from "../components/MetricBar";

const LEVEL_CONFIG = {
household: { icon: "🏠", label: "Household", timeUnit: "Day", objective: 50, unlockAt: 25 },
city: { icon: "🏙️", label: "City", timeUnit: "Week", objective: 52 },
country: { icon: "🌍", label: "Country", timeUnit: "Month", objective: 60 },
};

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
};

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

// Navbar
const navBar = (
    <header className="top-bar">
    <div className="top-bar-left">
        <span className="brand-icon" onClick={() => navigate("dashboard")}>🌿</span>
        <div>
        <h1 className="brand-title" onClick={() => navigate("dashboard")}>EcoSim</h1>
        <p className="subtext">Logged in as {user.name} ({user.role})</p>
        </div>
    </div>
    <div className="top-bar-nav">
        <button className={⁠ nav-btn ${view === "dashboard" ? "active" : ""} ⁠} onClick={() => navigate("dashboard")}>Dashboard</button>
        <button className={⁠ nav-btn ${view === "leaderboard" ? "active" : ""} ⁠} onClick={() => navigate("leaderboard")}>🏆 Leaderboard</button>
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

// Route to the right view
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
    {/* Hero */}
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

    {/* Level Cards */}
    <section>
        <h2 className="section-title">Your Levels</h2>
        <div className="level-cards">
        {Object.entries(LEVEL_CONFIG).map(([key, cfg]) => {
            const lvl = levels[key] || {};
            const unlocked = isUnlocked(key);
            const pct = Math.min(100, Math.round(((lvl.turns_completed || 0) / cfg.objective) * 100));
            return (
            <div key={key} className={⁠ level-card ${unlocked ? "" : "locked"} ⁠} onClick={() => unlocked && navigate("game", { level: key })}>
                {!unlocked && <div className="lock-badge">🔒</div>}
                <div className="lc-icon">{cfg.icon}</div>
                <h3>{cfg.label}</h3>
                <p className="subtext">{cfg.timeUnit}-based decisions</p>
                <div className="progress-bar"><div className="progress-fill" style={{ width: ⁠ ${pct}% ⁠ }} /></div>
                <p className="subtext">{lvl.turns_completed || 0} / {cfg.objective} turns</p>
                <div className="lc-bottom">
                <span>Score: {lvl.sustainability || 50}</span>
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

    {/* Achievements */}
    <section>
        <h2 className="section-title">Achievements <span className="subtext">({earnedKeys.size}/{Object.keys(ACHIEVEMENTS).length})</span></h2>
        <div className="achievements-grid">
        {Object.entries(ACHIEVEMENTS).map(([key, def]) => (
            <div key={key} className={⁠ achievement ${earnedKeys.has(key) ? "unlocked" : "locked"} ⁠}>
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
    PLAY VIEW (the actual game)
    ============================================================ */
function PlayView({ user, level, navigate, onUpdate }) {
const [progress, setProgress] = useState(null);
const [event, setEvent] = useState(null);
const [loading, setLoading] = useState(true);
const [choosing, setChoosing] = useState(false);
const [feedback, setFeedback] = useState(null);
const [toasts, setToasts] = useState([]);
const [showReset, setShowReset] = useState(false);

const meta = LEVEL_CONFIG[level];

useEffect(() => { loadLevel(); }, [level, user.id]);

async function loadLevel() {
    try {
    setLoading(true);
    setFeedback(null);
    const result = await api.getProgress(user.id, level);
    setProgress(result.progress);
    setEvent(result.event);
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

async function handleChoose(optionIndex) {
    if (!event || choosing) return;
    try {
    setChoosing(true);
    const result = await api.chooseOption({ userId: user.id, level, eventKey: event.key, optionIndex });
    const opt = result.selectedOption;

    setFeedback({
        label: opt.label, type: opt.type,
        changes: { waste: opt.waste, resources: opt.resources, cost: opt.cost, sustainability: opt.sustainability },
        timeMultiplier: result.timeMultiplier, streakBonus: result.streakBonus, streak: result.progress.streak,
    });

    if (result.newAchievements?.length) {
        result.newAchievements.forEach((a) => addToast(⁠ ${a.icon} Achievement: ${a.label} ⁠, "achievement"));
    }
    if (result.streakBonus > 0) addToast(⁠ 🔥 Streak bonus! +${result.streakBonus} sustainability ⁠, "streak");

    setProgress(result.progress);
    setEvent(result.nextEvent);
    onUpdate();

    if (result.progress.turns_completed >= meta.objective && result.progress.stars > 0) {
        setTimeout(() => navigate("summary", { level, result: result.progress }), 2000);
    }
    } catch (err) {
    addToast(err.message, "error");
    } finally {
    setChoosing(false);
    }
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
const phase = progress.turns_completed / meta.objective <= 0.3 ? "early" : progress.turns_completed / meta.objective <= 0.7 ? "mid" : "late";

return (
    <>
    {/* Toasts */}
    <div className="toast-container">
        {toasts.map((t) => (
        <div key={t.id} className={⁠ toast toast-${t.type} ⁠}>{t.msg}</div>
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
        <span className={⁠ phase-badge phase-${phase} ⁠}>
            {phase === "early" ? "🌅 Early (1.4× bonus)" : phase === "mid" ? "☀️ Mid (1.0×)" : "🌙 Late (0.7× bonus)"}
        </span>
        {progress.streak > 0 && <span className="streak-badge">🔥 {progress.streak} streak</span>}
        </div>
    </div>

    {/* Turn Progress */}
    <div className="turn-progress">
        <div className="progress-bar full-width"><div className="progress-fill" style={{ width: ⁠ ${turnPct}% ⁠ }} /></div>
    </div>

    {/* Metrics */}
    <div className="dashboard-grid">
        <section className="panel">
        <h3>Sustainability Indicators</h3>
        <MetricBar label="Waste Generation" value={progress.waste} color="#c74949" invertGood />
        <MetricBar label="Resource Usage" value={progress.resources} color="#b8860b" invertGood />
        <MetricBar label="Financial Cost" value={progress.cost} color="#7d4ea8" invertGood />
        <MetricBar label="Sustainability Score" value={progress.sustainability} color="#2f9b4e" />
        <p className="subtext">Lower = better for waste, resources, cost. Higher = better for sustainability.</p>
        {progress.stars > 0 && (
            <p className="stars-display">{"⭐".repeat(progress.stars)}{"☆".repeat(5 - progress.stars)} — {progress.stars}/5 Stars</p>
        )}
        </section>
    </div>

    {/* Feedback */}
    {feedback && (
        <div className={⁠ feedback-panel feedback-${feedback.type} ⁠}>
        <div className="feedback-top">
            <span className="feedback-badge">
            {feedback.type === "positive" ? "✅ Sustainable" : feedback.type === "negative" ? "⚠️ Unsustainable" : "➡️ Moderate"}
            </span>
            {feedback.timeMultiplier !== 1.0 && <span className="subtext">Time effect: {feedback.timeMultiplier}×</span>}
        </div>
        <p>{feedback.label}</p>
        <div className="feedback-changes">
            {Object.entries(feedback.changes).map(([k, v]) => {
            if (v === 0) return null;
            const good = k === "sustainability" ? v > 0 : v < 0;
            return <span key={k} className={⁠ change-tag ${good ? "good" : "bad"} ⁠}>{k}: {v > 0 ? "+" : ""}{v}</span>;
            })}
            {feedback.streakBonus > 0 && <span className="change-tag good">streak: +{feedback.streakBonus}</span>}
        </div>
        </div>
    )}

    {/* Event */}
    {event && (
        <section className="event-panel">
        <div className="event-header">
            <span className="turn-badge">{meta.timeUnit} {progress.turns_completed + 1}</span>
            <h2>{event.title}</h2>
        </div>
        <p className="event-desc">{event.description}</p>
        <div className="cards-column">
            {event.options.map((option, index) => (
            <DecisionCard key={index} option={option} index={index} onChoose={() => handleChoose(index)} disabled={choosing} />
            ))}
        </div>
        </section>
    )}

    {/* Actions */}
    <div className="game-actions">
        <button className="ghost-btn" onClick={() => navigate("history", { level })}>📜 Decision History</button>
        <button className="danger-ghost-btn" onClick={() => setShowReset(true)}>🔄 Reset Level</button>
    </div>

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
            <div className="stat-card positive"><span className="stat-num">{stats.positive_count || 0}</span><span className="stat-label">Sustainable</span></div>
            <div className="stat-card neutral"><span className="stat-num">{stats.neutral_count || 0}</span><span className="stat-label">Moderate</span></div>
            <div className="stat-card negative"><span className="stat-num">{stats.negative_count || 0}</span><span className="stat-label">Unsustainable</span></div>
            <div className="stat-card"><span className="stat-num">{(stats.avg_sustainability_change || 0).toFixed(1)}</span><span className="stat-label">Avg. Impact</span></div>
            </div>
        )}

        {total > 0 && (
            <div className="dist-bar">
            <div className="dist-fill positive" style={{ width: ⁠ ${(stats.positive_count / total) * 100}% ⁠ }} />
            <div className="dist-fill neutral" style={{ width: ⁠ ${(stats.neutral_count / total) * 100}% ⁠ }} />
            <div className="dist-fill negative" style={{ width: ⁠ ${(stats.negative_count / total) * 100}% ⁠ }} />
            </div>
        )}

        <div className="timeline">
            {decisions.length === 0 ? (
            <div className="empty-state">
                <p>No decisions recorded for this level yet.</p>
                <button className="primary-btn" onClick={() => navigate("game", { level: selectedLevel })}>Start Playing →</button>
            </div>
            ) : decisions.map((d, i) => (
            <div key={i} className={⁠ timeline-entry ${d.option_type} ⁠}>
                <div className="tl-turn">Turn {d.turn_number}</div>
                <div className={⁠ tl-dot ${d.option_type} ⁠} />
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
        <h2>🏆 Leaderboard</h2>
    </div>

    <div className="level-switcher-row">
        <button className={selectedLevel === null ? "active" : ""} onClick={() => setSelectedLevel(null)}>🌐 Overall</button>
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
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : ⁠ ${i + 1} ⁠;
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
    SUMMARY VIEW (after level completion)
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
    { min: 0, letter: "D", msg: "You completed the level, but sustainability suffered." },
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
        <div className="sm"><span className="sm-label">Sustainability</span><span className="sm-val green">{result.sustainability}</span></div>
        <div className="sm"><span className="sm-label">Waste</span><span className="sm-val red">{result.waste}</span></div>
        <div className="sm"><span className="sm-label">Resources</span><span className="sm-val amber">{result.resources}</span></div>
        <div className="sm"><span className="sm-label">Cost</span><span className="sm-val purple">{result.cost}</span></div>
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