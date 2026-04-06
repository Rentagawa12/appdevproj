/**
 * Integration tests — Lost & Found API
 *
 * Run with:  npm test
 *
 * These tests spin up the Express app in-process and hit it with supertest.
 * A real MongoDB connection is required (set TEST_MONGO_URI in .env or env).
 */

import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';

const MONGO_URI = process.env.TEST_MONGO_URI
  || process.env.MONGO_URI
  || 'mongodb://localhost:27017/lostAndFound_test';

// ── Helpers ───────────────────────────────────────────────────────────────────
const adminCreds  = { username: 'testadmin',  password: 'admin123', role: 'admin' };
const normalCreds = { username: 'testuser99', password: 'user1234' };

async function registerAndLogin(creds) {
  await request(app).post('/api/auth/register').send(creds);
  const res = await request(app).post('/api/auth/login').send(creds);
  return res.body.token;
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────
beforeAll(async () => {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true, useUnifiedTopology: true,
  });
});

afterAll(async () => {
  // Clean up test users and items, then close
  await mongoose.connection.db.collection('users').deleteMany({
    username: { $in: [adminCreds.username, normalCreds.username] },
  });
  await mongoose.connection.db.collection('items').deleteMany({ contactInfo: 'test@tip.edu.ph' });
  await mongoose.disconnect();
});

// ── Auth endpoints ────────────────────────────────────────────────────────────
describe('POST /api/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    const res = await request(app).post('/api/auth/register').send(normalCreds);
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.role).toBe('user');
  });

  it('rejects duplicate username', async () => {
    const res = await request(app).post('/api/auth/register').send(normalCreds);
    expect(res.status).toBe(409);
  });

  it('rejects short password', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'newbie', password: '123' });
    expect(res.status).toBe(422);
  });
});

describe('POST /api/auth/login', () => {
  it('returns token for valid credentials', async () => {
    const res = await request(app).post('/api/auth/login').send(normalCreds);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('rejects wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: normalCreds.username, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });
});

// ── Items — public read ───────────────────────────────────────────────────────
describe('GET /api/items', () => {
  it('is publicly accessible', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('filters by status query param', async () => {
    const res = await request(app).get('/api/items?status=lost');
    expect(res.status).toBe(200);
    res.body.forEach(item => expect(item.status).toBe('lost'));
  });
});

// ── Items — authenticated write ───────────────────────────────────────────────
describe('POST /api/items', () => {
  let token;
  beforeAll(async () => { token = await registerAndLogin(normalCreds); });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/items').send({});
    expect(res.status).toBe(401);
  });

  it('creates an item with valid data', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .field('itemName', 'Blue Umbrella')
      .field('description', 'Found near the canteen')
      .field('dateLostOrFound', '2024-05-01')
      .field('status', 'found')
      .field('contactInfo', 'test@tip.edu.ph');
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
  });

  it('rejects missing required fields', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ itemName: 'Incomplete' });
    expect(res.status).toBe(422);
    expect(res.body).toHaveProperty('errors');
  });

  it('rejects invalid status value', async () => {
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .field('itemName', 'Test')
      .field('description', 'Test desc')
      .field('dateLostOrFound', '2024-05-01')
      .field('status', 'stolen')           // invalid
      .field('contactInfo', 'test@tip.edu.ph');
    expect(res.status).toBe(422);
  });
});

// ── Items — PATCH (auth required) ─────────────────────────────────────────────
describe('PATCH /api/items/:id', () => {
  let token;
  let itemId;

  beforeAll(async () => {
    token = await registerAndLogin(normalCreds);
    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${token}`)
      .field('itemName', 'Patch Test Item')
      .field('description', 'For patch test')
      .field('dateLostOrFound', '2024-05-01')
      .field('status', 'lost')
      .field('contactInfo', 'test@tip.edu.ph');
    itemId = res.body._id;
  });

  it('updates status when authenticated', async () => {
    const res = await request(app)
      .patch(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'claimed' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('claimed');
  });

  it('rejects unauthenticated PATCH', async () => {
    const res = await request(app)
      .patch(`/api/items/${itemId}`)
      .send({ status: 'found' });
    expect(res.status).toBe(401);
  });
});

// ── Items — DELETE (admin only) ───────────────────────────────────────────────
describe('DELETE /api/items/:id', () => {
  let adminToken;
  let userToken;
  let itemId;

  beforeAll(async () => {
    adminToken = await registerAndLogin(adminCreds);
    userToken  = await registerAndLogin(normalCreds);

    const res = await request(app)
      .post('/api/items')
      .set('Authorization', `Bearer ${userToken}`)
      .field('itemName', 'Delete Target')
      .field('description', 'Will be deleted')
      .field('dateLostOrFound', '2024-05-01')
      .field('status', 'lost')
      .field('contactInfo', 'test@tip.edu.ph');
    itemId = res.body._id;
  });

  it('returns 401 without token', async () => {
    const res = await request(app).delete(`/api/items/${itemId}`);
    expect(res.status).toBe(401);
  });

  it('returns 403 for non-admin users', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${userToken}`);
    expect(res.status).toBe(403);
  });

  it('deletes item when admin token is provided', async () => {
    const res = await request(app)
      .delete(`/api/items/${itemId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.status).toBe(204);
  });
});
