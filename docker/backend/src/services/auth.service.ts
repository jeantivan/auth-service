import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { FastifyInstance } from 'fastify';
import { LoginInput, LoginResult } from '../domain/auth.types';
import { RegisterInput, RegisteredUser } from '../domain/user';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { createLocalAuthProvider, findLocalAuthProvider } from '../repositories/auth-provider.repository';
import { createSession } from '../repositories/session.repository';

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
