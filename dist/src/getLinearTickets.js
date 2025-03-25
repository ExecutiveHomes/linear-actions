"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinearTickets = getLinearTickets;
const core = __importStar(require("@actions/core"));
const fetchLinearTicket_1 = require("./fetchLinearTicket");
async function getLinearTickets(commitMessages, linearApiKey) {
    const tickets = [];
    const ticketIds = new Set();
    // Process each commit
    for (const message of commitMessages) {
        // Look for Linear ticket IDs in the format MOB-123 or [MOB-123]
        const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
        if (!matches) {
            core.debug(`No ticket IDs found in commit message: ${message}`);
            continue;
        }
        for (const match of matches) {
            // Remove brackets if they exist
            const ticketId = match.replace(/[\[\]]/g, '');
            core.debug(`Found ticket ID: ${ticketId}`);
            if (!ticketIds.has(ticketId)) {
                ticketIds.add(ticketId);
                try {
                    const ticket = await (0, fetchLinearTicket_1.fetchLinearTicket)(linearApiKey, ticketId);
                    if (ticket) {
                        core.debug(`Successfully fetched ticket: ${ticketId}`);
                        tickets.push(ticket);
                    }
                    else {
                        core.debug(`No ticket found for ID: ${ticketId}`);
                    }
                }
                catch (error) {
                    core.error(`Failed to fetch Linear ticket ${ticketId}: ${error}`);
                }
            }
        }
    }
    return tickets;
}
