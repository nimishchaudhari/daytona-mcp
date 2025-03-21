import { z } from 'zod';
import { GIT_TOOLS } from '../../constants.js';
import { DaytonaMcpServer } from '../daytona-mcp-server.js';

/**
 * Register git operations tools on the server
 * 
 * @param server - DaytonaMcpServer instance
 */
export function registerGitTools(server: DaytonaMcpServer): void {
  // Tool: Clone a Git repository
  server.addTool({
    name: GIT_TOOLS.CLONE_REPOSITORY,
    description: 'Clone a Git repository into a sandbox',
    parameters: z.object({
      sandboxId: z.string(),
      url: z.string(),
      path: z.string(),
      branch: z.string().optional(),
      commitId: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.git.clone(
          params.url,
          params.path,
          params.branch,
          params.commitId,
          params.username,
          params.password
        );
        
        return {
          text: `Repository ${params.url} cloned successfully to ${params.path}`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to clone repository: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Get Git repository status
  server.addTool({
    name: GIT_TOOLS.GET_GIT_STATUS,
    description: 'Get Git repository status',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const status = await sandbox.git.status(params.path);
        
        return {
          text: JSON.stringify(status)
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to get Git status: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: List branches in a Git repository
  server.addTool({
    name: GIT_TOOLS.LIST_BRANCHES,
    description: 'List branches in a Git repository',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        const branches = await sandbox.git.branches(params.path);
        
        return {
          text: JSON.stringify(branches)
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to list branches: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Stage files for commit
  server.addTool({
    name: GIT_TOOLS.STAGE_FILES,
    description: 'Stage files for commit',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      files: z.array(z.string())
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.git.add(params.path, params.files);
        
        return {
          text: `Files staged successfully`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to stage files: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Commit staged changes
  server.addTool({
    name: GIT_TOOLS.COMMIT_CHANGES,
    description: 'Commit staged changes',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      message: z.string(),
      author: z.string(),
      email: z.string()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.git.commit(
          params.path,
          params.message,
          params.author,
          params.email
        );
        
        return {
          text: `Changes committed successfully with message: "${params.message}"`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to commit changes: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Pull changes from remote
  server.addTool({
    name: GIT_TOOLS.PULL_CHANGES,
    description: 'Pull changes from a remote repository',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      username: z.string().optional(),
      password: z.string().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.git.pull(
          params.path,
          params.username,
          params.password
        );
        
        return {
          text: `Changes pulled successfully`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to pull changes: ${(error as Error).message}`
        };
      }
    }
  });

  // Tool: Push changes to remote
  server.addTool({
    name: GIT_TOOLS.PUSH_CHANGES,
    description: 'Push changes to a remote repository',
    parameters: z.object({
      sandboxId: z.string(),
      path: z.string(),
      username: z.string().optional(),
      password: z.string().optional()
    }),
    handler: async (params: any) => {
      try {
        const sandbox = await server.getSandbox(params.sandboxId);
        await sandbox.git.push(
          params.path,
          params.username,
          params.password
        );
        
        return {
          text: `Changes pushed successfully`
        };
      } catch (error) {
        throw {
          code: 'InternalError',
          message: `Failed to push changes: ${(error as Error).message}`
        };
      }
    }
  });
}
