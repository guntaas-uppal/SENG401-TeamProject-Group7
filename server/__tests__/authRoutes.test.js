const request  = require('supertest');
const app      = require('../app');
const { run }  = require('../db/database');

describe('POST /auth/login', () => {
  test('returns 200 and user object for valid credentials', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ id: 'PLAYER-001', password: 'player123' });
    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.id).toBe('PLAYER-001');
    expect(res.body.user.role).toBe('player');
  });

  test('returns 401 for wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ id: 'PLAYER-001', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  test('returns 404 for non-existent user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ id: 'NOBODY-999', password: 'anything' });
    expect(res.status).toBe(404);
  });

  test('returns 400 when id or password missing', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ id: 'PLAYER-001' });
    expect(res.status).toBe(400);
  });
});

describe('GET /auth/demo-users', () => {
  test('returns array of users', async () => {
    const res = await request(app).get('/auth/demo-users');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});