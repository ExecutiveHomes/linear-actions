import { describe, expect, jest, test } from '@jest/globals';
import * as core from '@actions/core';
import { getLinearTickets } from '../src/getLinearTickets';
import { fetchLinearTicket } from '../src/fetchLinearTicket';

// Mock dependencies
jest.mock('@actions/core', () => ({
  debug: jest.fn(),
  error: jest.fn()
}));
jest.mock('../src/fetchLinearTicket');

describe('getLinearTickets', () => {
  const mockFetchLinearTicket = fetchLinearTicket as jest.MockedFunction<typeof fetchLinearTicket>;

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('extracts and fetches Linear tickets from commit messages', async () => {
    const mockTicket = {
      id: 'TEST-123',
      title: 'Test Ticket',
      description: 'Test Description',
      state: { name: 'In Progress' },
      assignee: { name: 'John Doe' },
      labels: { nodes: [{ name: 'bug' }] }
    };

    mockFetchLinearTicket.mockResolvedValueOnce(mockTicket);

    const commitMessages = [
      'feat: [TEST-123] Add new feature',
      'fix: Regular commit without ticket',
      'chore: [TEST-123] Another commit with same ticket'
    ];

    const result = await getLinearTickets(commitMessages, 'test-api-key');

    expect(result).toEqual([mockTicket]);
    expect(mockFetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
  });

  test('handles multiple unique tickets in commit messages', async () => {
    const mockTicket1 = {
      id: 'TEST-123',
      title: 'Test Ticket 1',
      description: 'Test Description 1',
      state: { name: 'In Progress' },
      assignee: { name: 'John Doe' },
      labels: { nodes: [{ name: 'bug' }] }
    };

    const mockTicket2 = {
      id: 'TEST-456',
      title: 'Test Ticket 2',
      description: 'Test Description 2',
      state: { name: 'Done' },
      assignee: { name: 'Jane Doe' },
      labels: { nodes: [{ name: 'feature' }] }
    };

    mockFetchLinearTicket
      .mockResolvedValueOnce(mockTicket1)
      .mockResolvedValueOnce(mockTicket2);

    const commitMessages = [
      'feat: [TEST-123] First feature',
      'fix: [TEST-456] Bug fix',
      'chore: [TEST-123] Another commit'
    ];

    const result = await getLinearTickets(commitMessages, 'test-api-key');

    expect(result).toEqual([mockTicket1, mockTicket2]);
    expect(mockFetchLinearTicket).toHaveBeenCalledTimes(2);
    expect(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
    expect(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-456');
  });

  test('handles failed ticket fetches', async () => {
    mockFetchLinearTicket.mockResolvedValueOnce(null);

    const commitMessages = ['feat: [TEST-123] Feature with unfetchable ticket'];

    const result = await getLinearTickets(commitMessages, 'test-api-key');

    expect(result).toEqual([]);
    expect(mockFetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(mockFetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'TEST-123');
  });

  test('handles commit messages without tickets', async () => {
    const commitMessages = [
      'feat: Regular commit',
      'fix: Another regular commit'
    ];

    const result = await getLinearTickets(commitMessages, 'test-api-key');

    expect(result).toEqual([]);
    expect(mockFetchLinearTicket).not.toHaveBeenCalled();
  });
}); 