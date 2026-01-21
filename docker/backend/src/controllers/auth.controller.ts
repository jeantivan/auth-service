import { FastifyReply, FastifyRequest } from "fastify";
import { registerUser, loginUser, refreshSession, logoutSession, logoutAllUserSessions } from "../services/auth.service";
import { refreshCookieOptions } from "../config/cookies";
import { getRefreshToken } from "../utils/token";

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

	const clientType = request.headers['x-client-type'] || 'web';

	const result = await loginUser(request.server, request.body as any, meta);

	if (clientType === 'web') {
		reply.setCookie('refreshToken', result.refreshToken, refreshCookieOptions);
		return reply.send({ accessToken: result.accessToken });
	}

	return reply.send(result);
}

export async function refreshController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const refreshToken = getRefreshToken(request);

	if (!refreshToken) {
		return reply.code(400).send({ error: 'Missing refresh token' });
	}

	try {
		const result = await refreshSession(
			request.server,
			refreshToken,
			{
				userAgent: request.headers['user-agent'],
				ip: request.ip
			}
		);

		if (!(request.headers['x-client-type'] === 'mobile')) {
			reply.setCookie('refreshToken', result.refreshToken, refreshCookieOptions);
			return reply.send({ accessToken: result.accessToken });
		}

		return reply.send(result);
	} catch (error: any) {
		return reply.code(401).send({ message: error.message || 'Unauthorized' });
	}
}

export async function logoutController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const refreshToken = getRefreshToken(request);

	if (!refreshToken) {
		return reply.code(204).send();
	}

	await logoutSession(request.server, refreshToken);

	reply.clearCookie('refreshToken', { path: '/auth/refresh' });

	return reply.code(204).send();
}

export async function logoutAllController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const refreshToken = getRefreshToken(request);

	if (!refreshToken) {
		return reply.code(204).send();
	}

	await logoutSession(request.server, refreshToken);

	const userId = (request.user as any).sub;

	await logoutAllUserSessions(request.server, userId);

	reply.clearCookie('refreshToken', { path: '/auth/refresh' });

	return reply.code(204).send();
}
