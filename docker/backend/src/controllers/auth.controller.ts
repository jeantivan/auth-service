import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser, loginUser, refreshSession, logoutSession, logoutAllUserSessions } from "../services/auth.service";

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

export async function refreshController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const authHeader = request.headers['authorization'];

	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return reply.code(401).send({ message: 'Invalid authorization header' });
	}

	const refreshToken = authHeader.replace('Bearer ', '');

	try {
		const result = await refreshSession(
			request.server,
			refreshToken,
			{
				userAgent: request.headers['user-agent'],
				ip: request.ip
			}
		);

		return reply.send(result);
	} catch (error: any) {
		return reply.code(401).send({ message: error.message || 'Unauthorized' });
	}
}

export async function logoutController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const authHeader = request.headers.authorization;

	if (!authHeader?.startsWith('Bearer ')) {
		return reply.code(400).send({ error: 'Missing or invalid Authorization header' });
	}

	const refreshToken = authHeader.replace('Bearer ', '');

	await logoutSession(request.server, refreshToken);

	return reply.code(204).send();
}

export async function logoutAllController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const userId = (request.user as any).sub;

	await logoutAllUserSessions(request.server, userId);

	return reply.code(204).send();
}
