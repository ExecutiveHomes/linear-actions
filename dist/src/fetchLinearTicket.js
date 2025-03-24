"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLinearTicket = fetchLinearTicket;
const node_fetch_1 = __importDefault(require("node-fetch"));
const logger_1 = require("./logger");
async function fetchLinearTicket(linearApiKey, ticketId) {
    var _a;
    try {
        const query = `
      query($id: String!) {
        issue(id: $id) {
          title
          description
          url
        }
      }
    `;
        const response = await (0, node_fetch_1.default)('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': linearApiKey
            },
            body: JSON.stringify({
                query,
                variables: { id: ticketId }
            })
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.errors) {
            throw new Error('GraphQL Error');
        }
        if (!((_a = data.data) === null || _a === void 0 ? void 0 : _a.issue)) {
            return null;
        }
        return {
            title: data.data.issue.title,
            description: data.data.issue.description,
            url: data.data.issue.url
        };
    }
    catch (error) {
        logger_1.logger.error(`Error fetching ticket ${ticketId}:`, error);
        throw error;
    }
}
