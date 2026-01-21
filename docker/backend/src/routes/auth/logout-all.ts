import { FastifyInstance } from "fastify";
import { logoutAllController } from "../../controllers/auth.controller";

export default async function(
	fastify: FastifyInstance,
) {
	fastify.post('/logout-all', {
		preHandler: [fastify.authenticate, fastify.csrfProtection]
	},
		logoutAllController
	);
}
