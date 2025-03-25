import { CommitWithTicket } from './types';
export declare function getLinearCommits(linearApiKey: string, tagPattern: string): Promise<{
    commits: CommitWithTicket[];
}>;
