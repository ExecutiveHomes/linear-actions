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
const globals_1 = require("@jest/globals");
const github = __importStar(require("@actions/github"));
const core = __importStar(require("@actions/core"));
const fetchLinearTicket_1 = require("../src/fetchLinearTicket");
// Mock the GitHub module
globals_1.jest.mock('@actions/github', () => ({
    getOctokit: globals_1.jest.fn()
}));
// Mock the core module
globals_1.jest.mock('@actions/core', () => ({
    getInput: globals_1.jest.fn(),
    debug: globals_1.jest.fn(),
    setFailed: globals_1.jest.fn()
}));
(0, globals_1.describe)('fetchLinearTicket', () => {
    let mockRequest;
    let mockGetOctokit;
    beforeEach(() => {
        // Reset all mocks before each test
        globals_1.jest.clearAllMocks();
        // Mock getInput to return a test API key
        core.getInput.mockReturnValue('test-api-key');
        // Create a mock request function
        mockRequest = globals_1.jest.fn();
        // Create a mock getOctokit function that returns an object with a request method
        mockGetOctokit = globals_1.jest.fn().mockReturnValue({
            request: mockRequest
        });
        // Replace the real getOctokit with our mock
        github.getOctokit.mockImplementation(mockGetOctokit);
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
        mockRequest.mockImplementation(() => Promise.resolve({
            status: 200,
            url: 'https://api.linear.app/graphql',
            headers: {},
            data: {
                data: {
                    issue: mockTicket
                }
            }
        }));
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toEqual(mockTicket);
        (0, globals_1.expect)(mockGetOctokit).toHaveBeenCalledWith('');
        (0, globals_1.expect)(mockRequest).toHaveBeenCalledWith('POST https://api.linear.app/graphql', globals_1.expect.objectContaining({
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer test-api-key'
            },
            data: {
                query: globals_1.expect.stringContaining('query GetTicket($id: String!)'),
                variables: {
                    id: 'TEST-123'
                }
            }
        }));
    });
    it('should handle API errors gracefully', async () => {
        mockRequest.mockImplementation(() => Promise.resolve({
            status: 200,
            url: 'https://api.linear.app/graphql',
            headers: {},
            data: {
                errors: [{ message: 'API Error' }]
            }
        }));
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: API Error');
    });
    it('should handle network errors gracefully', async () => {
        mockRequest.mockImplementation(() => Promise.reject(new Error('Network error')));
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: Network error');
    });
    it('should handle missing ticket data gracefully', async () => {
        mockRequest.mockImplementation(() => Promise.resolve({
            status: 200,
            url: 'https://api.linear.app/graphql',
            headers: {},
            data: {
                data: {
                    issue: null
                }
            }
        }));
        const result = await (0, fetchLinearTicket_1.fetchLinearTicket)('test-api-key', 'TEST-123');
        (0, globals_1.expect)(result).toBeNull();
        (0, globals_1.expect)(core.setFailed).toHaveBeenCalledWith('No ticket data found in response');
    });
});
