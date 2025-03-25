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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLinearTicket = fetchLinearTicket;
const node_fetch_1 = __importDefault(require("node-fetch"));
const core = __importStar(require("@actions/core"));
async function fetchLinearTicket(linearApiKey, ticketId) {
    var _a;
    try {
        const response = await (0, node_fetch_1.default)('https://api.linear.app/graphql', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${linearApiKey}`,
            },
            body: JSON.stringify({
                query: `
          query GetTicket($id: String!) {
            issue(id: $id) {
              id
              title
              description
              state {
                name
              }
              assignee {
                name
              }
              labels {
                nodes {
                  name
                }
              }
            }
          }
        `,
                variables: {
                    id: ticketId,
                },
            }),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.errors) {
            throw new Error(data.errors[0].message);
        }
        return ((_a = data.data) === null || _a === void 0 ? void 0 : _a.issue) || null;
    }
    catch (error) {
        core.error(`Error fetching Linear ticket ${ticketId}: ${error}`);
        return null;
    }
}
