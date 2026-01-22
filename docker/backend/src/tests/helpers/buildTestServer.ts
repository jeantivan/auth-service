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
  const fastify = Fastify({
    logger: false,
    trustProxy: true
  });

  // Register the server plugin (includes all plugins and routes)
  await fastify.register(Server);

  return fastify;
}
