import { PORT, HOST } from './env.js';
import { buildApp } from './app.js';

const fastify = await buildApp();
await fastify.listen({ port: PORT, host: HOST });
console.log(`\n  🚀 Server ready on  http://localhost:${PORT}`);
