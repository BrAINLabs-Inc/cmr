import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('GET /api/health', () => {
  it('reports ok without requiring auth', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });
});

describe('auth guarding', () => {
  it('rejects diary routes with no bearer token', async () => {
    const res = await request(app).get('/api/diary/weeks');
    expect(res.status).toBe(401);
  });

  it('rejects admin routes with no bearer token', async () => {
    const res = await request(app).get('/api/admin/students');
    expect(res.status).toBe(401);
  });
});

describe('request validation', () => {
  it('rejects registration with a malformed body before touching the database', async () => {
    const res = await request(app).post('/api/auth/register').send({ email: 'not-an-email' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request');
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/api/does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not found' });
  });
});
