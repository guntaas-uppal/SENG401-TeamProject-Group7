
const events = require("../data/events");

const OBJECTIVE_TURNS = {
  household: 50,
  city: 52,
  country: 60,
};

const TIME_LABELS = {
  household: "Day",
  city: "Week",
  country: "Month",
};

const LEVEL_META = {
  household: {
    label: "Household",
    timeUnit: "Day",
    objective: 50,
    unlockNext: 25,
    description: "Manage daily household consumption decisions",
    icon: "🏠",
  },
  city: {
    label: "City",
    timeUnit: "Week",
    objective: 52,
    unlockNext: null,
    description: "Shape municipal sustainability policies",
    icon: "🏙️",
  },
  country: {
    label: "Country",
    timeUnit: "Month",
    objective: 60,
    unlockNext: null,
    description: "Direct national environmental strategy",
    icon: "🌍",
  },
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(value)));
}

/**
 * Time-based multiplier: early sustainable actions are more effective.
 * Returns a multiplier between 0.6 and 1.4 depending on how early/late in the level.
 */
function getTimeMultiplier(level, turnsCompleted) {
  const objective = OBJECTIVE_TURNS[level] || 50;
  const progress = turnsCompleted / objective; // 0.0 → 1.0+

  // Early game (0-30%): 1.4x multiplier for positive effects
  // Mid game (30-70%): 1.0x
  // Late game (70%+): 0.7x for positive, 1.3x for negative
  if (progress <= 0.3) return 1.4;
  if (progress <= 0.7) return 1.0;
  return 0.7;
}

/**
 * Late-game penalty multiplier for negative choices.
 * Negative decisions hurt MORE the later you make them.
 */
function getLateGamePenalty(level, turnsCompleted) {
  const objective = OBJECTIVE_TURNS[level] || 50;
  const progress = turnsCompleted / objective;

  if (progress <= 0.3) return 1.0;
  if (progress <= 0.7) return 1.15;
  return 1.35;
}

function getRandomEvent(level) {
  const pool = events[level] || [];
  if (!pool.length) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function calculateStars(level, turnsCompleted, sustainability) {
  const objective = OBJECTIVE_TURNS[level] || 0;
  if (turnsCompleted < objective) return 0;

  let stars = 1;
  if (sustainability >= 60) stars += 1;
  if (sustainability >= 70) stars += 1;
  if (sustainability >= 80) stars += 1;
  if (sustainability >= 90) stars += 1;

  return Math.min(stars, 5);
}

function applyOptionToProgress(progress, option) {
  const level = progress.level;
  const turns = progress.turns_completed;
  const timeMultiplier = getTimeMultiplier(level, turns);
  const latePenalty = getLateGamePenalty(level, turns);

  // Determine if this is a positive or negative option
  const isPositive = option.type === "positive";
  const isNegative = option.type === "negative";

  // Apply time-based multiplier to sustainability changes
  let sustainDelta = option.sustainability;
  if (isPositive && sustainDelta > 0) {
    sustainDelta = Math.round(sustainDelta * timeMultiplier);
  } else if (isNegative && sustainDelta < 0) {
    sustainDelta = Math.round(sustainDelta * latePenalty);
  }

  // Apply multipliers to waste (inverted: positive = less waste)
  let wasteDelta = option.waste;
  if (isNegative && wasteDelta > 0) {
    wasteDelta = Math.round(wasteDelta * latePenalty);
  }

  // Streak logic
  let streak = progress.streak || 0;
  let bestStreak = progress.best_streak || 0;
  if (isPositive) {
    streak += 1;
  } else {
    streak = 0;
  }
  if (streak > bestStreak) bestStreak = streak;

  // Streak bonus: every 5 consecutive positive decisions, bonus sustainability
  let streakBonus = 0;
  if (streak > 0 && streak % 5 === 0) {
    streakBonus = 3;
  }

  const updated = {
    ...progress,
    turns_completed: turns + 1,
    waste: clamp(progress.waste + wasteDelta),
    resources: clamp(progress.resources + option.resources),
    cost: clamp(progress.cost + option.cost),
    sustainability: clamp(progress.sustainability + sustainDelta + streakBonus),
    streak,
    best_streak: bestStreak,
  };

  updated.stars = calculateStars(level, updated.turns_completed, updated.sustainability);
  updated._timeMultiplier = timeMultiplier;
  updated._streakBonus = streakBonus;

  return updated;
}

// Achievement definitions
const ACHIEVEMENT_DEFS = [
  { key: "first_step", label: "First Step", description: "Complete your first turn", icon: "🌱", check: (h) => h.totalTurns >= 1 },
  { key: "household_complete", label: "Home Keeper", description: "Complete the Household level", icon: "🏠", check: (h) => h.householdTurns >= 50 },
  { key: "city_unlock", label: "City Planner", description: "Unlock the City level", icon: "🏙️", check: (h) => h.cityUnlocked },
  { key: "country_unlock", label: "World Leader", description: "Unlock the Country level", icon: "🌍", check: (h) => h.countryUnlocked },
  { key: "streak_5", label: "On a Roll", description: "Get a 5-turn positive streak", icon: "🔥", check: (h) => h.bestStreak >= 5 },
  { key: "streak_10", label: "Unstoppable", description: "Get a 10-turn positive streak", icon: "⚡", check: (h) => h.bestStreak >= 10 },
  { key: "five_stars", label: "Perfection", description: "Earn 5 stars on any level", icon: "⭐", check: (h) => h.maxStars >= 5 },
  { key: "sustainability_90", label: "Green Champion", description: "Reach 90+ sustainability on any level", icon: "♻️", check: (h) => h.maxSustainability >= 90 },
  { key: "all_levels", label: "Full Circle", description: "Play all three levels", icon: "🎯", check: (h) => h.householdTurns > 0 && h.cityTurns > 0 && h.countryTurns > 0 },
];

function checkAchievements(progressRows) {
  const household = progressRows.find((r) => r.level === "household") || {};
  const city = progressRows.find((r) => r.level === "city") || {};
  const country = progressRows.find((r) => r.level === "country") || {};

  const context = {
    totalTurns: (household.turns_completed || 0) + (city.turns_completed || 0) + (country.turns_completed || 0),
    householdTurns: household.turns_completed || 0,
    cityTurns: city.turns_completed || 0,
    countryTurns: country.turns_completed || 0,
    cityUnlocked: Boolean(city.unlocked),
    countryUnlocked: Boolean(country.unlocked),
    bestStreak: Math.max(household.best_streak || 0, city.best_streak || 0, country.best_streak || 0),
    maxStars: Math.max(household.stars || 0, city.stars || 0, country.stars || 0),
    maxSustainability: Math.max(household.sustainability || 0, city.sustainability || 0, country.sustainability || 0),
  };

  const earned = [];
  for (const def of ACHIEVEMENT_DEFS) {
    if (def.check(context)) {
      earned.push(def.key);
    }
  }
  return earned;
}

module.exports = {
  OBJECTIVE_TURNS,
  TIME_LABELS,
  LEVEL_META,
  getRandomEvent,
  calculateStars,
  applyOptionToProgress,
  getTimeMultiplier,
  ACHIEVEMENT_DEFS,
  checkAchievements,
};


