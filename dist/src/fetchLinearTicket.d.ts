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
    url: string;
}
export declare function fetchLinearTicket(linearApiKey: string, ticketId: string): Promise<LinearTicket | null>;
export {};
