const express = require("express");
const cors = require("cors");
const { initializeDatabase } = require("./db/database");
const authRoutes = require("./routes/authRoutes");
const gameRoutes = require("./routes/gameRoutes");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.send("SDG 12 backend is running");
});

app.use("/auth", authRoutes);
app.use("/game", gameRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});