import Fastify from 'fastify'
const PORT = 8080;

const fastify = Fastify();

fastify.get('/', async (request, reply) => {
  return 'Hello there! 👋';
})

const start = async () => {
  try {
    await fastify.listen({ port: PORT });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

start();
console.log(`Listening on port ${PORT}`);