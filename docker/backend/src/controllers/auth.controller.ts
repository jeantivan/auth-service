import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser } from "../services/auth.service";

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await registerUser(request.server, request.body as any);

	return reply.code(201).send(user);
}
