"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = node_fetch_1.default;
describe('fetchLinearTicket', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it('should fetch ticket details successfully', async () => {
        const mockTicket = {
            title: 'Test Ticket',
            description: 'Test Description',
            url: 'https://linear.app/test'
        };
        const mockResponse = {
            data: {
                issue: {
                    title: mockTicket.title,
                    description: mockTicket.description,
                    url: mockTicket.url
                }
            }
        };
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
        });
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123');
        expect(result).toEqual(mockTicket);
        expect(mockedFetch).toHaveBeenCalledWith('https://api.linear.app/graphql', expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'test-key'
            },
            body: expect.stringContaining('ABC-123')
        }));
    });
    it('should handle HTTP errors', async () => {
        mockedFetch.mockResolvedValueOnce({
            ok: false,
            status: 404
        });
        await expect((0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123')).rejects.toThrow('HTTP error! status: 404');
    });
    it('should handle GraphQL errors', async () => {
        const mockResponse = {
            errors: [{ message: 'GraphQL Error' }],
            data: null
        };
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
        });
        await expect((0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123')).rejects.toThrow('GraphQL Error');
    });
    it('should handle missing issue data', async () => {
        const mockResponse = {
            data: {
                issue: null
            }
        };
        mockedFetch.mockResolvedValueOnce({
            ok: true,
            status: 200,
            json: () => Promise.resolve(mockResponse)
        });
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-key', 'ABC-123');
        expect(result).toBeNull();
    });
});
