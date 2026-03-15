const express = require("express");
const { get, all, run } = require("../db/database");
const {
  getRandomEvent,
  applyOptionToProgress,
} = require("../services/gameService");
const events = require("../data/events");

const router = express.Router();

function getLevelOrder(level) {
  if (level === "household") return 1;
  if (level === "city") return 2;
  return 3;
}

function buildSummaryRows(rows) {
  const levels = {
    household: {
      level: "household",
      turns_completed: 0,
      waste: 50,
      resources: 50,
      cost: 50,
      sustainability: 50,
      stars: 0,
      unlocked: 0,
    },
    city: {
      level: "city",
      turns_completed: 0,
      waste: 50,
      resources: 50,
      cost: 50,
      sustainability: 50,
      stars: 0,
      unlocked: 0,
    },
    country: {
      level: "country",
      turns_completed: 0,
      waste: 50,
      resources: 50,
      cost: 50,
      sustainability: 50,
      stars: 0,
      unlocked: 0,
    },
  };

  rows.forEach((row) => {
    levels[row.level] = {
      ...row,
      unlocked: Boolean(row.unlocked),
    };
  });

  return levels;
}

router.get("/summary/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const progressRows = await all(
      `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked
       FROM user_progress
       WHERE user_id = ?
       ORDER BY CASE level
         WHEN 'household' THEN 1
         WHEN 'city' THEN 2
         WHEN 'country' THEN 3
       END`,
      [userId]
    );

    const levels = buildSummaryRows(progressRows);

    res.json({
      user,
      levels,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/progress/:userId/:level", async (req, res) => {
  try {
    const { userId, level } = req.params;

    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const progress = await get(
      `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked
       FROM user_progress
       WHERE user_id = ? AND level = ?`,
      [userId, level]
    );

    if (!progress) {
      return res.status(404).json({ error: "Progress not found for level." });
    }

    if (!progress.unlocked && user.role !== "admin") {
      return res.status(403).json({ error: "Level is locked." });
    }

    const event = getRandomEvent(level);

    res.json({
      user,
      progress: {
        ...progress,
        unlocked: Boolean(progress.unlocked),
      },
      event,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/choose", async (req, res) => {
  try {
    const { userId, level, eventKey, optionIndex } = req.body;

    const user = await get(`SELECT id, name, role FROM users WHERE id = ?`, [userId]);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const progress = await get(
      `SELECT user_id, level, turns_completed, waste, resources, cost, sustainability, stars, unlocked
       FROM user_progress
       WHERE user_id = ? AND level = ?`,
      [userId, level]
    );

    if (!progress) {
      return res.status(404).json({ error: "Progress not found." });
    }

    if (!progress.unlocked && user.role !== "admin") {
      return res.status(403).json({ error: "Level is locked." });
    }

    const levelEvents = events[level] || [];
    const event = levelEvents.find((item) => item.key === eventKey);

    if (!event) {
      return res.status(404).json({ error: "Event not found." });
    }

    const option = event.options[optionIndex];
    if (!option) {
      return res.status(400).json({ error: "Invalid option index." });
    }

    const updated = applyOptionToProgress(progress, option);

    await run(
      `UPDATE user_progress
       SET turns_completed = ?, waste = ?, resources = ?, cost = ?, sustainability = ?, stars = ?
       WHERE user_id = ? AND level = ?`,
      [
        updated.turns_completed,
        updated.waste,
        updated.resources,
        updated.cost,
        updated.sustainability,
        updated.stars,
        userId,
        level,
      ]
    );

    await run(
      `INSERT INTO decision_history
       (user_id, level, event_key, turn_number, option_label, waste_change, resources_change, cost_change, sustainability_change)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        level,
        eventKey,
        updated.turns_completed,
        option.label,
        option.waste,
        option.resources,
        option.cost,
        option.sustainability,
      ]
    );

    if (level === "household") {
      if (updated.turns_completed >= 25) {
        await run(
          `UPDATE user_progress SET unlocked = 1 WHERE user_id = ? AND level = 'city'`,
          [userId]
        );
      }

      if (updated.turns_completed >= 50) {
        await run(
          `UPDATE user_progress SET unlocked = 1 WHERE user_id = ? AND level = 'country'`,
          [userId]
        );
      }
    }

    const refreshedProgress = await get(
      `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked
       FROM user_progress
       WHERE user_id = ? AND level = ?`,
      [userId, level]
    );

    const progressRows = await all(
      `SELECT level, turns_completed, waste, resources, cost, sustainability, stars, unlocked
       FROM user_progress
       WHERE user_id = ?
       ORDER BY CASE level
         WHEN 'household' THEN 1
         WHEN 'city' THEN 2
         WHEN 'country' THEN 3
       END`,
      [userId]
    );

    const summary = buildSummaryRows(progressRows);
    const nextEvent = getRandomEvent(level);

    res.json({
      progress: {
        ...refreshedProgress,
        unlocked: Boolean(refreshedProgress.unlocked),
      },
      summary,
      nextEvent,
      selectedOption: option,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;