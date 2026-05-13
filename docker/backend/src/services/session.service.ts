import { FastifyInstance } from 'fastify';

import { findSessionsByUserId } from '../repositories/session.repository';

export async function getSessionsByUser(server: FastifyInstance, userId: string) {
	const client = await server.pg.connect();

	try {
		const sessions = await findSessionsByUserId(client, userId);
		return sessions;
	} finally {
		client.release();
	}
}


