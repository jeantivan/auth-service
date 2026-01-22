import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function(fastify: FastifyInstance) {
	fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
		try {
			await request.jwtVerify();
		} catch (err) {
			reply.code(401).send({ error: "Unauthorized" });
		}
	})
}
