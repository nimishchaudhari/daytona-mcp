import { DaytonaConfig } from '@daytonaio/sdk';

/**
 * Configuration options for the Daytona MCP server
 */
export interface DaytonaMcpServerOptions {
  /** Daytona SDK configuration */
  daytonaConfig: DaytonaConfig;
  /** Cache TTL in milliseconds (default: 30000 - 30 seconds) */
  cacheTtl?: number;
  /** Enable verbose logging */
  verbose?: boolean;
}

/**
 * Sandbox cache item
 */
export interface SandboxCacheItem {
  /** ID of the cached sandbox */
  id: string;
  /** Timestamp when the cache item expires */
  expiresAt: number;
}

/**
 * Response from a sandbox operation
 */
export interface SandboxResponse {
  /** ID of the sandbox */
  id: string;
  /** Status of the sandbox (e.g., 'running', 'stopped') */
  status: string;
  /** Creation time of the sandbox */
  createdAt: string;
  /** URL of the sandbox */
  url?: string;
  /** Additional properties specific to the sandbox */
  [key: string]: unknown;
}

/**
 * File information in a sandbox
 */
export interface FileInfo {
  /** Name of the file */
  name: string;
  /** Whether the file is a directory */
  isDir: boolean;
  /** Size of the file in bytes */
  size: number;
  /** Last modification time */
  modTime: string;
}

/**
 * Session information in a sandbox
 */
export interface SessionInfo {
  /** ID of the session */
  sessionId: string;
  /** Commands executed in the session */
  commands: Array<{
    /** ID of the command */
    id: string;
    /** The command text */
    command: string;
    /** Exit code of the command execution */
    exitCode?: number;
  }>;
}

/**
 * Result of command execution in a sandbox
 */
export interface CommandResult {
  /** Exit code of the command execution */
  exitCode: number;
  /** Output of the command execution */
  result: string;
}

/**
 * Result of code execution in a sandbox
 */
export interface CodeRunResult {
  /** Exit code of the code execution */
  exitCode: number;
  /** Output of the code execution */
  result: string;
}

/**
 * Result of a session command execution in a sandbox
 */
export interface SessionCommandResult {
  /** ID of the command */
  cmdId: string;
  /** Output of the command */
  output?: string;
  /** Exit code of the command */
  exitCode?: number;
}

/**
 * Git repository status information
 */
export interface GitStatus {
  /** Current branch name */
  currentBranch: string;
  /** Number of commits ahead of remote */
  ahead: number;
  /** Number of commits behind remote */
  behind: number;
  /** Whether the branch is published to remote */
  branchPublished: boolean;
  /** Status of files in the repository */
  fileStatus: Array<unknown>;
}

/**
 * Git repository branches information
 */
export interface GitBranches {
  /** List of branch names */
  branches: string[];
}

/**
 * File replacement result
 */
export interface FileReplacement {
  /** Path to the file */
  file: string;
  /** Number of replacements made */
  replacements: number;
}

/**
 * File search result
 */
export interface FileSearchResult {
  /** Path to the file */
  file: string;
  /** Line number where the match was found */
  line: number;
  /** Content of the line with the match */
  content: string;
}
