import fastify from 'fastify'

const server = fastify();

server.get("/ping", () => {
	return 'pooooooong\n';
})

server.listen({port: 4000, host: '0.0.0.0'}, (err, address) => {
	if (err) {
		console.error(err);
		process.exit(1);
	}
	console.log(`Server listening at ${address}`);
})
