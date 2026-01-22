import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildTestServer } from '../helpers/buildTestServer';

describe('GET /ping', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    fastify = await buildTestServer();
  });

  afterAll(async () => {
    await fastify.close();
  });

  it('should return a pong message', async () => {
    const response = await fastify.inject({
      method: 'GET',
      url: '/ping'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ message: 'pooong\n' });
  });

  it('should accept GET requests only', async () => {
    const response = await fastify.inject({
      method: 'POST',
      url: '/ping'
    });

    expect(response.statusCode).toBe(404);
  });
});
