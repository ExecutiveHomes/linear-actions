import { fetchLinearTicket } from './fetchLinearTicket';
import { logger } from './logger';
import type { LinearTicket } from './types';

export type CommitTicketMap = Map<string, LinearTicket | null>;

export async function getLinearTickets(commits: string[], board: string = 'MOB'): Promise<CommitTicketMap> {
  try {
    const commitTicketMap = new Map<string, LinearTicket | null>();
    const ticketIds = new Set<string>();

    // First pass: extract ticket IDs and create initial map
    for (const commit of commits) {
      // Look for ticket IDs in various formats:
      // 1. (MOB-123)
      // 2. MOB-123:
      // 3. #MOB-123
      const matches = commit.match(/(?:\(|^|#)([A-Z]+-\d+)(?:\)|:|$)/);
      if (matches) {
        const ticketId = matches[1];
        // Only add tickets that match the board prefix
        if (ticketId.startsWith(board)) {
          ticketIds.add(ticketId);
          commitTicketMap.set(commit, null); // Will be updated with ticket details
        } else {
          commitTicketMap.set(commit, null); // No matching ticket found
        }
      } else {
        commitTicketMap.set(commit, null); // No ticket found
      }
    }

    // Second pass: fetch ticket details
    for (const ticketId of ticketIds) {
      try {
        const ticket = await fetchLinearTicket(process.env.LINEAR_API_KEY!, ticketId);
        if (ticket) {
          // Update all commits that reference this ticket
          for (const [commit] of commitTicketMap) {
            if (commit.includes(ticketId)) {
              commitTicketMap.set(commit, ticket);
              break;
            }
          }
        }
      } catch (error) {
        logger.error(`Error fetching ticket ${ticketId}:`, error);
      }
    }

    return commitTicketMap;
  } catch (error) {
    logger.error('Error getting Linear tickets:', error);
    throw error;
  }
} 