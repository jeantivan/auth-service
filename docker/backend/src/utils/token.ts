import crypto from 'crypto';
import { FastifyRequest } from 'fastify';

export function generateRefreshToken(): string {
	return crypto.randomBytes(64).toString('hex');
}

export function hashToken(token: string) : string {
	return crypto.createHash('sha256').update(token).digest('hex');
}

export function getRefreshToken(request: FastifyRequest): string | null {

	if (request.cookies?.refreshToken) {
		return request.cookies.refreshToken;
	}

	const authHeader = request.headers.authorization;;

	if (authHeader?.startsWith('Bearer ')) {
		return authHeader.replace('Bearer ', '');
	}

	return null;
}
