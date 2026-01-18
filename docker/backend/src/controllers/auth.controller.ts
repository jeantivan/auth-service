import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser, loginUser } from "../services/auth.service";

export async function registerController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const user = await registerUser(request.server, request.body as any);

	return reply.code(201).send(user);
}

export async function loginController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const meta = {
		userAgent: request.headers['user-agent'],
		ip: request.ip
	};

	const result = await loginUser(request.server, request.body as any, meta);

	return reply.send(result);
}
