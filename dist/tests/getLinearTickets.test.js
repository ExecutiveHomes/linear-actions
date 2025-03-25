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
// @ts-nocheck
const globals_1 = require("@jest/globals");
const core = __importStar(require("@actions/core"));
const getLinearTickets_1 = require("../src/getLinearTickets");
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock the dependencies
globals_1.jest.mock('@actions/core');
globals_1.jest.mock('../src/fetchLinearTicket');
(0, globals_1.describe)('getLinearTickets', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    it('should extract and fetch Linear tickets from commit messages', async () => {
        const mockTicket = {
            id: 'MOB-123',
            title: 'Test ticket',
            description: 'Test description',
            state: { name: 'Done' },
            assignee: { name: 'John Doe' },
            labels: { nodes: [{ name: 'feature' }] },
            url: 'https://linear.app/org/issue/MOB-123'
        };
        fetchLinearTicket_1.fetchLinearTicket.mockResolvedValue(mockTicket);
        const commitMessages = [
            'feat: implement new feature [MOB-123]',
            'fix: another commit without ticket',
            'chore: update dependencies MOB-123'
        ];
        const tickets = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(tickets).toEqual([mockTicket]);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('Found ticket ID: MOB-123');
    });
    it('should handle commit messages without ticket IDs', async () => {
        const commitMessages = [
            'feat: implement new feature',
            'fix: another commit',
            'chore: update dependencies'
        ];
        const tickets = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(tickets).toEqual([]);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).not.toHaveBeenCalled();
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith(globals_1.expect.stringMatching(/No ticket IDs found in commit message/));
    });
    it('should handle failed ticket fetches', async () => {
        fetchLinearTicket_1.fetchLinearTicket.mockResolvedValue(null);
        const commitMessages = [
            'feat: implement new feature [MOB-123]'
        ];
        const tickets = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(tickets).toEqual([]);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('No ticket found for ID: MOB-123');
    });
    it('should handle errors during ticket fetch', async () => {
        fetchLinearTicket_1.fetchLinearTicket.mockRejectedValue(new Error('API error'));
        const commitMessages = [
            'feat: implement new feature [MOB-123]'
        ];
        const tickets = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(tickets).toEqual([]);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(fetchLinearTicket_1.fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
        (0, globals_1.expect)(core.error).toHaveBeenCalledWith('Failed to fetch Linear ticket MOB-123: Error: API error');
    });
});
