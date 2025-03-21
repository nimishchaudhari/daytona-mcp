import { z } from 'zod';
import { PROCESS_TOOLS } from '../../constants.js';
import { DaytonaMcpServer } from '../daytona-mcp-server.js';

/**
 * Register process management tools on the server
 * 
 * @param server - DaytonaMcpServer instance
 */
export function registerProcessTools(server: DaytonaMcpServer): void {
  // Tool: Execute a shell command
  server.addTool({
    name: PROCESS_TOOLS.EXECUTE_COMMAND,
    description: 'Execute a shell command in a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      command: z.string(),
      cwd: z.string().optional(),
      timeout: z.number().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const result = await sandbox.process.executeCommand(
          params.command, 
          params.cwd, 
          params.timeout
        );
        
        return {
          text: JSON.stringify({
            exitCode: result.exitCode,
            output: result.result
          })
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to execute command: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Run code directly
  server.addTool({
    name: PROCESS_TOOLS.RUN_CODE,
    description: 'Run code directly in a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      code: z.string(),
      argv: z.array(z.string()).optional(),
      env: z.record(z.string()).optional(),
      timeout: z.number().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const result = await sandbox.process.codeRun(
          params.code,
          {
            argv: params.argv,
            env: params.env
          },
          params.timeout
        );
        
        return {
          text: JSON.stringify({
            exitCode: result.exitCode,
            output: result.result
          })
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to run code: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Create a persistent session
  server.addTool({
    name: PROCESS_TOOLS.CREATE_SESSION,
    description: 'Create a persistent session in a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      sessionId: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.process.createSession(params.sessionId);
        
        return {
          text: `Session ${params.sessionId} created successfully`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to create session: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Execute a command in a session
  server.addTool({
    name: PROCESS_TOOLS.EXECUTE_SESSION_COMMAND,
    description: 'Execute a command in an existing session',
    parameters: z.object({
      sandboxId: z.string(),
      sessionId: z.string(),
      command: z.string(),
      async: z.boolean().optional(),
      timeout: z.number().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const result = await sandbox.process.executeSessionCommand(
          params.sessionId,
          {
            command: params.command,
            async: params.async
          },
          params.timeout
        );
        
        return {
          text: JSON.stringify({
            cmdId: result.cmdId,
            output: result.output,
            exitCode: result.exitCode
          })
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to execute session command: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Delete a session
  server.addTool({
    name: PROCESS_TOOLS.DELETE_SESSION,
    description: 'Delete a session',
    parameters: z.object({
      sandboxId: z.string(),
      sessionId: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.process.deleteSession(params.sessionId);
        
        return {
          text: `Session ${params.sessionId} deleted successfully`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to delete session: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: List all active sessions
  server.addTool({
    name: PROCESS_TOOLS.LIST_SESSIONS,
    description: 'List all active sessions in a sandbox',
    parameters: z.object({
      sandboxId: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const sessions = await sandbox.process.listSessions();
        
        return {
          text: JSON.stringify(sessions)
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to list sessions: ${(error as Error).message}`
        };
      }
    }
  });
}
