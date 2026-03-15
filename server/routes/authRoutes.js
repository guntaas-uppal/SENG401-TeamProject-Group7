const express = require("express");
const bcrypt = require("bcryptjs");
const { get, all, run } = require("../db/database");

const router = express.Router();

router.get("/demo-users", async (req, res) => {
  try {
    const rows = await all(
      `SELECT id, name, role FROM users ORDER BY id ASC`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { id, password } = req.body;

    if (!id || !password) {
      return res.status(400).json({ error: "ID and password are required." });
    }

    const user = await get(`SELECT * FROM users WHERE id = ?`, [id]);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const validPassword = bcrypt.compareSync(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid password." });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/signup", async (req, res) => {
  try {
    const { id, name, password } = req.body;

    if (!id || !name || !password) {
      return res.status(400).json({ error: "ID, name, and password are required." });
    }

    const existing = await get(`SELECT id FROM users WHERE id = ?`, [id]);

    if (existing) {
      return res.status(409).json({ error: "User ID already exists." });
    }

    const passwordHash = bcrypt.hashSync(password, 10);

    await run(
      `INSERT INTO users (id, name, password_hash, role) VALUES (?, ?, ?, 'player')`,
      [id, name, passwordHash]
    );

    await run(
      `INSERT INTO user_progress (user_id, level, unlocked) VALUES (?, 'household', 1)`,
      [id]
    );
    await run(
      `INSERT INTO user_progress (user_id, level, unlocked) VALUES (?, 'city', 0)`,
      [id]
    );
    await run(
      `INSERT INTO user_progress (user_id, level, unlocked) VALUES (?, 'country', 0)`,
      [id]
    );

    res.status(201).json({
      user: {
        id,
        name,
        role: "player",
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;