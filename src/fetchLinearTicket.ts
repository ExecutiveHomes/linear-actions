import * as core from '@actions/core';

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

interface LinearResponse {
  data?: {
    issue: LinearTicket;
  };
  errors?: Array<{
    message: string;
  }>;
}

export async function fetchLinearTicket(
  linearApiKey: string,
  ticketId: string
): Promise<LinearTicket | null> {
  try {
    core.debug(`Fetching Linear ticket ${ticketId}`);

    const response = await fetch('https://api.linear.app/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': linearApiKey,
      },
      body: JSON.stringify({
        query: `
          query GetTicket($id: String!) {
            issue(id: $id) {
              id
              title
              description
              state {
                name
              }
              assignee {
                name
              }
              labels {
                nodes {
                  name
                }
              }
            }
          }
        `,
        variables: {
          id: ticketId,
        },
      }),
    });

    const responseData = await response.json() as LinearResponse;
    
    if (responseData.errors) {
      core.setFailed(`Failed to fetch Linear ticket: ${responseData.errors[0].message}`);
      return null;
    }

    if (!responseData.data?.issue) {
      core.setFailed('No ticket data found in response');
      return null;
    }

    core.debug(`Successfully fetched ticket: ${JSON.stringify(responseData.data.issue, null, 2)}`);
    return responseData.data.issue;
  } catch (error) {
    core.setFailed(`Failed to fetch Linear ticket: ${(error as Error).message}`);
    return null;
  }
} 