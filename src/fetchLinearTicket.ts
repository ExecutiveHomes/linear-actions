import fetch from 'node-fetch';

import { logger } from './logger';
import type { LinearTicket } from './types';

export async function fetchLinearTicket(linearApiKey: string, ticketId: string): Promise<LinearTicket | null> {
  try {
    const query = `
      query($id: String!) {
        issue(id: $id) {
          title
          description
          url
        }
      }
    `;

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': linearApiKey
      },
      body: JSON.stringify({
        query,
        variables: { id: ticketId }
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.errors) {
      throw new Error('GraphQL Error');
    }

    if (!data.data?.issue) {
      return null;
    }

    return {
      title: data.data.issue.title,
      description: data.data.issue.description,
      url: data.data.issue.url
    };
  } catch (error) {
    logger.error(`Error fetching ticket ${ticketId}:`, error);
    throw error;
  }
} 