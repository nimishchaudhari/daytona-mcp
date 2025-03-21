import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import { z } from 'zod';

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the response schema for API interactions
const ContentSchema = z.object({
  text: z.string()
});

/**
 * Example MCP client for testing the Daytona MCP server
 */
async function main() {
  console.log('Starting Daytona MCP client example');

  // Launch the server as a child process
  const serverProcess = launchServer();

  try {
    // Give the server a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Initialize MCP client
    const client = new Client({ name: 'DaytonaMcpClient', version: '1.0.0' });

    // Create a transport connected to the server's stdio
    const transport = new StdioClientTransport({
      stdin: serverProcess.stdin,
      stdout: serverProcess.stdout
    });

    // Connect to the server
    console.log('Connecting to Daytona MCP server');
    await client.connect(transport);

    // Get server capabilities and version
    const capabilities = client.getServerCapabilities();
    const serverVersion = client.getServerVersion();

    console.log(`Connected to server: ${serverVersion?.name} v${serverVersion?.version}`);
    console.log(`Server capabilities: ${JSON.stringify(capabilities)}`);

    // List existing sandboxes
    console.log('Listing existing sandboxes');
    const listResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'list-sandboxes',
        arguments: {}
      }
    }, ContentSchema);

    console.log('Existing sandboxes:');
    console.log(listResult.text);

    // More operations can be added here

    console.log('Example completed successfully');
  } catch (error) {
    console.error(`Error in MCP client: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    // Clean up the server process
    console.log('Shutting down server');
    serverProcess.kill();
  }
}

/**
 * Launch the Daytona MCP server as a child process
 * 
 * @returns Child process with the server
 */
function launchServer(): ChildProcess {
  // Path to the server script
  const serverPath = path.resolve(__dirname, '../../dist/server.js');

  console.log(`Launching server from ${serverPath}`);

  // Launch the server with required environment variables
  const childProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
      DAYTONA_SERVER_URL: process.env.DAYTONA_SERVER_URL,
      DAYTONA_TARGET: process.env.DAYTONA_TARGET,
      DAYTONA_MCP_VERBOSE: 'true'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });

  // Log server output to console
  childProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  childProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });

  childProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  return childProcess;
}

// Run the example if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    console.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  });
}
