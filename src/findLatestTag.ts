import { execSync } from 'child_process';

import { logger } from './logger';

export async function findLatestTag(pattern: string): Promise<string | null> {
  try {
    // Use git's own pattern matching instead of grep
    const command = `git tag --sort=-v:refname --list "${pattern}" | head -n 1`;
    const output = execSync(command).toString().trim();

    logger.info(`Command: ${command}`);

    if (!output) {
      logger.error(`No tags found matching pattern: ${pattern}`);
      return null;
    }

    logger.info(`Found latest tag: ${output}`);
    return output;
  } catch (error) {
    logger.error('Error finding latest tag:', error);
    throw error;
  }
} 