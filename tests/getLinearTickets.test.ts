// @ts-nocheck
import { describe, expect, jest, test } from '@jest/globals';
import * as core from '@actions/core';
import { getLinearTickets } from '../src/getLinearTickets';
import { fetchLinearTicket } from '../src/fetchLinearTicket';

// Mock the dependencies
jest.mock('@actions/core');
jest.mock('../src/fetchLinearTicket');

describe('getLinearTickets', () => {
  const mockTicket = {
    id: 'MOB-123',
    title: 'Test ticket',
    description: 'Test description',
    state: {
      name: 'Done'
    },
    assignee: {
      name: 'John Doe'
    },
    labels: {
      nodes: [
        {
          name: 'feature'
        }
      ]
    },
    url: 'https://linear.app/org/issue/MOB-123',
    commits: []
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (fetchLinearTicket as jest.Mock).mockResolvedValue(mockTicket);
  });

  test('should extract and fetch Linear tickets from commit messages', async () => {
    const commitMessages = ['feat: implement new feature [MOB-123]'];
    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([mockTicket]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
    expect(core.debug).toHaveBeenCalledWith('Found ticket ID: MOB-123');
  });

  test('should handle commit messages without ticket IDs', async () => {
    const commitMessages = ['chore: update dependencies'];
    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([]);
    expect(fetchLinearTicket).not.toHaveBeenCalled();
    expect(core.debug).toHaveBeenCalledWith('No ticket IDs found in commit message: chore: update dependencies');
  });

  test('should handle failed ticket fetches', async () => {
    (fetchLinearTicket as jest.Mock).mockResolvedValue(null);
    const commitMessages = ['feat: implement new feature [MOB-123]'];
    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
    expect(core.debug).toHaveBeenCalledWith('No ticket found for ID: MOB-123');
  });

  test('should deduplicate ticket IDs', async () => {
    const commitMessages = [
      'feat: implement new feature [MOB-123]',
      'fix: address feedback [MOB-123]'
    ];
    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([mockTicket]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
  });
}); 