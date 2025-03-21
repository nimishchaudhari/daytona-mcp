import { createStandaloneServer } from './server/server-factory.js';

/**
 * Entry point for the standalone server
 * 
 * This script starts a Daytona MCP server using environment variables for configuration.
 * It's intended to be run directly using Node.js.
 */
createStandaloneServer().catch(error => {
  console.error('Unhandled error in Daytona MCP server:', error);
  process.exit(1);
});
