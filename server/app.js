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

app.get("/debug/users", async (req, res) => {
  try {
    const { all } = require("./db/database"); // ✅ correct import
    const users = await all("SELECT * FROM users");
    res.json(users);
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

module.exports = app; // export BEFORE listen

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}
