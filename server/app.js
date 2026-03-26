const express = require("express");
const cors = require("cors");
const { initializeDatabase, all } = require("./db/database");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.json({
    name: "SDG 12 Sustainability Simulator API",
    version: "2.0.0",
    status: "running",
  });
});

// Debug: all users
app.get("/debug/users", async (req, res) => {
  try {
    const users = await all("SELECT * FROM users");
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: all progress
app.get("/debug/progress", async (req, res) => {
  try {
    const progress = await all("SELECT * FROM user_progress");
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: progress for one user
app.get("/debug/progress/:userId", async (req, res) => {
  try {
    const progress = await all(
      "SELECT * FROM user_progress WHERE user_id = ?",
      [req.params.userId]
    );
    res.json(progress);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: achievements
app.get("/debug/achievements", async (req, res) => {
  try {
    const achievements = await all("SELECT * FROM achievements");
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: history
app.get("/debug/history", async (req, res) => {
  try {
    const history = await all("SELECT * FROM decision_history");
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Debug: full data for one user
app.get("/debug/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    const users = await all("SELECT * FROM users WHERE id = ?", [userId]);
    const progress = await all(
      "SELECT * FROM user_progress WHERE user_id = ?",
      [userId]
    );
    const achievements = await all(
      "SELECT * FROM achievements WHERE user_id = ?",
      [userId]
    );
    const history = await all(
      "SELECT * FROM decision_history WHERE user_id = ?",
      [userId]
    );

    res.json({
      user: users[0] || null,
      progress,
      achievements,
      history,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
