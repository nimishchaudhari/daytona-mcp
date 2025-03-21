import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('Daytona MCP E2E Tests', () => {
  let serverProcess: ChildProcess;
  let client: Client;
  let sandboxId: string | null = null;
  
  // Check if required environment variables are set
  const requiredEnvVars = {
    DAYTONA_API_KEY: process.env.DAYTONA_API_KEY,
    DAYTONA_SERVER_URL: process.env.DAYTONA_SERVER_URL || 'https://app.daytona.io/api',
    DAYTONA_TARGET: process.env.DAYTONA_TARGET || 'us'
  };

  // Helper function to serialize an object to a string representation
  const objToString = (obj: Record<string, unknown>): string => 
    Object.entries(obj)
      .map(([key, value]) => `${key}=${value || '[Not Set]'}`)
      .join(', ');

  beforeAll(async () => {
    // Skip tests if API key is not set
    if (!requiredEnvVars.DAYTONA_API_KEY) {
      console.warn(
        `Skipping E2E tests. Required environment variables not set. ` + 
        `Create a .env file with the following variables:\n` +
        objToString(requiredEnvVars)
      );
      return;
    }

    console.log('Starting E2E tests with config:', objToString(requiredEnvVars));
    
    // Start the server process
    serverProcess = launchServer();
    
    // Give the server a moment to initialize
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Initialize the client
    client = new Client({ name: 'DaytonaMcpTestClient', version: '1.0.0' });
    
    // Create and connect the transport
    const transport = new StdioClientTransport({
      input: serverProcess.stdout,
      output: serverProcess.stdin
    });
    
    await client.connect(transport);
  }, 10000);
  
  afterAll(() => {
    // Clean up any created sandbox
    if (sandboxId) {
      console.log(`Cleaning up sandbox ${sandboxId}`);
      client.request({
        method: 'tools/call',
        params: {
          name: 'remove-sandbox',
          arguments: { sandboxId }
        }
      }).catch(err => console.error('Error cleaning up sandbox:', err));
    }
    
    // Kill the server process
    if (serverProcess) {
      serverProcess.kill();
    }
  });
  
  test('Server version and capabilities', () => {
    // Skip if not properly set up
    if (!requiredEnvVars.DAYTONA_API_KEY) {
      return;
    }
    
    const version = client.getServerVersion();
    expect(version).toBeDefined();
    expect(version?.name).toBe('DaytonaMcpServer');
    
    const capabilities = client.getServerCapabilities();
    expect(capabilities).toBeDefined();
  });
  
  test('List sandboxes', async () => {
    // Skip if not properly set up
    if (!requiredEnvVars.DAYTONA_API_KEY) {
      return;
    }
    
    const response = await client.request({
      method: 'tools/call',
      params: {
        name: 'list-sandboxes',
        arguments: {}
      }
    });
    
    expect(response.content).toBeDefined();
    expect(response.content[0].mimeType).toBe('application/json');
    
    // Parse the sandboxes list 
    const sandboxes = JSON.parse(response.content[0].text);
    expect(Array.isArray(sandboxes)).toBe(true);
  });
  
  test('Create and manage sandbox', async () => {
    // Skip if not properly set up
    if (!requiredEnvVars.DAYTONA_API_KEY) {
      return;
    }
    
    // Create a sandbox
    const createResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'create-sandbox',
        arguments: {
          language: 'typescript',
          resources: {
            cpu: 1,
            memory: 2
          },
          envVars: {
            TEST_ENV: 'test-value'
          }
        }
      }
    });
    
    expect(createResponse.content).toBeDefined();
    expect(createResponse.content[0].mimeType).toBe('application/json');
    
    const sandbox = JSON.parse(createResponse.content[0].text);
    expect(sandbox.id).toBeDefined();
    
    // Store the sandbox ID for later use and cleanup
    sandboxId = sandbox.id;
    console.log(`Created test sandbox with ID: ${sandboxId}`);
    
    // Get the sandbox by ID
    const getResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'get-sandbox',
        arguments: {
          sandboxId
        }
      }
    });
    
    expect(getResponse.content).toBeDefined();
    expect(getResponse.content[0].mimeType).toBe('application/json');
    
    const retrievedSandbox = JSON.parse(getResponse.content[0].text);
    expect(retrievedSandbox.id).toBe(sandboxId);
    
    // Execute a command in the sandbox
    const execResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'execute-command',
        arguments: {
          sandboxId,
          command: 'echo $TEST_ENV'
        }
      }
    });
    
    expect(execResponse.content).toBeDefined();
    expect(execResponse.content[0].mimeType).toBe('application/json');
    
    const execResult = JSON.parse(execResponse.content[0].text);
    expect(execResult.exitCode).toBe(0);
    expect(execResult.output.trim()).toBe('test-value');
    
    // Create a directory
    const mkdirResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'create-directory',
        arguments: {
          sandboxId,
          path: '/workspace/test-dir'
        }
      }
    });
    
    expect(mkdirResponse.content).toBeDefined();
    expect(mkdirResponse.content[0].mimeType).toBe('text/plain');
    
    // List files to verify directory was created
    const lsResponse = await client.request({
      method: 'tools/call',
      params: {
        name: 'list-files',
        arguments: {
          sandboxId,
          path: '/workspace'
        }
      }
    });
    
    expect(lsResponse.content).toBeDefined();
    expect(lsResponse.content[0].mimeType).toBe('application/json');
    
    const files = JSON.parse(lsResponse.content[0].text);
    expect(Array.isArray(files)).toBe(true);
    expect(files.some((file: any) => file.name === 'test-dir' && file.isDir)).toBe(true);
  }, 30000); // Increased timeout for sandbox creation
});

/**
 * Launch the Daytona MCP server as a child process for testing
 */
function launchServer(): ChildProcess {
  // Path to the server script
  const serverPath = path.resolve(__dirname, '../../dist/server.js');
  
  console.log(`Launching test server from ${serverPath}`);
  
  // Launch the server with required environment variables
  const childProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      DAYTONA_MCP_VERBOSE: 'true'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Log server output for debugging
  childProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });
  
  childProcess.stderr.on('data', (data) => {
    console.error(`[Server Error] ${data.toString().trim()}`);
  });
  
  return childProcess;
}
