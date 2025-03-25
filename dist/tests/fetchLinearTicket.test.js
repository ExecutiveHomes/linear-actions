"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const globals_1 = require("@jest/globals");
const node_fetch_1 = __importDefault(require("node-fetch"));
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock node-fetch
globals_1.jest.mock('node-fetch');
const mockedFetch = node_fetch_1.default;
(0, globals_1.describe)('fetchLinearTicket', () => {
    beforeEach(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.test)('should fetch and parse Linear ticket data', async () => {
        const mockTicket = {
            id: 'ABC-123',
            title: 'Test Ticket',
            description: 'Test Description',
            url: 'https://linear.app/test'
        };
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    issue: {
                        id: mockTicket.id,
                        title: mockTicket.title,
                        description: mockTicket.description,
                        url: mockTicket.url
                    }
                }
            })
        });
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123');
        (0, globals_1.expect)(result).toEqual(mockTicket);
    });
    (0, globals_1.test)('should return null for non-existent ticket', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                data: {
                    issue: null
                }
            })
        });
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123');
        (0, globals_1.expect)(result).toBeNull();
    });
    (0, globals_1.test)('should handle API errors', async () => {
        mockedFetch.mockRejectedValueOnce(new Error('API Error'));
        await (0, globals_1.expect)((0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123')).rejects.toThrow('API Error');
    });
});
