import bcrypt from 'bcrypt';
import { FastifyInstance } from 'fastify';
import { RegisterInput, RegisteredUser } from '../domain/user';
import { findUserByEmail, createUser } from '../repositories/user.repository';
import { createLocalAuthProvider } from '../repositories/auth-provider.repository';

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
