import { FastifyInstance } from "fastify";
import { loginController } from "../../controllers/auth.controller";

const schema = {
	body: {
		type: 'object',
		required: ['email', 'password'],
		properties: {
			email: { type: 'string', format: 'email' },
			password: { type: 'string', minLength: 8 }
		}
	}
}

export default async function (fastify: FastifyInstance) {
	fastify.post('/auth/login', { schema }, loginController);
}
