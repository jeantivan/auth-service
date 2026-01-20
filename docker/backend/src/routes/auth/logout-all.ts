import { FastifyInstance } from "fastify";
import { logoutAllController } from "../../controllers/auth.controller";

export default async function(
	fastify: FastifyInstance,
) {
	fastify.post('/auth/logout-all', {
		preHandler: [fastify.authenticate] },
		logoutAllController
	);
}
