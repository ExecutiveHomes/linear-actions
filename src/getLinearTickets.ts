import * as core from '@actions/core';
import { fetchLinearTicket } from './fetchLinearTicket';
import { LinearTicket } from './types';

export async function getLinearTickets(
  commitMessages: string[],
  linearApiKey: string
): Promise<LinearTicket[]> {
  const tickets: LinearTicket[] = [];
  const ticketIds = new Set<string>();

  // Process each commit
  for (const message of commitMessages) {
    // Look for Linear ticket IDs in the format MOB-123 or [MOB-123]
    const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
    if (!matches) {
      core.debug(`No ticket IDs found in commit message: ${message}`);
      continue;
    }

    for (const match of matches) {
      // Remove brackets if they exist
      const ticketId = match.replace(/[\[\]]/g, '');
      core.debug(`Found ticket ID: ${ticketId}`);
      
      if (!ticketIds.has(ticketId)) {
        ticketIds.add(ticketId);
        try {
          const ticket = await fetchLinearTicket(linearApiKey, ticketId);
          if (ticket) {
            core.debug(`Successfully fetched ticket: ${ticketId}`);
            tickets.push({
              ...ticket,
              commits: []
            });
          } else {
            core.debug(`No ticket found for ID: ${ticketId}`);
          }
        } catch (error) {
          core.error(`Failed to fetch Linear ticket ${ticketId}: ${error}`);
        }
      }
    }
  }

  return tickets;
} 