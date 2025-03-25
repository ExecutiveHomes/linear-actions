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
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock the core module
globals_1.jest.mock('@actions/core', () => ({
    getInput: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
    setFailed: globals_1.jest.fn()
}));
// Mock global fetch
const mockFetch = globals_1.jest.fn();
global.fetch = mockFetch;
(0, globals_1.describe)('fetchLinearTicket', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        globals_1.jest.clearAllMocks();
        // Mock getInput to return a test API key
        core.getInput.mockReturnValue('test-api-key');
    });
    it('should fetch a Linear ticket successfully', async () => {
        const mockTicket = {
            id: '123',
            title: 'Test Ticket',
            description: 'Test Description',
            state: { name: 'In Progress' },
            assignee: { name: 'John Doe' },
            labels: { nodes: [{ name: 'bug' }] }
        };
        const mockResponse = {
            ok: true,
            json: globals_1.jest.fn().mockResolvedValue({
                data: {
                    issue: mockTicket
                }
            })
        };
        mockFetch.mockResolvedValue(mockResponse);
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toEqual(mockTicket);
        (0, globals_1.expect)(mockFetch).toHaveBeenCalledWith('https://api.linear.app/graphql', globals_1.expect.objectContaining({
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'test-api-key'
            },
            body: globals_1.expect.stringContaining('TEST-123')
        }));
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith(globals_1.expect.stringContaining('Successfully fetched ticket:'));
    });
    it('should handle API errors gracefully', async () => {
        const mockResponse = {
            ok: true,
            json: globals_1.jest.fn().mockResolvedValue({
                errors: [{ message: 'API Error' }]
            })
        };
        mockFetch.mockResolvedValue(mockResponse);
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: API Error');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
    });
    it('should handle network errors gracefully', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: Network error');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
    });
    it('should handle missing ticket data gracefully', async () => {
        const mockResponse = {
            ok: true,
            json: globals_1.jest.fn().mockResolvedValue({
                data: {
                    issue: null
                }
            })
        };
        mockFetch.mockResolvedValue(mockResponse);
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('No ticket data found in response');
        (0, globals_1.expect)(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
    });
});
