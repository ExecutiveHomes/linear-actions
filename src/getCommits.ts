import { execSync } from 'child_process';

import { findLatestTag } from './findLatestTag';
import { logger } from './logger';

export async function getCommits(lastTagPattern: string): Promise<string[]> {
  try {
    const lastTag = await findLatestTag(lastTagPattern);
    if (!lastTag) {
      throw new Error('No tags found matching pattern: ' + lastTagPattern);
    }

    // Convert the lastTag to string to ensure proper string interpolation
    const gitLogCommand = `git log ${lastTag.toString()}..HEAD --pretty=format:%s`;
    const output = execSync(gitLogCommand).toString();

    if (!output) {
      return [];
    }

    return output.split('\n');
  } catch (error) {
    logger.error('Error getting commits:', error);
    throw error;
  }
} 