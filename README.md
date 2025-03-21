# Daytona MCP

A Model Context Protocol (MCP) integration for the Daytona SDK, enabling seamless interaction between MCP clients and Daytona sandboxes.

## Overview

The Daytona MCP integration allows MCP clients to interact with Daytona sandbox environments through a standardized interface. It bridges the gap between the Model Context Protocol (MCP) and Daytona's powerful sandbox capabilities.

This integration enables:
- Creating and managing Daytona sandboxes
- Executing code and commands within sandboxes
- Managing files and directories
- Working with Git repositories
- All through the standardized MCP interface

## Features

- **Comprehensive Resource Exposure**: Access sandboxes, files, processes, and Git repositories through MCP resources
- **Rich Tool Set**: Full suite of tools for sandbox management, code execution, file operations, and Git operations
- **Multiple Transport Options**: Support for stdio and HTTP/SSE transports
- **Caching for Performance**: Efficient caching of sandbox instances to improve performance
- **Full MCP Compliance**: Complete implementation of the MCP specification

## Installation

```bash
# Install using npm
npm install daytona-mcp

# Install using yarn
yarn add daytona-mcp

# Install using pnpm
pnpm add daytona-mcp
```

## Prerequisites

- Node.js 18 or higher
- Daytona API key (obtain from [Daytona Dashboard](https://app.daytona.io))
- For HTTP/SSE transport: Express.js

## Quick Start

### Starting a Daytona MCP Server

```typescript
import { createDaytonaStdioServer } from 'daytona-mcp';

// Initialize using environment variables
const server = await createDaytonaStdioServer(
  { name: 'MyDaytonaServer', version: '1.0.0' },
  {
    apiKey: process.env.DAYTONA_API_KEY,
    serverUrl: process.env.DAYTONA_SERVER_URL,
    target: process.env.DAYTONA_TARGET
  }
);

// The server is now running and handling stdio messages
console.log('Daytona MCP server running. Press Ctrl+C to exit.');
```

### Using a Daytona MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';

// Launch the server as a child process
const serverProcess = spawn('node', ['./dist/server.js'], {
  stdio: ['pipe', 'pipe', 'pipe']
});

// Initialize MCP client
const client = new Client({ name: 'DaytonaClient', version: '1.0.0' });

// Create a transport connected to the server's stdio
const transport = new StdioClientTransport({
  input: serverProcess.stdout,
  output: serverProcess.stdin
});

// Connect to the server
await client.connect(transport);

// Create a new sandbox
const createResult = await client.request({
  method: 'tools/call',
  params: {
    name: 'create-sandbox',
    arguments: {
      language: 'typescript',
      resources: {
        cpu: 2,
        memory: 4
      }
    }
  }
});

// Parse the result to get the sandbox ID
const sandboxInfo = JSON.parse(createResult.content[0].text);
const sandboxId = sandboxInfo.id;

// Execute a command in the sandbox
const execResult = await client.request({
  method: 'tools/call',
  params: {
    name: 'execute-command',
    arguments: {
      sandboxId,
      command: 'echo "Hello from Daytona MCP"',
    }
  }
});

// Clean up
await client.request({
  method: 'tools/call',
  params: {
    name: 'remove-sandbox',
    arguments: { sandboxId }
  }
});
```

## Available Resources

| Resource | URI Pattern | Description |
|----------|-------------|-------------|
| Sandboxes | `sandboxes://` | List all sandboxes |
| Sandbox | `sandboxes://{id}` | Get details of a specific sandbox |
| Files | `sandbox://{sandboxId}/files/{path*}` | Access files within a sandbox |
| Processes | `sandbox://{sandboxId}/processes/{sessionId}` | Access processes/sessions within a sandbox |
| Git | `sandbox://{sandboxId}/git/{repoPath*}` | Access Git repository information |

## Available Tools

### Sandbox Management
- `create-sandbox`: Create a new sandbox
- `get-sandbox`: Get a sandbox by ID
- `list-sandboxes`: List all available sandboxes
- `start-sandbox`: Start a stopped sandbox
- `stop-sandbox`: Stop a running sandbox
- `remove-sandbox`: Remove a sandbox

### Code Execution
- `execute-command`: Execute a shell command
- `run-code`: Run code directly
- `create-session`: Create a persistent session
- `execute-session-command`: Execute a command in a session
- `delete-session`: Delete a session
- `list-sessions`: List all active sessions

### File Operations
- `list-files`: List files in a directory
- `create-directory`: Create a directory
- `delete-file`: Delete a file or directory
- `move-file`: Move or rename a file
- `find-in-files`: Search for text in files
- `replace-in-files`: Replace text in files
- `set-file-permissions`: Set file permissions

### Git Operations
- `clone-repository`: Clone a Git repository
- `get-git-status`: Get repository status
- `list-branches`: List branches
- `stage-files`: Stage files for commit
- `commit-changes`: Commit staged changes
- `pull-changes`: Pull changes from remote
- `push-changes`: Push changes to remote

## Environment Variables

The server can be configured using the following environment variables:

- `DAYTONA_API_KEY`: Your Daytona API key
- `DAYTONA_SERVER_URL`: Daytona server URL (default: `https://app.daytona.io/api`)
- `DAYTONA_TARGET`: Target region for sandboxes (default: `us`)

## Development

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/daytona-mcp.git
   cd daytona-mcp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Build the project:
   ```
   npm run build
   ```

4. Run tests (requires Daytona API key):
   ```
   # Create a .env file with DAYTONA_API_KEY
   echo "DAYTONA_API_KEY=your_api_key_here" > .env
   
   # Run tests
   npm test
   ```

5. Run the example:
   ```
   npm run example
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
