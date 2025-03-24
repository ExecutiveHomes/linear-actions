"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getLinearTickets_1 = require("../src/getLinearTickets");
const getReleaseNotes_1 = require("../src/getReleaseNotes");
// Mock getLinearTickets
globals_1.jest.mock('../src/getLinearTickets');
(0, globals_1.describe)('getReleaseNotes', () => {
    const mockedGetLinearTickets = globals_1.jest.mocked(getLinearTickets_1.getLinearTickets);
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('should generate release notes with all information', async () => {
        const mockTickets = [
            'ABC-123: Fixed a bug',
            'XYZ-456: Added a feature'
        ];
        mockedGetLinearTickets.mockResolvedValue(mockTickets);
        const config = {
            buildNumber: '123',
            branch: 'main',
            commit: 'abc123',
            linearApiKey: 'test-key',
            testflightAppId: 'test-id',
            lastTagPattern: 'release/*'
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toContain('Development Release 123');
        (0, globals_1.expect)(result).toContain('ABC-123: Fixed a bug');
        (0, globals_1.expect)(result).toContain('XYZ-456: Added a feature');
        (0, globals_1.expect)(result).toContain('View in TestFlight');
        (0, globals_1.expect)(result).toContain('test-id');
        (0, globals_1.expect)(result).toContain('main');
        (0, globals_1.expect)(result).toContain('abc123');
    });
    (0, globals_1.it)('should handle missing optional fields', async () => {
        const mockTickets = ['ABC-123: Fixed a bug'];
        mockedGetLinearTickets.mockResolvedValue(mockTickets);
        const config = {
            buildNumber: '123',
            branch: 'main',
            linearApiKey: 'test-key',
            lastTagPattern: 'release/*'
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toContain('Development Release 123');
        (0, globals_1.expect)(result).toContain('ABC-123: Fixed a bug');
        (0, globals_1.expect)(result).toContain('TestFlight link not available');
        (0, globals_1.expect)(result).not.toContain('Commit:');
    });
    (0, globals_1.it)('should handle API errors', async () => {
        mockedGetLinearTickets.mockRejectedValue(new Error('API Error'));
        const config = {
            buildNumber: '123',
            branch: 'main',
            linearApiKey: 'test-key',
            lastTagPattern: 'release/*'
        };
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(config)).rejects.toThrow('API Error');
    });
});
