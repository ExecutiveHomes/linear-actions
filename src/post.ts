import * as core from '@actions/core';

export async function post(): Promise<void> {
  try {
    // Nothing to clean up anymore since we're not using environment variables
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    core.error(errorMessage);
  }
} 