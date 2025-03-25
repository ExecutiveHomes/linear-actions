"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getLinearTickets_1 = require("../src/getLinearTickets");
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
globals_1.jest.mock('../src/fetchLinearTicket');
const mockedFetchLinearTicket = fetchLinearTicket_1.fetchLinearTicket;
(0, globals_1.describe)('getLinearTickets', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)('should extract ticket IDs from commit messages', async () => {
        const mockTicket = {
            id: 'ABC-123',
            title: 'Test Ticket',
            url: 'https://linear.app/org/issue/ABC-123'
        };
        mockedFetchLinearTicket.mockResolvedValue(mockTicket);
        const result = await (0, getLinearTickets_1.getLinearTickets)(['test-commit1 (ABC-123)', 'test-commit2 (XYZ-456)']);
        (0, globals_1.expect)(result).toHaveLength(2);
        (0, globals_1.expect)(result[0]).toEqual({
            message: 'test-commit1 (ABC-123)',
            ticket: 'https://linear.app/org/issue/ABC-123'
        });
        (0, globals_1.expect)(result[1]).toEqual({
            message: 'test-commit2 (XYZ-456)',
            ticket: ''
        });
    });
    (0, globals_1.test)('should handle commits without ticket IDs', async () => {
        const result = await (0, getLinearTickets_1.getLinearTickets)(['test-commit1', 'test-commit2']);
        (0, globals_1.expect)(result).toHaveLength(0);
    });
    (0, globals_1.test)('should handle multiple ticket IDs in a single commit', async () => {
        const mockTicket = {
            id: 'ABC-123',
            title: 'Test Ticket',
            url: 'https://linear.app/org/issue/ABC-123'
        };
        mockedFetchLinearTicket.mockResolvedValue(mockTicket);
        const result = await (0, getLinearTickets_1.getLinearTickets)(['test-commit1 (ABC-123) (XYZ-456)']);
        (0, globals_1.expect)(result).toHaveLength(2);
        (0, globals_1.expect)(result[0]).toEqual({
            message: 'test-commit1 (ABC-123) (XYZ-456)',
            ticket: 'https://linear.app/org/issue/ABC-123'
        });
        (0, globals_1.expect)(result[1]).toEqual({
            message: 'test-commit1 (ABC-123) (XYZ-456)',
            ticket: ''
        });
    });
});
