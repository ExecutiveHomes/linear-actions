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
    commits: Array<{
        message: string;
        sha: string;
    }>;
}
export interface CommitTicket {
    message: string;
    ticket: string;
}
export interface CommitTicketRelationship {
    commit: {
        message: string;
        sha: string;
    };
    tickets: Array<{
        id: string;
        url: string;
    }>;
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
