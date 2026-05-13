import { FastifyReply, FastifyRequest } from 'fastify';
import { getSessionsByUser } from '../services/session.service'
export async function getSessionsController(
	request: FastifyRequest,
	reply: FastifyReply,
) {
	const userId = (request.user as any).sub;

	const sessions = await getSessionsByUser(request.server, userId);

	return reply.send(sessions);
}
