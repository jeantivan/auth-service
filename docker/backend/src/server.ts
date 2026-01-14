import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import fastifyEnv from '@fastify/env';
import fastifyJWT from '@fastify/jwt';
import fastifyPostgres from '@fastify/postgres';

import { schema, type Env } from './env.schema';
import fastifySensible from '@fastify/sensible';
import fastifyHelmet from '@fastify/helmet';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';

export async function Server(fastify: FastifyInstance, opts: FastifyPluginOptions) {

	// Register all plugin in order

	//  Plugin to access all environment vars
	await fastify.register(fastifyEnv, { schema, dotenv: true })

	// Plugin to use standard http errors and more
	await fastify.register(fastifySensible);

	// Security Headers
	await fastify.register(fastifyHelmet);

	// CORS
	await fastify.register(fastifyCors, {
		origin: true,
		credentials: true
	});

	// Handle cookies
	await fastify.register(fastifyCookie);

	// To add rate-limit to routes
	await fastify.register(fastifyRateLimit, {
		max: 100,
		timeWindow: '1 minute'
	})

	// Plugin to use postgres
	await fastify.register(fastifyPostgres, { connectionString: fastify.config.DB_URL})

	// Plugin add utils to work with JSON Web Tokens
	await fastify.register(fastifyJWT, { secret: fastify.getEnvs<Env>().JWT_SECRET });

}


