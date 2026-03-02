const express = require("express");
const { get, all, run } = require("../db/database");
const {
getRandomEvent,
applyOptionToProgress,
LEVEL_META,
ACHIEVEMENT_DEFS,
checkAchievements,
} = require("../services/gameService");
const events = require("../data/events");

const router = express.Router();

function buildSummaryRows(rows) {
const levels = {};
for (const key of ["household", "city", "country"]) {
    levels[key] = {
    level: key, turns_completed: 0, waste: 50, resources: 50,
    cost: 50, sustainability: 50, stars: 0, unlocked: 0, streak: 0, best_streak: 0,
    };
}
rows.forEach((row) => {
    levels[row.level] = { ...row, unlocked: Boolean(row.unlocked) };
});
return levels;
}

// GET /game/summary/:userId
router.get("/summary/:userId", async (req, res) => {
try {
    const { userId } = req.params;
    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) return res.status(404).json({ error: "User not found." });

    const progressRows = await all(
    `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked, streak, best_streak
        FROM user_progress WHERE user_id = ?
        ORDER BY CASE level WHEN 'household' THEN 1 WHEN 'city' THEN 2 WHEN 'country' THEN 3 END`,
    [userId]
    );
    const levels = buildSummaryRows(progressRows);

    // Achievements
    const earnedKeys = checkAchievements(progressRows);
    const existing = await all(`SELECT achievement_key FROM achievements WHERE user_id = ?`, [userId]);
    const existingSet = new Set(existing.map((a) => a.achievement_key));
    for (const key of earnedKeys) {
    if (!existingSet.has(key)) {
        await run(`INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)`, [userId, key]);
    }
    }
    const achievements = await all(`SELECT achievement_key, unlocked_at FROM achievements WHERE user_id = ?`, [userId]);

    res.json({ user, levels, achievements });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// GET /game/progress/:userId/:level
router.get("/progress/:userId/:level", async (req, res) => {
try {
    const { userId, level } = req.params;
    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) return res.status(404).json({ error: "User not found." });

    const progress = await get(
    `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked, streak, best_streak
        FROM user_progress WHERE user_id = ? AND level = ?`,
    [userId, level]
    );
    if (!progress) return res.status(404).json({ error: "Progress not found for level." });
    if (!progress.unlocked && user.role !== "admin") return res.status(403).json({ error: "Level is locked." });

    const event = getRandomEvent(level);
    res.json({ user, progress: { ...progress, unlocked: Boolean(progress.unlocked) }, event });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// POST /game/choose
router.post("/choose", async (req, res) => {
try {
    const { userId, level, eventKey, optionIndex } = req.body;
    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) return res.status(404).json({ error: "User not found." });

    const progress = await get(
    `SELECT user_id, level, turns_completed, waste, resources, cost, sustainability, stars, unlocked, streak, best_streak
        FROM user_progress WHERE user_id = ? AND level = ?`,
    [userId, level]
    );
    if (!progress) return res.status(404).json({ error: "Progress not found." });
    if (!progress.unlocked && user.role !== "admin") return res.status(403).json({ error: "Level is locked." });

    const levelEvents = events[level] || [];
    const event = levelEvents.find((item) => item.key === eventKey);
    if (!event) return res.status(404).json({ error: "Event not found." });

    const option = event.options[optionIndex];
    if (!option) return res.status(400).json({ error: "Invalid option index." });

    const updated = applyOptionToProgress(progress, option);

    await run(
    `UPDATE user_progress
        SET turns_completed = ?, waste = ?, resources = ?, cost = ?, sustainability = ?, stars = ?, streak = ?, best_streak = ?
        WHERE user_id = ? AND level = ?`,
    [updated.turns_completed, updated.waste, updated.resources, updated.cost,
        updated.sustainability, updated.stars, updated.streak, updated.best_streak, userId, level]
    );

    await run(
    `INSERT INTO decision_history
        (user_id, level, event_key, turn_number, option_label, option_type, waste_change, resources_change, cost_change, sustainability_change, time_multiplier)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [userId, level, eventKey, updated.turns_completed, option.label, option.type,
        option.waste, option.resources, option.cost, option.sustainability, updated._timeMultiplier || 1.0]
    );

    // Unlock logic
    if (level === "household") {
    if (updated.turns_completed >= 25) {
        await run(`UPDATE user_progress SET unlocked = 1 WHERE user_id = ? AND level = 'city'`, [userId]);
    }
    if (updated.turns_completed >= 50) {
        await run(`UPDATE user_progress SET unlocked = 1 WHERE user_id = ? AND level = 'country'`, [userId]);
    }
    }

    const refreshedProgress = await get(
    `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked, streak, best_streak
        FROM user_progress WHERE user_id = ? AND level = ?`, [userId, level]
    );
    const progressRows = await all(
    `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked, streak, best_streak
        FROM user_progress WHERE user_id = ?
        ORDER BY CASE level WHEN 'household' THEN 1 WHEN 'city' THEN 2 WHEN 'country' THEN 3 END`, [userId]
    );
    const summary = buildSummaryRows(progressRows);
    const nextEvent = getRandomEvent(level);

    // Check new achievements
    const earnedKeys = checkAchievements(progressRows);
    const existingAch = await all(`SELECT achievement_key FROM achievements WHERE user_id = ?`, [userId]);
    const existingSet = new Set(existingAch.map((a) => a.achievement_key));
    const newAchievements = [];
    for (const key of earnedKeys) {
    if (!existingSet.has(key)) {
        await run(`INSERT OR IGNORE INTO achievements (user_id, achievement_key) VALUES (?, ?)`, [userId, key]);
        const def = ACHIEVEMENT_DEFS.find((d) => d.key === key);
        if (def) newAchievements.push({ key: def.key, label: def.label, icon: def.icon, description: def.description });
    }
    }

    res.json({
    progress: { ...refreshedProgress, unlocked: Boolean(refreshedProgress.unlocked) },
    summary, nextEvent, selectedOption: option,
    timeMultiplier: updated._timeMultiplier || 1.0,
    streakBonus: updated._streakBonus || 0,
    newAchievements,
    });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// POST /game/reset/:userId/:level
router.post("/reset/:userId/:level", async (req, res) => {
try {
    const { userId, level } = req.params;
    await run(
    `UPDATE user_progress SET turns_completed = 0, waste = 50, resources = 50, cost = 50, sustainability = 50, stars = 0, streak = 0
        WHERE user_id = ? AND level = ?`, [userId, level]
    );
    await run(`DELETE FROM decision_history WHERE user_id = ? AND level = ?`, [userId, level]);
    res.json({ message: `${level} progress reset successfully.` });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// GET /game/leaderboard/:level
router.get("/leaderboard/:level", async (req, res) => {
try {
    const { level } = req.params;
    if (!["household", "city", "country"].includes(level)) return res.status(400).json({ error: "Invalid level." });
    const rows = await all(
    `SELECT u.id, u.name, p.turns_completed, p.sustainability, p.stars, p.best_streak, p.waste, p.resources, p.cost
        FROM user_progress p JOIN users u ON u.id = p.user_id
        WHERE p.level = ? AND p.turns_completed > 0
        ORDER BY p.stars DESC, p.sustainability DESC, p.waste ASC LIMIT 50`, [level]
    );
    res.json({ level, leaderboard: rows });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// GET /game/leaderboard
router.get("/leaderboard", async (req, res) => {
try {
    const rows = await all(
    `SELECT u.id, u.name, SUM(p.stars) as total_stars, MAX(p.sustainability) as best_sustainability,
            SUM(p.turns_completed) as total_turns, MAX(p.best_streak) as best_streak
        FROM user_progress p JOIN users u ON u.id = p.user_id
        WHERE p.turns_completed > 0 GROUP BY u.id
        ORDER BY total_stars DESC, best_sustainability DESC LIMIT 50`
    );
    res.json({ leaderboard: rows });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

// GET /game/history/:userId/:level
router.get("/history/:userId/:level", async (req, res) => {
try {
    const { userId, level } = req.params;
    const rows = await all(
    `SELECT turn_number, event_key, option_label, option_type,
            waste_change, resources_change, cost_change, sustainability_change, time_multiplier, created_at
        FROM decision_history WHERE user_id = ? AND level = ?
        ORDER BY turn_number DESC LIMIT 100`, [userId, level]
    );
    const stats = await get(
    `SELECT COUNT(*) as total_decisions,
            SUM(CASE WHEN option_type = 'positive' THEN 1 ELSE 0 END) as positive_count,
            SUM(CASE WHEN option_type = 'neutral' THEN 1 ELSE 0 END) as neutral_count,
            SUM(CASE WHEN option_type = 'negative' THEN 1 ELSE 0 END) as negative_count,
            AVG(sustainability_change) as avg_sustainability_change
        FROM decision_history WHERE user_id = ? AND level = ?`, [userId, level]
    );
    res.json({ level, decisions: rows, stats });
} catch (error) {
    res.status(500).json({ error: error.message });
}
});

module.exports = router;


