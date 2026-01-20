import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export default async function(fastify: FastifyInstance) {
	fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
		await request.jwtVerify();
	})
}
