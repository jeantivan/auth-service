import Fastify, { FastifyInstance } from 'fastify';
import { Server } from '../../server';

/**
 * Build a test server instance without listening on a port
 * Useful for testing routes with fastify.inject()
 *
 * Example:
 * ```ts
 * const fastify = await buildTestServer();
 * const response = await fastify.inject({
 *   method: 'GET',
 *   url: '/ping'
 * });
 * await fastify.close();
 * ```
 */
export async function buildTestServer(): Promise<FastifyInstance> {
  process.env.DB_URL ??= 'postgres://postgres:postgres@localhost:5432/postgres';
  process.env.JWT_SECRET ??= 'test-jwt-secret';
  process.env.JWT_EXP ??= '15m';
  process.env.REFRESH_TOKEN_EXP ??= '7d';
  process.env.HOST ??= '127.0.0.1';
  process.env.PORT ??= '4000';
  process.env.COOKIE_SECRET ??= 'test-cookie-secret';

  const fastify = Fastify({
    logger: false,
    trustProxy: true
  });

  // Register the server plugin (includes all plugins and routes)
  await fastify.register(Server);

  return fastify;
}
