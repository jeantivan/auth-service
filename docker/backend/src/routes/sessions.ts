import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { getSessionsController } from "../controllers/session.controller";

export default async function (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions
) {
	fastify.get('/sessions', {
		preHandler: [fastify.authenticate]
	}, getSessionsController);
}
