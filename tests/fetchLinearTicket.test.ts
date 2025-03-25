// @ts-nocheck
import { describe, expect, jest, test } from '@jest/globals';
import * as core from '@actions/core';
import { fetchLinearTicket } from '../src/fetchLinearTicket';

// Mock the core module
jest.mock('@actions/core', () => ({
  getInput: jest.fn(),
  debug: jest.fn(),
  setFailed: jest.fn()
}));

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('fetchLinearTicket', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock getInput to return a test API key
    (core.getInput as jest.Mock).mockReturnValue('test-api-key');
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
      json: jest.fn().mockResolvedValue({
        data: {
          issue: mockTicket
        }
      })
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toEqual(mockTicket);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://api.linear.app/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key'
        },
        body: expect.stringContaining('TEST-123')
      })
    );
    expect(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
    expect(core.debug).toHaveBeenCalledWith(expect.stringContaining('Successfully fetched ticket:'));
  });

  it('should handle API errors gracefully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        errors: [{ message: 'API Error' }]
      })
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: API Error');
    expect(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
  });

  it('should handle network errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('Failed to fetch Linear ticket: Network error');
    expect(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
  });

  it('should handle missing ticket data gracefully', async () => {
    const mockResponse = {
      ok: true,
      json: jest.fn().mockResolvedValue({
        data: {
          issue: null
        }
      })
    };
    mockFetch.mockResolvedValue(mockResponse);

    const result = await fetchLinearTicket('test-api-key', 'TEST-123');

    expect(result).toBeNull();
    expect(core.setFailed).toHaveBeenCalledWith('No ticket data found in response');
    expect(core.debug).toHaveBeenCalledWith('Fetching Linear ticket TEST-123');
  });
}); 