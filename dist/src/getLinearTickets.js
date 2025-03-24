"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinearTickets = getLinearTickets;
const fetchLinearTicket_1 = require("./fetchLinearTicket");
const getCommits_1 = require("./getCommits");
const logger_1 = require("./logger");
async function getLinearTickets(linearApiKey, lastTagPattern) {
    try {
        const commits = (0, getCommits_1.getCommits)(lastTagPattern);
        const ticketIds = new Set();
        // Extract ticket IDs from commit messages
        for (const commit of commits) {
            const match = commit.match(/\(([A-Z]+-\d+)\)/);
            if (match) {
                ticketIds.add(match[1]);
            }
        }
        const tickets = [];
        // Fetch ticket details for each unique ticket ID
        for (const ticketId of ticketIds) {
            try {
                const ticket = await (0, fetchLinearTicket_1.fetchLinearTicket)(linearApiKey, ticketId);
                if (ticket) {
                    tickets.push(`- [${ticketId}](${ticket.url}): ${ticket.title}`);
                }
                else {
                    tickets.push(`- ${ticketId}`);
                }
            }
            catch (error) {
                logger_1.logger.error(`Error fetching ticket ${ticketId}:`, error);
                tickets.push(`- ${ticketId}`);
            }
        }
        return tickets;
    }
    catch (error) {
        logger_1.logger.error('Error getting tickets:', error);
        return [];
    }
}
