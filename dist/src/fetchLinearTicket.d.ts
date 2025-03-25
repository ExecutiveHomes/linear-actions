import { LinearTicket } from './types';
export declare function fetchLinearTicket(linearApiKey: string, ticketId: string): Promise<Omit<LinearTicket, 'commits'> | null>;
