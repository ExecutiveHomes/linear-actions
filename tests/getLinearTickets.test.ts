// @ts-nocheck
import { describe, expect, jest, test } from '@jest/globals';
import * as core from '@actions/core';
import { getLinearTickets } from '../src/getLinearTickets';
import { fetchLinearTicket } from '../src/fetchLinearTicket';

// Mock the dependencies
jest.mock('@actions/core');
jest.mock('../src/fetchLinearTicket');

describe('getLinearTickets', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should extract and fetch Linear tickets from commit messages', async () => {
    const mockTicket = {
      id: 'MOB-123',
      title: 'Test ticket',
      description: 'Test description',
      state: { name: 'Done' },
      assignee: { name: 'John Doe' },
      labels: { nodes: [{ name: 'feature' }] },
      url: 'https://linear.app/org/issue/MOB-123'
    };

    (fetchLinearTicket as jest.Mock).mockResolvedValue(mockTicket);

    const commitMessages = [
      'feat: implement new feature [MOB-123]',
      'fix: another commit without ticket',
      'chore: update dependencies MOB-123'
    ];

    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([mockTicket]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
    expect(core.debug).toHaveBeenCalledWith('Found ticket ID: MOB-123');
  });

  it('should handle commit messages without ticket IDs', async () => {
    const commitMessages = [
      'feat: implement new feature',
      'fix: another commit',
      'chore: update dependencies'
    ];

    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([]);
    expect(fetchLinearTicket).not.toHaveBeenCalled();
    expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(/No ticket IDs found in commit message/));
  });

  it('should handle failed ticket fetches', async () => {
    (fetchLinearTicket as jest.Mock).mockResolvedValue(null);

    const commitMessages = [
      'feat: implement new feature [MOB-123]'
    ];

    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
    expect(core.debug).toHaveBeenCalledWith('No ticket found for ID: MOB-123');
  });

  it('should handle errors during ticket fetch', async () => {
    (fetchLinearTicket as jest.Mock).mockRejectedValue(new Error('API error'));

    const commitMessages = [
      'feat: implement new feature [MOB-123]'
    ];

    const tickets = await getLinearTickets(commitMessages, 'test-api-key');

    expect(tickets).toEqual([]);
    expect(fetchLinearTicket).toHaveBeenCalledTimes(1);
    expect(fetchLinearTicket).toHaveBeenCalledWith('test-api-key', 'MOB-123');
    expect(core.error).toHaveBeenCalledWith('Failed to fetch Linear ticket MOB-123: Error: API error');
  });
}); 