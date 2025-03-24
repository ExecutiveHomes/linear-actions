export interface LinearTicket {
    title: string;
    description: string;
    url: string;
}
export interface ReleaseNotesConfig {
    linearApiKey: string;
    buildNumber: string;
    lastTagPattern: string;
    testflightAppId?: string;
    branch?: string;
    commit?: string;
}
export interface Logger {
    info: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
}
