import * as core from '@actions/core';

export async function pre(): Promise<void> {
  try {
    // Validate required inputs
    const linearApiKey = core.getInput('linear-api-key', { required: true });
    const tagPattern = core.getInput('tag-pattern', { required: true });
    const githubToken = core.getInput('github-token', { required: true });

    if (!linearApiKey || !tagPattern || !githubToken) {
      throw new Error('Missing required inputs');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.error(errorMessage);
    throw error;
  }
} 