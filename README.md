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

## Environment Variables

The server can be configured using the following environment variables:

- `DAYTONA_API_KEY`: Your Daytona API key
- `DAYTONA_SERVER_URL`: Daytona server URL (default: `https://app.daytona.io/api`)
- `DAYTONA_TARGET`: Target region for sandboxes (default: `us`)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.