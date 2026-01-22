import { FastifyInstance, FastifyPluginOptions} from 'fastify'

export default async function (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions
) {
	fastify.get('/protected', {
		preHandler: [fastify.authenticate]
	}, async (request, reply) => {
		return { message: 'This is a protected route.\n' }
	});
}
