import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { LoginInput, LoginResult } from '../domain/auth.types';
import { RegisterInput, RegisteredUser } from '../domain/user';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { createLocalAuthProvider, findLocalAuthProvider } from '../repositories/auth-provider.repository';
import { createSession, findSessionByRefreshTokenHash, revokeSession, findSessionByRefreshTokenHashAnyState, revokeAllUserSessions } from '../repositories/session.repository';
import { generateRefreshToken, hashToken } from '../utils/token';

export async function registerUser(
	fastify: FastifyInstance,
	input: RegisterInput,
): Promise<RegisteredUser> {

	const email = input.email.toLowerCase();
	const password = input.password;
	const client = await fastify.pg.connect();

	try {
		await client.query('BEGIN');

		const existingUser = await findUserByEmail(client, email);

		if (existingUser)
			throw fastify.httpErrors.conflict('Email is already registered');

		const user = await createUser(client, email);

		const passwordHash = await bcrypt.hash(password, 12);

		await createLocalAuthProvider(
			client,
			user.id,
			email,
			passwordHash
		);
		await client.query('COMMIT');
		return user;

	} catch (err) {
		await client.query('ROLLBACK');
		throw err;
	} finally {
		client.release();
	}
}

export async function loginUser(
	fastify: FastifyInstance,
	input: LoginInput,
	meta: { userAgent?: string, ip?: string }
): Promise<LoginResult> {
	const email = input.email.toLowerCase();
	const password = input.password;
	const client = await fastify.pg.connect();

	try {
		const auth = await findLocalAuthProvider(client, email);

		if (!auth)
			throw fastify.httpErrors.unauthorized('Invalid email or password');

		if (!auth.is_active)
			throw fastify.httpErrors.unauthorized('User account is inactive');

		const passwordOk = await bcrypt.compare(password, auth.password_hash);

		if (!passwordOk)
			throw fastify.httpErrors.unauthorized('Invalid email or password');

		const accessToken = fastify.jwt.sign(
			{ sub: auth.user_id },
			{ expiresIn: '15m' }
		);

		const refreshToken = crypto.randomBytes(32).toString('hex');
		const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

		await createSession(
			client,
			auth.user_id,
			refreshTokenHash,
			meta.userAgent,
			meta.ip
		);

		return {
			accessToken,
			refreshToken
		}

	} finally { client.release(); }
}

export async function refreshSession(
	fastify: FastifyInstance,
	refreshToken: string,
	meta: { userAgent?: string, ip?: string }
): Promise<{ accessToken: string, refreshToken: string}> {
	const client = await fastify.pg.connect();

	try {
		const refreshHash = hashToken(refreshToken);

		const session = await findSessionByRefreshTokenHash(client, refreshHash);

		if (!session)
			throw fastify.httpErrors.unauthorized('INVALID_REFRESH_TOKEN');

		if (session.revoked_at) {
			await revokeAllUserSessions(client, session.user_id);
			throw fastify.httpErrors.unauthorized('REFRESH_TOKEN_REUSE_DETECTED');
		}

		if (new Date(session.expires_at) < new Date()) {
			throw fastify.httpErrors.unauthorized('REFRESH_TOKEN_EXPIRED');
		}

		await revokeSession(client, session.id);

		const newRefreshToken = generateRefreshToken();
		const newRefreshHash = hashToken(newRefreshToken);

		await createSession(
			client,
			session.user_id,
			newRefreshHash,
			meta.userAgent,
			meta.ip
		);

		const accessToken = fastify.jwt.sign(
			{ sub: session.user_id },
			{ expiresIn: '15m' }
		);

		return {
			accessToken,
			refreshToken: newRefreshToken
		};
	} finally {
		client.release();
	}
}


export async function logoutSession(
	fastify: FastifyInstance,
	refreshToken: string
): Promise<void> {
	const client = await fastify.pg.connect();

	try {
		const refreshHash = hashToken(refreshToken);

		const session = await findSessionByRefreshTokenHashAnyState(client, refreshHash);

		if (!session)
			return;

		if (!session.revoked_at) {
			await revokeSession(client, session.id);
		}

	} finally {
		client.release();
	}
}

export async function logoutAllUserSessions(
	fastify: FastifyInstance,
	userId: string
): Promise<void> {
	const client = await fastify.pg.connect();

	try {
		await revokeAllUserSessions(client, userId);
	} finally {
		client.release();
	}
}
