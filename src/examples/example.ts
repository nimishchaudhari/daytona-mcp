import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn, ChildProcess } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
dotenv.config();

// Get the directory name of the current module
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the response schema for API interactions
const ContentSchema = z.object({
  text: z.string()
});

// ANSI color codes for console output
const RESET = '\x1b[0m';
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';

/**
 * Log a formatted message to the console
 */
function log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info'): void {
  const timestamp = new Date().toISOString();
  let color = BLUE;
  
  switch(type) {
    case 'success':
      color = GREEN;
      break;
    case 'warning':
      color = YELLOW;
      break;
    case 'error':
      color = RED;
      break;
  }
  
  console.log(`${color}[${timestamp}] ${message}${RESET}`);
}

/**
 * Comprehensive example showcasing the Daytona MCP features
 */
async function main() {
  log('Starting MCP client for Daytona integration', 'info');
  
  // Check for required environment variables
  if (!process.env.DAYTONA_API_KEY) {
    log('DAYTONA_API_KEY environment variable is required. Please set it in .env file.', 'error');
    process.exit(1);
  }
  
  // Launch the Daytona MCP server
  const serverProcess = launchServer();
  
  // Give the server a moment to initialize
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    // Initialize MCP client
    const client = new Client({ name: 'DaytonaMcpClient', version: '1.0.0' });
    
    // Create a transport connected to the server's stdio
    const transport = new StdioClientTransport({
      stdin: serverProcess.stdin,
      stdout: serverProcess.stdout
    });
    
    // Connect the client to the transport
    log('Connecting to Daytona MCP server', 'info');
    await client.connect(transport);
    
    // Get server capabilities and version
    const capabilities = client.getServerCapabilities();
    const serverVersion = client.getServerVersion();
    
    log(`Connected to server: ${serverVersion?.name} v${serverVersion?.version}`, 'success');
    log(`Server capabilities: ${JSON.stringify(capabilities)}`, 'info');
    
    // Example workflow: Creating and using a sandbox
    log('Starting sandbox workflow', 'info');
    
    // Step 1: List existing sandboxes
    log('Listing existing sandboxes', 'info');
    const listResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'list-sandboxes',
        arguments: {}
      }
    }, ContentSchema);
    
    const existingSandboxes = JSON.parse(listResult.text);
    log(`Found ${existingSandboxes.length} existing sandboxes`);
    
    // Step 2: Create a new sandbox
    log('Creating a new TypeScript sandbox', 'info');
    const createResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'create-sandbox',
        arguments: {
          language: 'typescript',
          resources: {
            cpu: 2,
            memory: 4
          },
          envVars: {
            NODE_ENV: 'development',
            EXAMPLE_VAR: 'Hello from MCP!'
          }
        }
      }
    }, ContentSchema);
    
    // Parse the sandbox ID from the result
    const sandboxInfo = JSON.parse(createResult.text);
    const sandboxId = sandboxInfo.id;
    
    log(`Created sandbox with ID: ${sandboxId}`, 'success');
    
    // Step 3: Create a directory in the sandbox
    log('Creating a project directory', 'info');
    await client.request({
      method: 'tools/call',
      params: {
        name: 'create-directory',
        arguments: {
          sandboxId,
          path: '/workspace/project'
        }
      }
    }, ContentSchema);
    
    // Step 4: Execute a command in the sandbox
    log('Executing command in sandbox', 'info');
    const execResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'execute-command',
        arguments: {
          sandboxId,
          command: 'echo $EXAMPLE_VAR > /workspace/project/hello.txt',
          cwd: '/workspace'
        }
      }
    }, ContentSchema);
    
    const execOutput = JSON.parse(execResult.text);
    log(`Command execution result: Exit code ${execOutput.exitCode}`);
    
    // Step 5: Run some TypeScript code directly
    log('Running TypeScript code', 'info');
    const codeResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'run-code',
        arguments: {
          sandboxId,
          code: `
            console.log("Hello from TypeScript!");
            console.log("Current timestamp:", new Date().toISOString());
            console.log("Environment:", process.env.NODE_ENV);
            console.log("Example var:", process.env.EXAMPLE_VAR);
          `
        }
      }
    }, ContentSchema);
    
    // Parse and display the code execution result
    const codeOutput = JSON.parse(codeResult.text);
    log('Code execution result:', 'info');
    log(codeOutput.output);
    
    // Step 6: List files in the project directory
    log('Listing files in project directory', 'info');
    const filesResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'list-files',
        arguments: {
          sandboxId,
          path: '/workspace/project'
        }
      }
    }, ContentSchema);
    
    const files = JSON.parse(filesResult.text);
    log(`Files in project directory: ${files.map((f: any) => f.name).join(', ')}`);
    
    // Step 7: Create a session for interactive commands
    log('Creating an interactive session', 'info');
    await client.request({
      method: 'tools/call',
      params: {
        name: 'create-session',
        arguments: {
          sandboxId,
          sessionId: 'example-session'
        }
      }
    }, ContentSchema);
    
    // Execute commands in the session
    log('Running commands in the session', 'info');
    const sessionCmdResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'execute-session-command',
        arguments: {
          sandboxId,
          sessionId: 'example-session',
          command: 'cd /workspace/project && cat hello.txt'
        }
      }
    }, ContentSchema);
    
    const sessionOutput = JSON.parse(sessionCmdResult.text);
    log(`Session command output: ${sessionOutput.output.trim()}`);
    
    // Step 8: Clone a Git repository (optional, will skip if authentication is required)
    try {
      log('Cloning a Git repository', 'info');
      await client.request({
        method: 'tools/call',
        params: {
          name: 'clone-repository',
          arguments: {
            sandboxId,
            url: 'https://github.com/nodejs/examples.git',
            path: '/workspace/project/repo'
          }
        }
      }, ContentSchema);
      log('Repository cloned successfully', 'success');
    } catch (error) {
      log(`Skipping Git operations: ${(error as Error).message}`, 'warning');
    }
    
    // Step 9: Find text in files
    log('Searching for text in files', 'info');
    const findResult = await client.request({
      method: 'tools/call',
      params: {
        name: 'find-in-files',
        arguments: {
          sandboxId,
          path: '/workspace/project',
          pattern: 'Hello'
        }
      }
    }, ContentSchema);
    
    const findMatches = JSON.parse(findResult.text);
    log(`Found ${findMatches.length} matches for 'Hello'`);
    
    // Step 10: Delete the session
    log('Deleting the session', 'info');
    await client.request({
      method: 'tools/call',
      params: {
        name: 'delete-session',
        arguments: {
          sandboxId,
          sessionId: 'example-session'
        }
      }
    }, ContentSchema);
    
    // Step 11: Clean up by removing the sandbox
    log('Cleaning up by removing the sandbox', 'warning');
    await client.request({
      method: 'tools/call',
      params: {
        name: 'remove-sandbox',
        arguments: {
          sandboxId
        }
      }
    }, ContentSchema);
    
    log('Sandbox removed successfully', 'success');
    log('Example completed successfully', 'success');
    
  } catch (error) {
    log(`Error in MCP client: ${error instanceof Error ? error.message : String(error)}`, 'error');
  } finally {
    // Clean up the server process
    log('Shutting down server', 'warning');
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
  
  log(`Launching server from ${serverPath}`);
  
  // Launch the server with required environment variables
  const childProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      DAYTONA_MCP_VERBOSE: 'true'
    },
    stdio: ['pipe', 'pipe', 'pipe']
  });
  
  // Log server output to console
  childProcess.stdout.on('data', (data) => {
    const text = data.toString().trim();
    if (text) {
      console.log(`[Server] ${text}`);
    }
  });
  
  childProcess.stderr.on('data', (data) => {
    const text = data.toString().trim();
    if (text) {
      console.error(`[Server Error] ${text}`);
    }
  });
  
  childProcess.on('close', (code) => {
    log(`Server process exited with code ${code}`, code === 0 ? 'info' : 'error');
  });
  
  return childProcess;
}

// Run the example if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(error => {
    log(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`, 'error');
    process.exit(1);
  });
}
