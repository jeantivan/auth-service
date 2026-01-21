import { FastifyInstance, FastifyPluginOptions } from 'fastify';
import { registerController } from '../../controllers/auth.controller';

const schema = {
	body: {
		type: 'object',
		required: ['email', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 8, maxLength: 72 }
		}
	}
}
export default async function (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions
) {
	fastify.post('/register', { schema }, registerController);
}
