import Fastify from "fastify";
import { Server } from "./server";

declare module 'fastify' {
	interface FastifyInstance {
		config: {
			DB_URL: string,
			JWT_SECRET: string,
			JWT_EXP: string,
			REFRESH_TOKEN_EXP: string,
			HOST: string,
			PORT: number,
			COOKIE_SECRET: string
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

	await fastify.listen({ port: Number(process.env.PORT), host: process.env.HOST })
}


start().catch(err => {
	console.error("Error: " + err);
	process.exit(1);
})
