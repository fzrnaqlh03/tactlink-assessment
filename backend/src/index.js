import { startStandaloneServer } from '@apollo/server/standalone';
import { createServer } from './server.js';

const { server, context } = createServer();
const port = Number(process.env.PORT || 4000);

const { url } = await startStandaloneServer(server, {
  listen: { port, host: '0.0.0.0' },
  context,
});

console.log(`GraphQL server running at ${url}`);
