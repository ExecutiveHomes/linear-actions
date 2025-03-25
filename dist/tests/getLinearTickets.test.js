"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getLinearTickets_1 = require("../src/getLinearTickets");
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock dependencies
globals_1.jest.mock('@actions/core', () => ({
    debug: globals_1.jest.fn(),
    error: globals_1.jest.fn()
}));
globals_1.jest.mock('../src/fetchLinearTicket');
(0, globals_1.describe)('getLinearTickets', () => {
    const mockFetchLinearTicket = fetchLinearTicket_1.fetchLinearTicket;
    beforeEach(() => {
        globals_1.jest.resetAllMocks();
    });
    (0, globals_1.test)('extracts and fetches Linear tickets from commit messages', async () => {
        const mockTicket = {
            id: 'TEST-123',
            title: 'Test Ticket',
            description: 'Test Description',
            state: { name: 'In Progress' },
            assignee: { name: 'John Doe' },
            labels: { nodes: [{ name: 'bug' }] }
        };
        mockFetchLinearTicket.mockResolvedValueOnce(mockTicket);
        const commitMessages = [
            'feat: [TEST-123] Add new feature',
            'fix: Regular commit without ticket',
            'chore: [TEST-123] Another commit with same ticket'
        ];
        const result = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(result).toEqual([mockTicket]);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
    });
    (0, globals_1.test)('handles multiple unique tickets in commit messages', async () => {
        const mockTicket1 = {
            id: 'TEST-123',
            title: 'Test Ticket 1',
            description: 'Test Description 1',
            state: { name: 'In Progress' },
            assignee: { name: 'John Doe' },
            labels: { nodes: [{ name: 'bug' }] }
        };
        const mockTicket2 = {
            id: 'TEST-456',
            title: 'Test Ticket 2',
            description: 'Test Description 2',
            state: { name: 'Done' },
            assignee: { name: 'Jane Doe' },
            labels: { nodes: [{ name: 'feature' }] }
        };
        mockFetchLinearTicket
            .mockResolvedValueOnce(mockTicket1)
            .mockResolvedValueOnce(mockTicket2);
        const commitMessages = [
            'feat: [TEST-123] First feature',
            'fix: [TEST-456] Bug fix',
            'chore: [TEST-123] Another commit'
        ];
        const result = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(result).toEqual([mockTicket1, mockTicket2]);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledTimes(2);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-456');
    });
    (0, globals_1.test)('handles failed ticket fetches', async () => {
        mockFetchLinearTicket.mockResolvedValueOnce(null);
        const commitMessages = ['feat: [TEST-123] Feature with unfetchable ticket'];
        const result = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(result).toEqual([]);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledTimes(1);
        (0, globals_1.expect)(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
    });
    (0, globals_1.test)('handles commit messages without tickets', async () => {
        const commitMessages = [
            'feat: Regular commit',
            'fix: Another regular commit'
        ];
        const result = await (0, getLinearTickets_1.getLinearTickets)(commitMessages, 'test-api-key');
        (0, globals_1.expect)(result).toEqual([]);
        (0, globals_1.expect)(mockFetchLinearTicket).not.toHaveBeenCalled();
    });
});
