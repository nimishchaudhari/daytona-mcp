import { z } from 'zod';
import { ErrorCode } from '@modelcontextprotocol/sdk/server/index.js';
import { FILE_TOOLS } from '../../constants.js';
import { DaytonaMcpServer } from '../daytona-mcp-server.js';

/**
 * Register file management tools on the server
 * 
 * @param server - DaytonaMcpServer instance
 */
export function registerFileTools(server: DaytonaMcpServer): void {
  // Tool: List files in a directory
  server.registerTool({
    name: FILE_TOOLS.LIST_FILES,
    description: 'List files in a directory',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const files = await sandbox.fs.listFiles(params.path);
        
        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify(files)
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to list files: ${error.message}`
        };
      }
    }
  });

  // Tool: Create a directory
  server.registerTool({
    name: FILE_TOOLS.CREATE_DIRECTORY,
    description: 'Create a directory in a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      mode: z.string().optional()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.fs.createFolder(params.path, params.mode);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `Directory ${params.path} created successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to create directory: ${error.message}`
        };
      }
    }
  });

  // Tool: Delete a file or directory
  server.registerTool({
    name: FILE_TOOLS.DELETE_FILE,
    description: 'Delete a file or directory from a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.fs.deleteFile(params.path);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `File/directory ${params.path} deleted successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to delete file/directory: ${error.message}`
        };
      }
    }
  });

  // Tool: Move or rename a file or directory
  server.registerTool({
    name: FILE_TOOLS.MOVE_FILE,
    description: 'Move or rename a file or directory',
    parameters: z.object({
      sandboxId: z.string(),
      source: z.string(),
      destination: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.fs.moveFiles(params.source, params.destination);
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `Moved ${params.source} to ${params.destination} successfully`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to move file/directory: ${error.message}`
        };
      }
    }
  });

  // Tool: Find text in files
  server.registerTool({
    name: FILE_TOOLS.FIND_IN_FILES,
    description: 'Search for text in files',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      pattern: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const results = await sandbox.fs.findFiles(params.path, params.pattern);
        
        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify(results)
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to find in files: ${error.message}`
        };
      }
    }
  });

  // Tool: Replace text in files
  server.registerTool({
    name: FILE_TOOLS.REPLACE_IN_FILES,
    description: 'Replace text in multiple files',
    parameters: z.object({
      sandboxId: z.string(),
      files: z.array(z.string()),
      pattern: z.string(),
      newValue: z.string()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const results = await sandbox.fs.replaceInFiles(
          params.files,
          params.pattern,
          params.newValue
        );
        
        return {
          content: [{
            mimeType: 'application/json',
            text: JSON.stringify(results)
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to replace in files: ${error.message}`
        };
      }
    }
  });

  // Tool: Set file permissions
  server.registerTool({
    name: FILE_TOOLS.SET_FILE_PERMISSIONS,
    description: 'Set file permissions and ownership',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      owner: z.string().optional(),
      group: z.string().optional(),
      mode: z.string().optional()
    }),
    handler: async (params, context) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.fs.setFilePermissions(params.path, {
          owner: params.owner,
          group: params.group,
          mode: params.mode
        });
        
        return {
          content: [{
            mimeType: 'text/plain',
            text: `File permissions set successfully for ${params.path}`
          }]
        };
      } catch (error) {
        throw {
          code: ErrorCode.InternalError,
          message: `Failed to set file permissions: ${error.message}`
        };
      }
    }
  });
}
