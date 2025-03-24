import fetch, { Response } from 'node-fetch';

import { fetchLinearTicket } from '../src/fetchLinearTicket';
import type { LinearTicket } from '../src/types';

// Mock node-fetch
jest.mock('node-fetch');
const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('fetchLinearTicket', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch ticket details successfully', async () => {
    const mockTicket: LinearTicket = {
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
    } as Response);

    const result = await fetchLinearTicket('test-key', 'ABC-123');
    expect(result).toEqual(mockTicket);
    expect(mockedFetch).toHaveBeenCalledWith(
      'https://api.linear.app/graphql',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'test-key'
        },
        body: expect.stringContaining('ABC-123')
      })
    );
  });

  it('should handle HTTP errors', async () => {
    mockedFetch.mockResolvedValueOnce({
      ok: false,
      status: 404
    } as Response);

    await expect(fetchLinearTicket('test-key', 'ABC-123')).rejects.toThrow('HTTP error! status: 404');
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
    } as Response);

    await expect(fetchLinearTicket('test-key', 'ABC-123')).rejects.toThrow('GraphQL Error');
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
    } as Response);

    const result = await fetchLinearTicket('test-key', 'ABC-123');
    expect(result).toBeNull();
  });
}); 