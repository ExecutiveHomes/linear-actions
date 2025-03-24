"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
const getCommits_1 = require("../src/getCommits");
const getLinearTickets_1 = require("../src/getLinearTickets");
// Mock dependencies
globals_1.jest.mock('../src/getCommits');
globals_1.jest.mock('../src/fetchLinearTicket');
(0, globals_1.describe)('getLinearTickets', () => {
    const mockedGetCommits = globals_1.jest.mocked(getCommits_1.getCommits);
    const mockedFetchLinearTicket = globals_1.jest.mocked(fetchLinearTicket_1.fetchLinearTicket);
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('should process commits and fetch ticket details', async () => {
        // Mock getCommits to return commits with ticket IDs
        mockedGetCommits.mockReturnValue([
            'feat(ABC-123): First commit',
            'fix(XYZ-456): Second commit'
        ]);
        // Mock fetchLinearTicket to return ticket details
        const mockTicket = {
            title: 'Test Ticket',
            description: 'Test Description',
            url: 'https://linear.app/test'
        };
        mockedFetchLinearTicket.mockResolvedValue(mockTicket);
        const result = await (0, getLinearTickets_1.getLinearTickets)('test-key', 'release/*');
        (0, globals_1.expect)(result).toHaveLength(2);
        (0, globals_1.expect)(mockedGetCommits).toHaveBeenCalledWith('release/*');
        (0, globals_1.expect)(mockedFetchLinearTicket).toHaveBeenCalledWith('test-key', 'ABC-123');
        (0, globals_1.expect)(mockedFetchLinearTicket).toHaveBeenCalledWith('test-key', 'XYZ-456');
    });
    (0, globals_1.it)('should handle commits with no ticket IDs', async () => {
        // Mock getCommits to return commits without ticket IDs
        mockedGetCommits.mockReturnValue([
            'chore: update dependencies',
            'docs: update readme'
        ]);
        const result = await (0, getLinearTickets_1.getLinearTickets)('test-key', 'release/*');
        (0, globals_1.expect)(result).toHaveLength(0);
        (0, globals_1.expect)(mockedFetchLinearTicket).not.toHaveBeenCalled();
    });
    (0, globals_1.it)('should handle failed ticket fetches', async () => {
        // Mock getCommits to return commits with ticket IDs
        mockedGetCommits.mockReturnValue([
            'feat(ABC-123): First commit',
            'fix(XYZ-456): Second commit'
        ]);
        // Mock fetchLinearTicket to fail
        mockedFetchLinearTicket.mockRejectedValue(new Error('API Error'));
        const result = await (0, getLinearTickets_1.getLinearTickets)('test-key', 'release/*');
        (0, globals_1.expect)(result).toEqual(['- ABC-123', '- XYZ-456']);
        (0, globals_1.expect)(mockedGetCommits).toHaveBeenCalledWith('release/*');
        (0, globals_1.expect)(mockedFetchLinearTicket).toHaveBeenCalledTimes(2);
    });
});
