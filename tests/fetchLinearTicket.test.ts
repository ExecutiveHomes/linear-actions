import { describe, expect, jest, test } from '@jest/globals';
import * as github from '@actions/github';
import * as core from '@actions/core';
import { fetchLinearTicket } from '../src/fetchLinearTicket';

// Mock the GitHub module
jest.mock('@actions/github', () => ({
  getOctokit: jest.fn()
}));

// Mock the core module
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  debug: jest.fn(),
  setFailed: jest.fn()
}));

// Define the type for the mock request function
type MockRequestResponse = {
  status: number;
  url: string;
  headers: Record<string, string>;
  data: {
    data?: {
      issue?: {
        id: string;
        title: string;
        description: string;
        state: {
          name: string;
        };
        assignee?: {
          name: string;
        };
        labels: {
          nodes: Array<{
            name: string;
          }>;
        };
      } | null;
    };
    errors?: Array<{
      message: string;
    }>;
  };
};

describe('fetchLinearTicket', () => {
  let mockRequest: jest.Mock;
  let mockGetOctokit: jest.Mock;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock getInput to return a test API key
    (core.getInput as jest.Mock).mockReturnValue('test-api-key');

    // Create a mock request function
    mockRequest = jest.fn();

    // Create a mock getOctokit function that returns an object with a request method
    mockGetOctokit = jest.fn().mockReturnValue({
      request: mockRequest
    });

    // Replace the real getOctokit with our mock
    (github.getOctokit as jest.Mock).mockImplementation(mockGetOctokit);
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

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toEqual(mockTicket);
    expect(mockGetOctokit).toHaveBeenCalledWith('');
    expect(mockRequest).toHaveBeenCalledWith(
      'POST https://api.linear.app/graphql',
      expect.objectContaining({
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        data: {
          query: expect.stringContaining('query GetTicket($id: String!)'),
          variables: {
            id: 'TEST-123'
          }
        }
      })
    );
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

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: API Error');
  });

  it('should handle network errors gracefully', async () => {
    mockRequest.mockImplementation(() => Promise.reject(new Error('Network error')));

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: Network error');
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

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('No ticket data found in response');
  });
}); 