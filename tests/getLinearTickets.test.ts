import { jest, describe, it, expect } from '@jest/globals';

import { fetchLinearTicket } from '../src/fetchLinearTicket';
import { getCommits } from '../src/getCommits';
import { getLinearTickets } from '../src/getLinearTickets';
import type { LinearTicket } from '../src/types';

// Mock dependencies
jest.mock('../src/getCommits');
jest.mock('../src/fetchLinearTicket');

describe('getLinearTickets', () => {
  const mockedGetCommits = jest.mocked(getCommits);
  const mockedFetchLinearTicket = jest.mocked(fetchLinearTicket);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should process commits and fetch ticket details', async () => {
    // Mock getCommits to return commits with ticket IDs
    mockedGetCommits.mockReturnValue([
      'feat(ABC-123): First commit',
      'fix(XYZ-456): Second commit'
    ]);

    // Mock fetchLinearTicket to return ticket details
    const mockTicket: LinearTicket = {
      title: 'Test Ticket',
      description: 'Test Description',
      url: 'https://linear.app/test'
    };
    mockedFetchLinearTicket.mockResolvedValue(mockTicket);

    const result = await getLinearTickets('test-key', 'release/*');
    expect(result).toHaveLength(2);
    expect(mockedGetCommits).toHaveBeenCalledWith('release/*');
    expect(mockedFetchLinearTicket).toHaveBeenCalledWith('test-key', 'ABC-123');
    expect(mockedFetchLinearTicket).toHaveBeenCalledWith('test-key', 'XYZ-456');
  });

  it('should handle commits with no ticket IDs', async () => {
    // Mock getCommits to return commits without ticket IDs
    mockedGetCommits.mockReturnValue([
      'chore: update dependencies',
      'docs: update readme'
    ]);

    const result = await getLinearTickets('test-key', 'release/*');
    expect(result).toHaveLength(0);
    expect(mockedFetchLinearTicket).not.toHaveBeenCalled();
  });

  it('should handle failed ticket fetches', async () => {
    // Mock getCommits to return commits with ticket IDs
    mockedGetCommits.mockReturnValue([
      'feat(ABC-123): First commit',
      'fix(XYZ-456): Second commit'
    ]);

    // Mock fetchLinearTicket to fail
    mockedFetchLinearTicket.mockRejectedValue(new Error('API Error'));

    const result = await getLinearTickets('test-key', 'release/*');
    expect(result).toEqual(['- ABC-123', '- XYZ-456']);
    expect(mockedGetCommits).toHaveBeenCalledWith('release/*');
    expect(mockedFetchLinearTicket).toHaveBeenCalledTimes(2);
  });
}); 