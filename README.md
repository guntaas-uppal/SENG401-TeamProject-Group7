# SENG401-TeamProject-Group7
# EcoSim - SDG 12 Sustainability Simulator

**SENG 401 Group 7 | University of Calgary**

EcoSim is a turn-based serious game built around United Nations Sustainable Development Goal 12: Responsible Consumption and Production. The goal of the game is to help players understand how everyday decisions around consumption and production affect sustainability outcomes. Players do not need any prior knowledge of sustainability to play. The game teaches through action and consequence, not lectures.

---

## Table of Contents

- [Project Goal](#project-goal)
- [How the Game Works](#how-the-game-works)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation and Setup](#installation-and-setup)
- [Running the App](#running-the-app)
- [Demo Accounts](#demo-accounts)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [API Routes](#api-routes)
- [Team](#team)

---

## Project Goal

Most people know sustainability matters but struggle to see how their individual choices connect to larger outcomes. EcoSim bridges that gap by putting players in charge of real decision scenarios at three different scales: a household, a city, and a country.

Each decision you make affects four live metrics:

- **Waste** - how much waste your choices generate
- **Resources** - how heavily you consume natural resources
- **Cost** - the financial impact of your decisions
- **Sustainability Score** - your overall environmental performance

The game is designed so that players who act early and consistently do significantly better than those who delay. This is intentional. It reflects a real principle: the sooner sustainable action is taken, the more impact it has.

---

## How the Game Works

**Three levels, increasing in scale and difficulty:**

1. **Household** - Make daily decisions about energy use, shopping, food, transport, and waste. 50 turns.
2. **City** - Shape municipal policy on transit, infrastructure, recycling, and urban planning. 52 turns.
3. **Country** - Direct national strategy on carbon policy, energy, trade, and environmental law. 60 turns.

City unlocks after completing 25 household turns. Country unlocks after completing all 50 household turns.

**Time-based multiplier system:**

Your decisions hit differently depending on when you make them.

- Early game (first 30% of turns): positive decisions are 1.4x more effective
- Mid game (30% to 70%): decisions have standard 1.0x impact
- Late game (last 30%): positive decisions drop to 0.7x effectiveness and negative decisions become 1.35x more damaging

This mechanic teaches players that delaying action has real costs.

**Streak system:**

Making 5 consecutive sustainable choices earns a +3 sustainability bonus. Streaks reset the moment you make a negative choice.

**Achievements:**

There are 9 unlockable achievements including First Step, Home Keeper, City Planner, World Leader, On a Roll, Unstoppable, Perfection, Green Champion, and Full Circle.

**Star ratings:**

Each level is rated 0 to 5 stars based on your sustainability score at completion. A leaderboard tracks top performers globally and per level.

---

## Tech Stack

| Layer    | Technology          |
|----------|---------------------|
| Frontend | React 19, Vite 7    |
| Backend  | Node.js, Express    |
| Database | SQLite3             |
| Auth     | bcryptjs            |

---

## Prerequisites

Before you start, make sure you have the following installed:

- Node.js version 18 or higher
- npm (comes with Node.js)

You can check your versions by running:

```bash
node -v
npm -v
```

---

## Installation and Setup

**Step 1: Clone the repository**

```bash
git clone https://github.com/your-username/SENG401_Project.git
cd SENG401_Project
```

**Step 2: Install server dependencies**

```bash
cd server
npm install
```

**Step 3: Install client dependencies**

```bash
cd ../client
npm install
```

The database is created automatically when the server starts for the first time. No manual database setup is needed.

---

## Running the App

You need two terminals open at the same time, one for the backend and one for the frontend.

**Terminal 1 - Start the backend server:**

```bash
cd server
npm run dev
```

The backend runs at: http://localhost:5000

**Terminal 2 - Start the frontend:**

```bash
cd client
npm run dev
```

The frontend runs at: http://localhost:5173

Open http://localhost:5173 in your browser. Use one of the demo accounts below to log in immediately, or create your own account.

---

## Demo Accounts

These accounts are pre-seeded into the database so you can test different game states right away.

| ID          | Password   | State                         |
|-------------|------------|-------------------------------|
| ADMIN-001   | admin123   | All levels unlocked           |
| PLAYER-001  | player123  | Fresh start, no progress      |
| PLAYER-025  | player123  | 25 turns into household level |
| PLAYER-050  | player123  | Household level completed     |
| PLAYER-CITY | player123  | City level in progress        |

The admin account bypasses all level locks and is useful for testing any level directly.

---

## Project Structure

```
SENG401_Project/
  client/
    src/
      components/
        DecisionCard.jsx       - Renders each decision option card
        MetricBar.jsx          - Animated metric bar component
      pages/
        LoginPage.jsx          - Login and signup screen
        GamePage.jsx           - Main game shell and all views
      utils/
        api.js                 - All fetch calls to the backend
      App.jsx                  - Top-level routing between pages
      main.jsx                 - React entry point
      index.css                - All global styles and CSS variables
    package.json
    vite.config.js
  server/
    data/
      events.js                - Aggregates all three event files
      householdEvents.js       - All household scenario events
      cityEvents.js            - All city scenario events
      countryEvents.js         - All country scenario events
    db/
      database.js              - SQLite connection, schema, seed data
    routes/
      authRoutes.js            - Login and signup endpoints
      gameRoutes.js            - All game API endpoints
    services/
      gameService.js           - Core game engine and logic
    scripts/
      initDb.js                - Script to reset and re-seed the database
    app.js                     - Express server entry point
    package.json
  README.md
```

---

## Database Schema

### users

| Column        | Type | Description                  |
|---------------|------|------------------------------|
| id            | TEXT | Primary key, chosen by user  |
| name          | TEXT | Display name                 |
| password_hash | TEXT | bcrypt hashed password       |
| role          | TEXT | player or admin              |
| created_at    | TEXT | Timestamp                    |

### user_progress

| Column          | Type    | Description                        |
|-----------------|---------|------------------------------------|
| user_id         | TEXT    | References users.id                |
| level           | TEXT    | household, city, or country        |
| turns_completed | INTEGER | How many turns played              |
| waste           | INTEGER | Current waste score (0 to 100)     |
| resources       | INTEGER | Current resource score (0 to 100)  |
| cost            | INTEGER | Current cost score (0 to 100)      |
| sustainability  | INTEGER | Current sustainability (0 to 100)  |
| stars           | INTEGER | Stars earned (0 to 5)              |
| unlocked        | INTEGER | 0 = locked, 1 = unlocked           |
| streak          | INTEGER | Current consecutive positive turns |
| best_streak     | INTEGER | All-time best streak               |

### decision_history

| Column                  | Type    | Description                         |
|-------------------------|---------|-------------------------------------|
| user_id                 | TEXT    |                                     |
| level                   | TEXT    |                                     |
| event_key               | TEXT    | Identifier of the scenario event    |
| turn_number             | INTEGER |                                     |
| option_label            | TEXT    | Text of the chosen option           |
| option_type             | TEXT    | positive, neutral, or negative      |
| waste_change            | INTEGER | Delta applied to waste              |
| resources_change        | INTEGER | Delta applied to resources          |
| cost_change             | INTEGER | Delta applied to cost               |
| sustainability_change   | INTEGER | Delta applied to sustainability     |
| time_multiplier         | REAL    | Multiplier active at time of choice |
| created_at              | TEXT    |                                     |

### achievements

| Column          | Type | Description                      |
|-----------------|------|----------------------------------|
| user_id         | TEXT |                                  |
| achievement_key | TEXT | Unique key for the achievement   |
| unlocked_at     | TEXT | Timestamp when it was earned     |

---

## API Routes

### Auth

| Method | Route             | Description                     |
|--------|-------------------|---------------------------------|
| POST   | /auth/login       | Log in with ID and password     |
| POST   | /auth/signup      | Create a new player account     |
| GET    | /auth/demo-users  | List all available demo accounts|

### Game

| Method | Route                        | Description                              |
|--------|------------------------------|------------------------------------------|
| GET    | /game/summary/:userId        | Get all level progress and achievements  |
| GET    | /game/progress/:userId/:level| Get current progress and next event      |
| POST   | /game/choose                 | Submit a decision for the current turn   |
| POST   | /game/reset/:userId/:level   | Reset a level back to zero               |
| GET    | /game/leaderboard            | Overall leaderboard across all levels    |
| GET    | /game/leaderboard/:level     | Leaderboard filtered by level            |
| GET    | /game/history/:userId/:level | Full decision history with stats         |

---

## Team

| Name                  | Role                            |
|-----------------------|---------------------------------|
| Sukhansh Singh Nagi   | Project Manager and Integration |
| Tahil Goyal           | Frontend Developer              |
| Rizam Goyal           | Backend Developer               |
| Jindjeet Singh Cheema | Database Engineer               |
| Rajdeep Das           | Game Logic and Events           |
| Guntaas Singh Uppal   | Integration and Testing         |

---

University of Calgary - SENG 401 Team Project - Group 7