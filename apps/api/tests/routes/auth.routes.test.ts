import type { Express } from 'express';
import request from 'supertest';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';

let app: Express;

describe('Auth Routes Integration (Real Handler)', () => {
  beforeAll(async () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'test-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'test-client-secret');
    vi.stubEnv('CORS_ORIGIN', 'http://localhost:3000');
    app = (await import('../../src/app')).app;
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it('1. Auth handler reachability (returns exact success status)', async () => {
    const okResponse = await request(app).get('/api/auth/ok').set('Host', 'localhost:5000');
    expect(okResponse.status).toBe(200);
  });

  it('2. Google provider is accepted', async () => {
    const response = await request(app)
      .post('/api/auth/sign-in/social')
      .set('Host', 'localhost:5000')
      .send({ provider: 'google', callbackURL: 'http://localhost:3000/home' });

    if (response.status !== 200) {
      console.log('TEST 2 FAILED. Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Body:', response.body);
      console.log('Text:', response.text);
    }

    // Better Auth should accept it and return 200 with JSON { url, redirect: true }
    expect(response.status).toBe(200);
    expect(response.body as Record<string, unknown>).toHaveProperty('url');
    expect(response.body as Record<string, unknown>).toHaveProperty('redirect', true);
    expect((response.body as Record<string, unknown>).url).toContain('accounts.google.com');
  });

  it('3. Unsupported provider is rejected', async () => {
    const response = await request(app)
      .post('/api/auth/sign-in/social')
      .set('Host', 'localhost:5000')
      .send({ provider: 'github', callbackURL: 'http://localhost:3000/home' });

    // Better Auth returns 404 for unconfigured providers
    expect(response.status).toBe(404);
  });

  it('4. Session endpoint remains reachable', async () => {
    const response = await request(app).get('/api/auth/get-session').set('Host', 'localhost:5000');
    // Unauthenticated request returns 200 OK (with null session body)
    expect(response.status).toBe(200);
  });

  it('5. Existing API behavior works (JSON body parser works for API routes)', async () => {
    // Send a JSON body to the deterministic endpoint
    const response = await request(app)
      .post('/health/echo')
      .set('Host', 'localhost:5000')
      .send({ hello: 'world', nested: { data: 123 } });

    // Assert 200 OK and verify the parsed JSON body is returned exactly
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ body: { hello: 'world', nested: { data: 123 } } });
  });
});
