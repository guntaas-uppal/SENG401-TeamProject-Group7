const { applyOptionToProgress, getTimeMultiplier, checkAchievements } = require('../services/gameService');

describe('getTimeMultiplier', () => {
  test('returns 1.4 in early game (0-30% turns)', () => {
    expect(getTimeMultiplier('household', 0)).toBe(1.4);
    expect(getTimeMultiplier('household', 14)).toBe(1.4);
  });
  test('returns 1.0 in mid game (30-70% turns)', () => {
    expect(getTimeMultiplier('household', 20)).toBe(1.0);
    expect(getTimeMultiplier('household', 30)).toBe(1.0);
  });
  test('returns 0.7 in late game (>70% turns)', () => {
    expect(getTimeMultiplier('household', 40)).toBe(0.7);
    expect(getTimeMultiplier('household', 49)).toBe(0.7);
  });
});
  
describe('applyOptionToProgress', () => {
  const baseProgress = {
    level: 'household', turns_completed: 0,
    waste: 50, resources: 50, cost: 50, sustainability: 50,
    streak: 0, best_streak: 0, stars: 0, unlocked: 1
  };

  test('increments turns_completed by 1', () => {
    const result = applyOptionToProgress(baseProgress, { type:'neutral', waste:0, resources:0, cost:0, sustainability:0 });
    expect(result.turns_completed).toBe(1);
  });

  test('clamps sustainability to max 100', () => {
    const highSust = { ...baseProgress, sustainability: 98 };
    const result = applyOptionToProgress(highSust, { type:'positive', waste:0, resources:0, cost:0, sustainability:10 });
    expect(result.sustainability).toBeLessThanOrEqual(100);
  });

  test('clamps sustainability to min 0', () => {
    const lowSust = { ...baseProgress, sustainability: 2 };
    const result = applyOptionToProgress(lowSust, { type:'negative', waste:0, resources:0, cost:0, sustainability:-10 });
    expect(result.sustainability).toBeGreaterThanOrEqual(0);
  });

  test('increments streak on positive choice', () => {
    const result = applyOptionToProgress(baseProgress, { type:'positive', waste:0, resources:0, cost:0, sustainability:3 });
    expect(result.streak).toBe(1);
  });

  test('resets streak to 0 on negative choice', () => {
    const withStreak = { ...baseProgress, streak: 4 };
    const result = applyOptionToProgress(withStreak, { type:'negative', waste:0, resources:0, cost:0, sustainability:-3 });
    expect(result.streak).toBe(0);
  });

  test('awards +3 streakBonus at multiples of 5 streak', () => {
    const withStreak = { ...baseProgress, streak: 4 };
    const result = applyOptionToProgress(withStreak, { type:'positive', waste:0, resources:0, cost:0, sustainability:3 });
    expect(result._streakBonus).toBe(3);
  });

  test('early game multiplier boosts positive sustainability', () => {
    const earlyProgress = { ...baseProgress, turns_completed: 5 };
    const result = applyOptionToProgress(earlyProgress, { type:'positive', waste:0, resources:0, cost:0, sustainability:5 });
    expect(result.sustainability).toBeGreaterThan(50 + 5); // boosted beyond raw delta
  });
});
  
describe('checkAchievements', () => {
  test('awards first_step after 1 total turn', () => {
    const rows = [
      { level:'household', turns_completed:1, sustainability:50, stars:0, unlocked:1, best_streak:0 },
      { level:'city',      turns_completed:0, sustainability:50, stars:0, unlocked:0, best_streak:0 },
      { level:'country',   turns_completed:0, sustainability:50, stars:0, unlocked:0, best_streak:0 },
    ];
    const earned = checkAchievements(rows);
    expect(earned).toContain('first_step');
  });

  test('awards household_complete after 50 household turns', () => {
    const rows = [
      { level:'household', turns_completed:50, sustainability:70, stars:3, unlocked:1, best_streak:0 },
      { level:'city',      turns_completed:0,  sustainability:50, stars:0, unlocked:1, best_streak:0 },
      { level:'country',   turns_completed:0,  sustainability:50, stars:0, unlocked:0, best_streak:0 },
    ];
    expect(checkAchievements(rows)).toContain('household_complete');
  });
});