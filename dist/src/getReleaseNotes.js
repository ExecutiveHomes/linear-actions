"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleaseNotes = getReleaseNotes;
const getLinearTickets_1 = require("./getLinearTickets");
const logger_1 = require("./logger");
async function getReleaseNotes(config) {
    try {
        if (!config.linearApiKey) {
            throw new Error('linearApiKey is required');
        }
        if (!config.buildNumber) {
            throw new Error('buildNumber is required');
        }
        if (!config.lastTagPattern) {
            throw new Error('lastTagPattern is required');
        }
        const ticketDetails = await (0, getLinearTickets_1.getLinearTickets)(config.linearApiKey, config.lastTagPattern);
        // Generate the release notes
        const releaseNotes = [
            `## Development Release ${config.buildNumber}`,
            '',
            '### Included Tickets',
            ticketDetails.length > 0 ? ticketDetails.join('\n') : 'No Linear tickets found in commits since last release.',
            '',
            '### TestFlight Link',
            config.testflightAppId
                ? `[View in TestFlight](https://testflight.apple.com/join/${config.testflightAppId})`
                : 'TestFlight link not available',
            '',
            '### Build Details',
            `- Build Number: ${config.buildNumber}`,
            `- Branch: ${config.branch || 'develop'}`,
            config.commit ? `- Commit: ${config.commit}` : '',
            '',
            `Generated from commits since last matching tag (${config.lastTagPattern})`
        ].filter(Boolean);
        return releaseNotes.join('\n');
    }
    catch (error) {
        logger_1.logger.error('Error generating release notes:', error);
        throw error;
    }
}
