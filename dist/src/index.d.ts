import { CommitWithTicket } from './types';
export declare function getLinearCommits(linearApiKey: string, since: string): Promise<{
    commits: CommitWithTicket[];
}>;
