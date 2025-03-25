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
    // Look for Linear ticket IDs in the format [ABC-123]
    const matches = message.match(/\[([A-Z]+-\d+)\]/g);
    if (!matches) continue;

    for (const match of matches) {
      const ticketId = match.slice(1, -1); // Remove brackets
      if (!ticketIds.has(ticketId)) {
        ticketIds.add(ticketId);
        try {
          const ticket = await fetchLinearTicket(linearApiKey, ticketId);
          if (ticket) {
            tickets.push(ticket);
          }
        } catch (error) {
          core.error(`Failed to fetch Linear ticket ${ticketId}: ${error}`);
        }
      }
    }
  }

  return tickets;
} 