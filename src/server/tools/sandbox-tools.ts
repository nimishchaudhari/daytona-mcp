import { z } from 'zod';
import { ErrorCode } from '@modelcontextprotocol/sdk/server/index.js';
import { SANDBOX_TOOLS } from '../../constants.js';
import { DaytonaMcpServer } from '../daytona-mcp-server.js';

/**
 * Register sandbox management tools on the server
 * 
 * @param server - DaytonaMcpServer instance
 */
export function registerSandboxTools(server: DaytonaMcpServer): void {
  // Tool: Create a new sandbox
  server.registerTool({
    name: SANDBOX_TOOLS.CREATE_SANDBOX,
    description: 'Create a new Daytona sandbox',
    parameters: z.object({
      language: z.enum(['typescript', 'javascript', 'python']).optional(),
      image: z.string().optional(),
      envVars: z.record(z.string()).optional(),
      resources: z.object({
        cpu: z.number().optional(),
        memory: z.number().optional(),
        disk: z.number().optional(),
        gpu: z.number().optional()
      }).optional(),
      autoStopInterval: z.number().optional(),
      public: z.boolean().optional(),
      timeout: z.number().optional()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server['daytona'].create({
          language: params.language,
          image: params.image,
          envVars: params.envVars,
          resources: params.resources,
          autoStopInterval: params.autoStopInterval,
          public: params.public
        }, params.timeout);

        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify({
              id: sandbox.id,
              status: sandbox.status,
              createdAt: sandbox.createdAt
            })
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to create sandbox: ${error.message}`
        };
      }
    }
  });

  // Tool: Get a sandbox by ID
  server.registerTool({
    name: SANDBOX_TOOLS.GET_SANDBOX,
    description: 'Get a sandbox by ID',
    parameters: z.object({
      sandboxId: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        
        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify({
              id: sandbox.id,
              status: sandbox.status,
              createdAt: sandbox.createdAt
            })
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.ResourceNotFound,
          message: `Sandbox not found: ${params.sandboxId}`
        };
      }
    }
  });

  // Tool: List all available sandboxes
  server.registerTool({
    name: SANDBOX_TOOLS.LIST_SANDBOXES,
    description: 'List all available sandboxes',
    parameters: z.object({}),
    handler: async (params, context) => {
      try {
        const sandboxes = await server['daytona'].list();
        
        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify(sandboxes.map(sandbox => ({
              id: sandbox.id,
              status: sandbox.status,
              createdAt: sandbox.createdAt
            })))
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to list sandboxes: ${error.message}`
        };
      }
    }
  });

  // Tool: Start a stopped sandbox
  server.registerTool({
    name: SANDBOX_TOOLS.START_SANDBOX,
    description: 'Start a stopped sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      timeout: z.number().optional()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await server['daytona'].start(sandbox, params.timeout);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `Sandbox ${params.sandboxId} started successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to start sandbox: ${error.message}`
        };
      }
    }
  });

  // Tool: Stop a running sandbox
  server.registerTool({
    name: SANDBOX_TOOLS.STOP_SANDBOX,
    description: 'Stop a running sandbox',
    parameters: z.object({
      sandboxId: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await server['daytona'].stop(sandbox);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `Sandbox ${params.sandboxId} stopped successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to stop sandbox: ${error.message}`
        };
      }
    }
  });

  // Tool: Remove a sandbox
  server.registerTool({
    name: SANDBOX_TOOLS.REMOVE_SANDBOX,
    description: 'Remove a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      timeout: z.number().optional()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await server['daytona'].remove(sandbox, params.timeout);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `Sandbox ${params.sandboxId} removed successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to remove sandbox: ${error.message}`
        };
      }
    }
  });
}
