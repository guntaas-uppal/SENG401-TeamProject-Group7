
  const sqlite3 = require("sqlite3").verbose();
  const path = require("path");
  const bcrypt = require("bcryptjs");
  
  const dbPath = path.join(__dirname, "..", "data", "sdg12_game.db");
  const db = new sqlite3.Database(dbPath);
  
  function run(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }
  
  function get(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
  
  function all(sql, params = []) {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
  
  async function seedDemoData() {
    const users = [
      { id: "ADMIN-001", name: "Admin User", password: "admin123", role: "admin" },
      { id: "PLAYER-001", name: "Starter Player", password: "player123", role: "player" },
      { id: "PLAYER-025", name: "Day 25 Player", password: "player123", role: "player" },
      { id: "PLAYER-050", name: "Day 50 Player", password: "player123", role: "player" },
      { id: "PLAYER-CITY", name: "City Progress Player", password: "player123", role: "player" },
    ];
  
    for (const user of users) {
      const hash = bcrypt.hashSync(user.password, 10);
      await run(
        `INSERT OR IGNORE INTO users (id, name, password_hash, role) VALUES (?, ?, ?, ?)`,
        [user.id, user.name, hash, user.role]
      );
    }
  
    const progressRows = [
      ["ADMIN-001", "household", 60, 20, 20, 35, 95, 5, 1],
      ["ADMIN-001", "city", 52, 25, 24, 38, 92, 5, 1],
      ["ADMIN-001", "country", 60, 28, 26, 40, 90, 5, 1],
      ["PLAYER-001", "household", 0, 50, 50, 50, 50, 0, 1],
      ["PLAYER-001", "city", 0, 50, 50, 50, 50, 0, 0],
      ["PLAYER-001", "country", 0, 50, 50, 50, 50, 0, 0],
      ["PLAYER-025", "household", 25, 46, 47, 52, 61, 0, 1],
      ["PLAYER-025", "city", 0, 50, 50, 50, 50, 0, 1],
      ["PLAYER-025", "country", 0, 50, 50, 50, 50, 0, 0],
      ["PLAYER-050", "household", 50, 38, 40, 57, 74, 3, 1],
      ["PLAYER-050", "city", 0, 50, 50, 50, 50, 0, 1],
      ["PLAYER-050", "country", 0, 50, 50, 50, 50, 0, 1],
      ["PLAYER-CITY", "household", 32, 44, 42, 55, 68, 0, 1],
      ["PLAYER-CITY", "city", 10, 47, 46, 52, 64, 0, 1],
      ["PLAYER-CITY", "country", 0, 50, 50, 50, 50, 0, 0],
    ];
  
    for (const row of progressRows) {
      await run(
        `INSERT OR IGNORE INTO user_progress
         (user_id, level, turns_completed, waste, resources, cost, sustainability, stars, unlocked)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        row
      );
    }
  }
  
  function initializeDatabase() {
    db.serialize(async () => {
      try {
        await run(`
          CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            password_hash TEXT NOT NULL,
            role TEXT NOT NULL DEFAULT 'player',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
  
        await run(`
          CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            level TEXT NOT NULL,
            turns_completed INTEGER NOT NULL DEFAULT 0,
            waste INTEGER NOT NULL DEFAULT 50,
            resources INTEGER NOT NULL DEFAULT 50,
            cost INTEGER NOT NULL DEFAULT 50,
            sustainability INTEGER NOT NULL DEFAULT 50,
            stars INTEGER NOT NULL DEFAULT 0,
            unlocked INTEGER NOT NULL DEFAULT 0,
            streak INTEGER NOT NULL DEFAULT 0,
            best_streak INTEGER NOT NULL DEFAULT 0,
            UNIQUE(user_id, level)
          )
        `);
  
        await run(`
          CREATE TABLE IF NOT EXISTS decision_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            level TEXT NOT NULL,
            event_key TEXT NOT NULL,
            turn_number INTEGER NOT NULL,
            option_label TEXT NOT NULL,
            option_type TEXT NOT NULL DEFAULT 'neutral',
            waste_change INTEGER NOT NULL,
            resources_change INTEGER NOT NULL,
            cost_change INTEGER NOT NULL,
            sustainability_change INTEGER NOT NULL,
            time_multiplier REAL NOT NULL DEFAULT 1.0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `);
  
        await run(`
          CREATE TABLE IF NOT EXISTS achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id TEXT NOT NULL,
            achievement_key TEXT NOT NULL,
            unlocked_at TEXT DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, achievement_key)
          )
        `);
  
        // Add streak columns if they don't exist (migration for existing DBs)
        try {
          await run(`ALTER TABLE user_progress ADD COLUMN streak INTEGER NOT NULL DEFAULT 0`);
        } catch (e) { /* column may already exist */ }
        try {
          await run(`ALTER TABLE user_progress ADD COLUMN best_streak INTEGER NOT NULL DEFAULT 0`);
        } catch (e) { /* column may already exist */ }
        try {
          await run(`ALTER TABLE decision_history ADD COLUMN option_type TEXT NOT NULL DEFAULT 'neutral'`);
        } catch (e) { /* column may already exist */ }
        try {
          await run(`ALTER TABLE decision_history ADD COLUMN time_multiplier REAL NOT NULL DEFAULT 1.0`);
        } catch (e) { /* column may already exist */ }
  
        await seedDemoData();
        console.log("Database initialized successfully.");
      } catch (error) {
        console.error("Database initialization error:", error.message);
      }
    });
  }
  
  module.exports = { db, run, get, all, initializeDatabase };
  
