export interface LinearTicket {
    id: string;
    title: string;
    description?: string;
    url: string;
}
export interface CommitTicket {
    message: string;
    ticket: string;
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
    zipball_url: string;
    tarball_url: string;
    node_id: string;
}
export interface GitHubCommit {
    commit: {
        message: string;
    };
}
