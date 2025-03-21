/**
 * Constants for the Daytona MCP integration
 */

/** Default cache TTL in milliseconds (30 seconds) */
export const DEFAULT_CACHE_TTL = 30000;

/** MCP resource URI prefixes */
export const RESOURCE_URIS = {
  /** URI prefix for sandboxes list resource */
  SANDBOXES: 'sandboxes://',
  /** URI prefix pattern for a single sandbox resource */
  SANDBOX: 'sandboxes://{id}',
  /** URI prefix pattern for files in a sandbox */
  FILES: 'sandbox://{sandboxId}/files/{path*}',
  /** URI prefix pattern for processes in a sandbox */
  PROCESSES: 'sandbox://{sandboxId}/processes/{sessionId}',
  /** URI prefix pattern for git repositories in a sandbox */
  GIT: 'sandbox://{sandboxId}/git/{repoPath*}'
};

/** Tool names for sandbox operations */
export const SANDBOX_TOOLS = {
  /** Tool name for creating a sandbox */
  CREATE_SANDBOX: 'create-sandbox',
  /** Tool name for getting a sandbox by ID */
  GET_SANDBOX: 'get-sandbox',
  /** Tool name for listing all sandboxes */
  LIST_SANDBOXES: 'list-sandboxes',
  /** Tool name for starting a sandbox */
  START_SANDBOX: 'start-sandbox',
  /** Tool name for stopping a sandbox */
  STOP_SANDBOX: 'stop-sandbox',
  /** Tool name for removing a sandbox */
  REMOVE_SANDBOX: 'remove-sandbox'
};

/** Tool names for code execution operations */
export const PROCESS_TOOLS = {
  /** Tool name for executing a command */
  EXECUTE_COMMAND: 'execute-command',
  /** Tool name for running code */
  RUN_CODE: 'run-code',
  /** Tool name for creating a session */
  CREATE_SESSION: 'create-session',
  /** Tool name for executing a command in a session */
  EXECUTE_SESSION_COMMAND: 'execute-session-command',
  /** Tool name for deleting a session */
  DELETE_SESSION: 'delete-session',
  /** Tool name for listing active sessions */
  LIST_SESSIONS: 'list-sessions'
};

/** Tool names for file operations */
export const FILE_TOOLS = {
  /** Tool name for listing files */
  LIST_FILES: 'list-files',
  /** Tool name for creating a directory */
  CREATE_DIRECTORY: 'create-directory',
  /** Tool name for uploading a file */
  UPLOAD_FILE: 'upload-file',
  /** Tool name for downloading a file */
  DOWNLOAD_FILE: 'download-file',
  /** Tool name for deleting a file */
  DELETE_FILE: 'delete-file',
  /** Tool name for moving/renaming a file */
  MOVE_FILE: 'move-file',
  /** Tool name for finding text in files */
  FIND_IN_FILES: 'find-in-files',
  /** Tool name for replacing text in files */
  REPLACE_IN_FILES: 'replace-in-files',
  /** Tool name for setting file permissions */
  SET_FILE_PERMISSIONS: 'set-file-permissions'
};

/** Tool names for Git operations */
export const GIT_TOOLS = {
  /** Tool name for cloning a repository */
  CLONE_REPOSITORY: 'clone-repository',
  /** Tool name for getting repository status */
  GET_GIT_STATUS: 'get-git-status',
  /** Tool name for listing branches */
  LIST_BRANCHES: 'list-branches',
  /** Tool name for staging files */
  STAGE_FILES: 'stage-files',
  /** Tool name for committing changes */
  COMMIT_CHANGES: 'commit-changes',
  /** Tool name for pulling changes */
  PULL_CHANGES: 'pull-changes',
  /** Tool name for pushing changes */
  PUSH_CHANGES: 'push-changes'
};

/** Default parameters for MCP server */
export const DEFAULTS = {
  /** Default server name */
  SERVER_NAME: 'DaytonaMcpServer',
  /** Default server version */
  SERVER_VERSION: '0.1.0',
  /** Default Daytona server URL */
  DAYTONA_SERVER_URL: 'https://app.daytona.io/api',
  /** Default Daytona target region */
  DAYTONA_TARGET: 'us'
};
