const events = require("../data/events");

const OBJECTIVE_TURNS = {
  household: 50,
  city: 52,
  country: 60,
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function getRandomEvent(level) {
  const pool = events[level] || [];
  if (!pool.length) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index];
}

function calculateStars(level, turnsCompleted, sustainability) {
  const objective = OBJECTIVE_TURNS[level] || 0;

  if (turnsCompleted < objective) {
    return 0;
  }

  let stars = 1;

  if (sustainability >= 60) stars += 1;
  if (sustainability >= 70) stars += 1;
  if (sustainability >= 80) stars += 1;
  if (sustainability >= 90) stars += 1;

  return Math.min(stars, 5);
}

function applyOptionToProgress(progress, option) {
  const updated = {
    ...progress,
    turns_completed: progress.turns_completed + 1,
    waste: clamp(progress.waste + option.waste),
    resources: clamp(progress.resources + option.resources),
    cost: clamp(progress.cost + option.cost),
    sustainability: clamp(progress.sustainability + option.sustainability),
  };

  updated.stars = calculateStars(
    progress.level,
    updated.turns_completed,
    updated.sustainability
  );

  return updated;
}

module.exports = {
  OBJECTIVE_TURNS,
  getRandomEvent,
  calculateStars,
  applyOptionToProgress,
};