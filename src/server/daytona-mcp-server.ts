import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { Daytona, Sandbox } from '@daytonaio/sdk';
import { z } from 'zod';
import { DaytonaMcpServerOptions, SandboxCacheItem } from '../types.js';
import { DEFAULT_CACHE_TTL, RESOURCE_URIS, SANDBOX_TOOLS, PROCESS_TOOLS, FILE_TOOLS, GIT_TOOLS } from '../constants.js';
import { registerSandboxTools } from './tools/sandbox-tools.js';
import { registerProcessTools } from './tools/process-tools.js';
import { registerFileTools } from './tools/file-tools.js';
import { registerGitTools } from './tools/git-tools.js';

/**
 * Main Daytona MCP server class
 */
export class DaytonaMcpServer extends Server {
  /** Daytona SDK client instance */
  private daytona: Daytona;
  /** Cached sandbox instances for faster access */
  private sandboxCache: Map<string, SandboxCacheItem>;
  /** Cache TTL in milliseconds */
  private cacheTtl: number;
  /** Verbose logging flag */
  private verbose: boolean;

  /**
   * Create a new Daytona MCP server
   * 
   * @param serverInfo - MCP server information (name, version)
   * @param options - Daytona MCP server options
   */
  constructor(serverInfo: { name: string; version: string }, options: DaytonaMcpServerOptions) {
    super(serverInfo);

    // Initialize Daytona client
    this.daytona = new Daytona(options.daytonaConfig);
    
    // Initialize cache and settings
    this.sandboxCache = new Map();
    this.cacheTtl = options.cacheTtl ?? DEFAULT_CACHE_TTL;
    this.verbose = options.verbose ?? false;

    // Register resources
    this.registerResources();
    
    // Register tools
    this.registerTools();
  }

  /**
   * Connect the server to a transport
   * 
   * @param transport - MCP transport to connect to
   */
  async connect(transport: any): Promise<void> {
    this.log('Connecting Daytona MCP server to transport');
    
    // Register state change handler
    transport.on('stateChange', (state: string) => {
      this.log(`Transport state changed: ${state}`);
    });
    
    // Connect to the transport
    await super.connect(transport);
    
    this.log('Daytona MCP server connected to transport');
  }

  /**
   * Get a sandbox instance by ID, using cache if available
   * 
   * @param sandboxId - ID of the sandbox to get
   * @returns The sandbox instance
   */
  async getSandbox(sandboxId: string): Promise<Sandbox> {
    // Check cache first
    const cacheItem = this.sandboxCache.get(sandboxId);
    const now = Date.now();
    
    if (cacheItem && cacheItem.expiresAt > now) {
      this.log(`Using cached sandbox: ${sandboxId}`);
      return await this.daytona.get(sandboxId);
    }
    
    // Cache miss, fetch fresh instance
    this.log(`Fetching sandbox: ${sandboxId}`);
    const sandbox = await this.daytona.get(sandboxId);
    
    // Update cache
    this.sandboxCache.set(sandboxId, {
      id: sandboxId,
      expiresAt: now + this.cacheTtl
    });
    
    return sandbox;
  }

  /**
   * Register MCP resources
   */
  private registerResources(): void {
    this.log('Registering MCP resources');
    
    // Register the sandboxes list resource
    this.addResource({
      uri: RESOURCE_URIS.SANDBOXES,
      getContent: async () => {
        const sandboxes = await this.daytona.list();
        return JSON.stringify(sandboxes.map(sandbox => ({
          id: sandbox.id,
          // Using any type as the Sandbox API has changed
          status: (sandbox as any).status || 'unknown',
          createdAt: (sandbox as any).createdAt || new Date().toISOString()
        })));
      }
    });
    
    // Register the individual sandbox resource
    this.addResource({
      uri: RESOURCE_URIS.SANDBOX,
      getContent: async (params: any) => {
        try {
          const sandbox = await this.getSandbox(params.id);
          return JSON.stringify({
            id: sandbox.id,
            // Using any type as the Sandbox API has changed
            status: (sandbox as any).status || 'unknown',
            createdAt: (sandbox as any).createdAt || new Date().toISOString()
          });
        } catch (error) {
          throw { code: 'ResourceNotFound', message: `Sandbox not found: ${params.id}` };
        }
      }
    });
    
    // Register the sandbox files resource
    this.addResource({
      uri: RESOURCE_URIS.FILES,
      getContent: async (params: any) => {
        try {
          const sandbox = await this.getSandbox(params.sandboxId);
          
          // Get file listing at the specified path
          const files = await sandbox.fs.listFiles(params.path || '/');
          return JSON.stringify(files);
        } catch (error) {
          throw { code: 'ResourceNotFound', message: `Files not found: ${params.path}` };
        }
      }
    });
    
    // Register the sandbox processes resource
    this.addResource({
      uri: RESOURCE_URIS.PROCESSES,
      getContent: async (params: any) => {
        try {
          const sandbox = await this.getSandbox(params.sandboxId);
          
          if (params.sessionId) {
            // Get specific session
            const sessions = await sandbox.process.listSessions();
            const session = sessions.find(s => s.sessionId === params.sessionId);
            
            if (!session) {
              throw { code: 'ResourceNotFound', message: `Session not found: ${params.sessionId}` };
            }
            
            return JSON.stringify(session);
          } else {
            // Get all sessions
            const sessions = await sandbox.process.listSessions();
            return JSON.stringify(sessions);
          }
        } catch (error) {
          if ((error as any).code) {
            throw error;
          }
          throw { code: 'ResourceNotFound', message: `Processes not found` };
        }
      }
    });
    
    // Register the sandbox git resource
    this.addResource({
      uri: RESOURCE_URIS.GIT,
      getContent: async (params: any) => {
        try {
          const sandbox = await this.getSandbox(params.sandboxId);
          
          // Get Git status for the repository
          const status = await sandbox.git.status(params.repoPath || '/');
          return JSON.stringify(status);
        } catch (error) {
          throw { code: 'ResourceNotFound', message: `Git repository not found: ${params.repoPath}` };
        }
      }
    });
  }

  /**
   * Register MCP tools
   */
  private registerTools(): void {
    this.log('Registering MCP tools');
    
    // Register sandbox management tools
    registerSandboxTools(this);
    
    // Register process management tools
    registerProcessTools(this);
    
    // Register file management tools
    registerFileTools(this);
    
    // Register git management tools
    registerGitTools(this);
  }

  /**
   * Log a message if verbose logging is enabled
   * 
   * @param message - Message to log
   */
  private log(message: string): void {
    if (this.verbose) {
      console.log(`[DaytonaMcpServer] ${message}`);
    }
  }
}
