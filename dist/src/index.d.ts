import { LinearTicket, CommitTicketRelationship } from './types';
export declare function getLinearCommits(linearApiKey: string, tagPattern: string): Promise<{
    tickets: LinearTicket[];
    relationships: CommitTicketRelationship[];
}>;
