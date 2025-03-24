"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getLinearTickets_1 = require("../src/getLinearTickets");
const getReleaseNotes_1 = require("../src/getReleaseNotes");
globals_1.jest.mock('../src/getLinearTickets');
(0, globals_1.describe)('getReleaseNotes', () => {
    const mockConfig = {
        linearApiKey: 'test-api-key',
        buildNumber: '1.0.0',
        lastTagPattern: 'release/*',
        testflightAppId: 'testflight-id'
    };
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('should generate release notes with all information', async () => {
        const mockTickets = [
            '- [ABC-123](https://linear.app/abc-123): Add new feature',
            '- [XYZ-789](https://linear.app/xyz-789): Fix bug'
        ];
        getLinearTickets_1.getLinearTickets.mockResolvedValue(mockTickets);
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(mockConfig);
        (0, globals_1.expect)(getLinearTickets_1.getLinearTickets).toHaveBeenCalledWith(mockConfig.linearApiKey, mockConfig.lastTagPattern);
        (0, globals_1.expect)(result).toContain('## Development Release 1.0.0');
        (0, globals_1.expect)(result).toContain(mockTickets[0]);
        (0, globals_1.expect)(result).toContain(mockTickets[1]);
        (0, globals_1.expect)(result).toContain('Build Number: 1.0.0');
        (0, globals_1.expect)(result).toContain('View in TestFlight');
    });
    (0, globals_1.it)('should handle missing optional fields', async () => {
        const minimalConfig = {
            linearApiKey: 'test-api-key',
            buildNumber: '1.0.0',
            lastTagPattern: 'release/*'
        };
        getLinearTickets_1.getLinearTickets.mockResolvedValue([]);
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(minimalConfig);
        (0, globals_1.expect)(result).toContain('## Development Release 1.0.0');
        (0, globals_1.expect)(result).toContain('No Linear tickets found');
        (0, globals_1.expect)(result).toContain('TestFlight link not available');
    });
    (0, globals_1.it)('should throw error when required fields are missing', async () => {
        const invalidConfig = {
            linearApiKey: 'test-api-key'
        };
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(invalidConfig)).rejects.toThrow('buildNumber is required');
        const invalidConfig2 = {
            buildNumber: '1.0.0'
        };
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(invalidConfig2)).rejects.toThrow('linearApiKey is required');
    });
    (0, globals_1.it)('should handle errors from getLinearTickets', async () => {
        getLinearTickets_1.getLinearTickets.mockRejectedValue(new Error('API Error'));
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(mockConfig)).rejects.toThrow('API Error');
    });
});
(0, globals_1.describe)('getReleaseNotes CLI', () => {
    const mockedGetLinearTickets = globals_1.jest.mocked(getLinearTickets_1.getLinearTickets);
    const originalEnv = process.env;
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
        process.env = {
            ...originalEnv,
            LINEAR_API_KEY: 'test-key',
            BUILD_NUMBER: '123',
            LAST_TAG_PATTERN: 'release/*',
            TESTFLIGHT_APP_ID: 'test-id',
            BRANCH: 'main',
            COMMIT: 'abc123'
        };
    });
    afterEach(() => {
        process.env = originalEnv;
    });
    (0, globals_1.it)('should generate release notes with all environment variables', async () => {
        const mockTickets = [
            'ABC-123: Fixed a bug',
            'XYZ-456: Added a feature'
        ];
        mockedGetLinearTickets.mockResolvedValue(mockTickets);
        const config = {
            linearApiKey: process.env.LINEAR_API_KEY,
            buildNumber: process.env.BUILD_NUMBER,
            lastTagPattern: process.env.LAST_TAG_PATTERN,
            testflightAppId: process.env.TESTFLIGHT_APP_ID,
            branch: process.env.BRANCH,
            commit: process.env.COMMIT
        };
        const result = await (0, getReleaseNotes_1.getReleaseNotes)(config);
        (0, globals_1.expect)(result).toContain('Development Release 123');
        (0, globals_1.expect)(result).toContain('ABC-123: Fixed a bug');
        (0, globals_1.expect)(result).toContain('XYZ-456: Added a feature');
        (0, globals_1.expect)(mockedGetLinearTickets).toHaveBeenCalledWith(config.linearApiKey, config.lastTagPattern);
    });
    (0, globals_1.it)('should throw error for missing required environment variables', async () => {
        delete process.env.LINEAR_API_KEY;
        delete process.env.BUILD_NUMBER;
        delete process.env.LAST_TAG_PATTERN;
        const config = {
            linearApiKey: process.env.LINEAR_API_KEY,
            buildNumber: process.env.BUILD_NUMBER,
            lastTagPattern: process.env.LAST_TAG_PATTERN
        };
        await (0, globals_1.expect)((0, getReleaseNotes_1.getReleaseNotes)(config)).rejects.toThrow('linearApiKey is required');
    });
});
