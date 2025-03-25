"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const getLinearTickets_1 = require("../src/getLinearTickets");
globals_1.jest.mock('../src/getLinearTickets');
(0, globals_1.describe)('index', () => {
    const mockedGetLinearTickets = getLinearTickets_1.getLinearTickets;
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
        process.env.LINEAR_API_KEY = 'test-key';
        process.env.BUILD_NUMBER = '123';
        process.env.LAST_TAG_PATTERN = 'release/*';
    });
    (0, globals_1.test)('should generate release notes successfully', async () => {
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
        // Run the main function
        const { main } = require('../src/index');
        await main();
        (0, globals_1.expect)(mockedGetLinearTickets).toHaveBeenCalled();
    });
    (0, globals_1.test)('should handle no tickets found', async () => {
        const emptyMap = new Map();
        mockedGetLinearTickets.mockResolvedValue(emptyMap);
        // Run the main function
        const { main } = require('../src/index');
        await main();
        (0, globals_1.expect)(mockedGetLinearTickets).toHaveBeenCalled();
    });
});
