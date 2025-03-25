"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getReleaseNotes_1 = require("../src/getReleaseNotes");
const getLinearTickets_1 = require("../src/getLinearTickets");
// Mock getLinearTickets
globals_1.jest.mock('../src/getLinearTickets');
const mockedGetLinearTickets = getLinearTickets_1.getLinearTickets;
(0, globals_1.describe)('getReleaseNotes', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
        process.env.LINEAR_API_KEY = 'test-key';
    });
    (0, globals_1.test)('should generate release notes with tickets', async () => {
        const mockTicketMap = new Map();
        mockTicketMap.set('feat(ABC-123): First commit', {
            id: 'ABC-123',
            title: 'Test ticket 1',
            url: 'https://linear.app/test/ABC-123'
        });
        mockTicketMap.set('fix(XYZ-456): Second commit', {
            id: 'XYZ-456',
            title: 'Test ticket 2',
            url: 'https://linear.app/test/XYZ-456'
        });
        mockedGetLinearTickets.mockResolvedValue(mockTicketMap);
        const config = {
            linearApiKey: 'test-key',
            buildNumber: '123',
            lastTagPattern: 'release/*'
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toBeDefined();
        (0, globals_1.expect)(result).toContain('ABC-123');
        (0, globals_1.expect)(result).toContain('XYZ-456');
    });
    (0, globals_1.test)('should handle empty ticket list', async () => {
        const emptyMap = new Map();
        mockedGetLinearTickets.mockResolvedValue(emptyMap);
        const config = {
            linearApiKey: 'test-key',
            buildNumber: '123',
            lastTagPattern: 'release/*'
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toContain('No commits found since last release.');
    });
    (0, globals_1.test)('should generate release notes with all information', async () => {
        const mockTicketMap = new Map();
        mockTicketMap.set('ABC-123: Fixed a bug', {
            id: 'ABC-123',
            title: 'Fixed a bug',
            url: 'https://linear.app/test/ABC-123'
        });
        mockTicketMap.set('XYZ-456: Added a feature', {
            id: 'XYZ-456',
            title: 'Added a feature',
            url: 'https://linear.app/test/XYZ-456'
        });
        mockedGetLinearTickets.mockResolvedValue(mockTicketMap);
        const config = {
            linearApiKey: 'test-key',
            buildNumber: '123',
            lastTagPattern: 'release/*',
            testflightAppId: 'test-id',
            branch: 'main',
            commit: 'abc123'
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toContain('Development Release 123');
        (0, globals_1.expect)(result).toContain('ABC-123');
        (0, globals_1.expect)(result).toContain('XYZ-456');
        (0, globals_1.expect)(result).toContain('View in TestFlight');
        (0, globals_1.expect)(result).toContain('test-id');
        (0, globals_1.expect)(result).toContain('main');
        (0, globals_1.expect)(result).toContain('abc123');
    });
    (0, globals_1.test)('should handle API errors', async () => {
        mockedGetLinearTickets.mockRejectedValue(new Error('API Error'));
        const config = {
            linearApiKey: 'test-key',
            buildNumber: '123',
            lastTagPattern: 'release/*'
        };
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(config)).rejects.toThrow('API Error');
    });
});
