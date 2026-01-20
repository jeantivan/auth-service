import Fastify from "fastify";
import { Server } from "./server";

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			DB_URL: string,
			JWT_SECRET: string,
			JWT_EXP: string,
			REFRESH_TOKEN_EXP: string
			BACKEND_HOST: string
			BACKEND_PORT: number
		}
		authenticate: any
	}
}

const start = async () => {
	const fastify = Fastify({
		trustProxy: true,
		logger: {
			level: process.env.NODE_ENV === 'development' ? 'debug' : 'info'
		}
	});

	await fastify.register(Server);

	await fastify.listen({ port: Number(process.env.BACKEND_PORT), host: process.env.BACKEND_HOST })
}


start().catch(err => {
	console.error("Error: " + err);
	process.exit(1);
})
