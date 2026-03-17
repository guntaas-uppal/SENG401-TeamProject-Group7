const request = require('supertest');
const app     = require('../app');

describe('GET /game/summary/:userId', () => {
  test('returns user, levels, and achievements for valid user', async () => {
    const res = await request(app).get('/game/summary/PLAYER-001');
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.levels).toBeDefined();
    expect(res.body.levels.household).toBeDefined();
    expect(res.body.levels.city).toBeDefined();
    expect(res.body.levels.country).toBeDefined();
  });

  test('returns 404 for unknown user', async () => {
    const res = await request(app).get('/game/summary/NOBODY-999');
    expect(res.status).toBe(404);
  });
});

describe('GET /game/progress/:userId/:level', () => {
  test('returns progress and a random event for unlocked level', async () => {
    const res = await request(app).get('/game/progress/PLAYER-001/household');
    expect(res.status).toBe(200);
    expect(res.body.progress).toBeDefined();
    expect(res.body.event).toBeDefined();
    expect(res.body.event.options.length).toBeGreaterThan(0);
  });

  test('returns 403 for locked level', async () => {
    const res = await request(app).get('/game/progress/PLAYER-001/city');
    expect(res.status).toBe(403);
  });
});

describe('POST /game/choose', () => {
  test('submits a turn and returns updated progress + nextEvent', async () => {
    // Get a valid event key first
    const prog = await request(app).get('/game/progress/PLAYER-001/household');
    const eventKey = prog.body.event.key;

    const res = await request(app)
      .post('/game/choose')
      .send({ userId: 'PLAYER-001', level: 'household', eventKey, optionIndex: 0 });

    expect(res.status).toBe(200);
    expect(res.body.progress.turns_completed).toBeGreaterThan(0);
    expect(res.body.nextEvent).toBeDefined();
    expect(res.body.selectedOption).toBeDefined();
    expect(res.body.timeMultiplier).toBeDefined();
  });
});

describe('GET /game/leaderboard', () => {
  test('returns leaderboard array', async () => {
    const res = await request(app).get('/game/leaderboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.leaderboard)).toBe(true);
  });
});

describe('POST /game/reset/:userId/:level', () => {
  test('resets household progress to 0 turns', async () => {
    const res = await request(app).post('/game/reset/PLAYER-025/household');
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/reset/i);
  });
});