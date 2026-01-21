import { FastifyInstance } from "fastify";
import { logoutController } from "../../controllers/auth.controller";

export default async function (fastify: FastifyInstance) {
	fastify.post('/logout', {
		preHandler: [fastify.csrfProtection]
	}, logoutController);
}
