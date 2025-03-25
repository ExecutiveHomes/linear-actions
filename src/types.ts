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
}

export interface CommitTicket {
  message: string;
  ticket: string; // Linear ticket URL
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
  commit: {
    message: string;
  };
} 