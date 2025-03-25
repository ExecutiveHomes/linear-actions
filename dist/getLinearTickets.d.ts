interface LinearTicket {
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
export declare function getLinearTickets(commitMessages: string[], linearApiKey: string): Promise<LinearTicket[]>;
export {};
