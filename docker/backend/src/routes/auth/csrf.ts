import { FastifyInstance } from "fastify";
import { getCsrfTokenController } from "../../controllers/csrf.controller";

export default async function (fastify: FastifyInstance) {
	fastify.get('/auth/csrf', getCsrfTokenController);
}
