const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/database");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.json({ name: "SDG 12 Sustainability Simulator API", version: "2.0.0", status: "running" });
});

app.get("/debug/users", (req, res) => {
  const db = require("./db/database");

  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

module.exports = app; // export BEFORE listen

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
