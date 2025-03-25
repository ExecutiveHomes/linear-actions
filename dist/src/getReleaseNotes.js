"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleaseNotes = getReleaseNotes;
const getCommits_1 = require("./getCommits");
const getLinearTickets_1 = require("./getLinearTickets");
const logger_1 = require("./logger");
async function getReleaseNotes(config) {
    try {
        // Validate required parameters
        if (!config.buildNumber) {
            throw new Error('buildNumber is required');
        }
        if (!process.env.LINEAR_API_KEY) {
            throw new Error('linearApiKey is required');
        }
        // Get commits since last tag
        const commits = await (0, getCommits_1.getCommits)(config.lastTagPattern);
        // Get ticket details for each commit
        const commitTicketMap = await (0, getLinearTickets_1.getLinearTickets)(commits, 'MOB');
        // Format commits for output
        const commitList = Array.from(commitTicketMap.entries())
            .map(([commit, ticket]) => {
            if (ticket) {
                return `- [${ticket.title}](${ticket.url}): ${commit}`;
            }
            else {
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
    }
    catch (error) {
        logger_1.logger.error('Error generating release notes:', error);
        throw error;
    }
}
