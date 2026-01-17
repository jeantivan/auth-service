import {FastifyInstance, FastifyPluginOptions} from 'fastify'


export default async function (
	fastify: FastifyInstance,
	opts: FastifyPluginOptions
) {
	fastify.get('/ping', {}, async (request, reply) => {
		return { message: 'pooong\n' }
	});
}
