import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { DaytonaConfig, CreateWorkspaceTargetEnum } from '@daytonaio/sdk';
import { DaytonaMcpServer } from './daytona-mcp-server.js';
import { DaytonaMcpServerOptions } from '../types.js';
import { DEFAULTS } from '../constants.js';

/**
 * Create a Daytona MCP server using the stdio transport
 * 
 * @param serverInfo - MCP server information (name, version)
 * @param options - Daytona MCP server options
 * @returns Promise resolving to the created server instance
 */
export async function createDaytonaStdioServer(
  serverInfo: { name: string; version: string } = { 
    name: DEFAULTS.SERVER_NAME, 
    version: DEFAULTS.SERVER_VERSION 
  },
  options: Partial<DaytonaMcpServerOptions> = {}
): Promise<DaytonaMcpServer> {
  // Create the Daytona config
  const daytonaConfig: DaytonaConfig = {
    apiKey: options.daytonaConfig?.apiKey || process.env.DAYTONA_API_KEY || '',
    serverUrl: options.daytonaConfig?.serverUrl || process.env.DAYTONA_SERVER_URL || DEFAULTS.DAYTONA_SERVER_URL,
    target: (options.daytonaConfig?.target || process.env.DAYTONA_TARGET || DEFAULTS.DAYTONA_TARGET) as CreateWorkspaceTargetEnum
  };

  // Validate API key
  if (!daytonaConfig.apiKey) {
    throw new Error('Daytona API key is required. Set it in options or DAYTONA_API_KEY environment variable.');
  }

  // Create server options
  const serverOptions: DaytonaMcpServerOptions = {
    daytonaConfig,
    cacheTtl: options.cacheTtl,
    verbose: options.verbose
  };

  // Create the server instance
  const server = new DaytonaMcpServer(serverInfo, serverOptions);

  // Create and connect the stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  return server;
}

/**
 * Create a standalone Daytona MCP server using stdio transport
 * 
 * This function creates and starts a server using environment variables
 * for configuration. It's intended to be used as the main entry point
 * for running the server as a standalone process.
 */
export async function createStandaloneServer(): Promise<void> {
  try {
    const verbose = process.env.DAYTONA_MCP_VERBOSE === 'true';
    
    // Log startup information if verbose
    if (verbose) {
      console.log(`Starting Daytona MCP Server...`);
      console.log(`Server URL: ${process.env.DAYTONA_SERVER_URL || DEFAULTS.DAYTONA_SERVER_URL}`);
      console.log(`Target: ${process.env.DAYTONA_TARGET || DEFAULTS.DAYTONA_TARGET}`);
      console.log(`API Key: ${process.env.DAYTONA_API_KEY ? '[Set]' : '[Not Set]'}`);
    }
    
    // Create the server
    await createDaytonaStdioServer(
      { 
        name: DEFAULTS.SERVER_NAME, 
        version: DEFAULTS.SERVER_VERSION 
      },
      { verbose }
    );
    
    if (verbose) {
      console.log('Daytona MCP Server running. Press Ctrl+C to exit.');
    }
  } catch (error) {
    console.error('Failed to start Daytona MCP Server:', error);
    process.exit(1);
  }
}
