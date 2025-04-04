import * as core from '@actions/core';

export async function pre(): Promise<void> {
  try {
    // Validate required inputs
    const linearApiKey = core.getInput('linear-api-key', { required: true });
    const since = core.getInput('since', { required: true });

    if (!linearApiKey || !since) {
      throw new Error('Missing required inputs');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.error(errorMessage);
    throw error;
  }
} 