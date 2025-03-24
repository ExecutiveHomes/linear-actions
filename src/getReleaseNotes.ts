import { getCommits } from './getCommits';
import { getLinearTickets } from './getLinearTickets';
import { logger } from './logger';
import type { ReleaseNotesConfig } from './types';

export async function getReleaseNotes(config: ReleaseNotesConfig): Promise<string> {
  try {
    // Validate required parameters
    if (!config.buildNumber) {
      throw new Error('buildNumber is required');
    }
    if (!process.env.LINEAR_API_KEY) {
      throw new Error('linearApiKey is required');
    }

    // Get commits since last tag
    const commits = await getCommits(config.lastTagPattern);

    // Get ticket details for each commit
    const commitTicketMap = await getLinearTickets(commits, 'MOB');

    // Format commits for output
    const commitList = Array.from(commitTicketMap.entries())
      .map(([commit, ticket]) => {
        if (ticket) {
          return `- [${ticket.title}](${ticket.url}): ${commit}`;
        } else {
          return `- No Ticket: ${commit}`;
        }
      })
      .join('\n');

    // Build the release notes
    const releaseNotes = [
      `## Development Release ${config.buildNumber}`,
      '### Included Commits',
      commitList || 'No commits found since last release.',
      '### TestFlight Link',
      config.testflightAppId 
        ? `[View in TestFlight](https://testflight.apple.com/join/${config.testflightAppId})`
        : 'TestFlight link not available',
      '### Build Details',
      `- Build Number: ${config.buildNumber}`,
      config.branch ? `- Branch: ${config.branch}` : '',
      config.commit ? `- Commit: ${config.commit}` : '',
      `Generated from commits since last matching tag (${config.lastTagPattern})`
    ].filter(Boolean).join('\n');

    return releaseNotes;
  } catch (error) {
    logger.error('Error generating release notes:', error);
    throw error;
  }
} 