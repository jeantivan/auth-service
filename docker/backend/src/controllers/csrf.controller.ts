import { FastifyReply, FastifyRequest } from "fastify";

export async function getCsrfTokenController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const token = reply.generateCsrf();
	return reply.send({ csrfToken: token });
}
