export interface LinearTicket {
  id: string;
  title: string;
  description: string;
  state: {
    name: string;
  };
  assignee?: {
    name: string;
  };
  labels: {
    nodes: Array<{
      name: string;
    }>;
  };
  url: string;
}

export interface CommitWithTicket {
  message: string;
  sha: string;
  ticket: LinearTicket | null;
}

export interface ActionInputs {
  linearApiKey: string;
  tagPattern: string;
  githubToken: string;
}

export interface Logger {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
}

// GitHub API Types
export interface GitHubTag {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

export interface GitHubCommit {
  sha: string;
  commit: {
    message: string;
  };
} 