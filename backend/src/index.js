import { startStandaloneServer } from '@apollo/server/standalone';
import { createServer } from './server.js';

const { server, context } = createServer();
// Use a configured port when provided, or 4000 for the default setup.
const port = Number(process.env.PORT || 4000);

const { url } = await startStandaloneServer(server, {
  // Listen on network interfaces so the phone or the server's proxy can connect.
  listen: { port, host: '0.0.0.0' },
  // Check the login token for each incoming request.
  context,
});

console.log(`GraphQL server running at ${url}`);
