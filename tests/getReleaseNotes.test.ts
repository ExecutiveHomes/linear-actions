import { jest, describe, it, expect } from '@jest/globals';

import { getLinearTickets } from '../src/getLinearTickets';
import { getReleaseNotes } from '../src/getReleaseNotes';

// Mock getLinearTickets
jest.mock('../src/getLinearTickets');

describe('getReleaseNotes', () => {
  const mockedGetLinearTickets = jest.mocked(getLinearTickets);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate release notes with all information', async () => {
    const mockTickets = [
      'ABC-123: Fixed a bug',
      'XYZ-456: Added a feature'
    ];
    mockedGetLinearTickets.mockResolvedValue(mockTickets);

    const config = {
      buildNumber: '123',
      branch: 'main',
      commit: 'abc123',
      linearApiKey: 'test-key',
      testflightAppId: 'test-id',
      lastTagPattern: 'release/*'
    };

    const result = await getReleaseNotes(config);
    expect(result).toContain('Development Release 123');
    expect(result).toContain('ABC-123: Fixed a bug');
    expect(result).toContain('XYZ-456: Added a feature');
    expect(result).toContain('View in TestFlight');
    expect(result).toContain('test-id');
    expect(result).toContain('main');
    expect(result).toContain('abc123');
  });

  it('should handle missing optional fields', async () => {
    const mockTickets = ['ABC-123: Fixed a bug'];
    mockedGetLinearTickets.mockResolvedValue(mockTickets);

    const config = {
      buildNumber: '123',
      branch: 'main',
      linearApiKey: 'test-key',
      lastTagPattern: 'release/*'
    };

    const result = await getReleaseNotes(config);
    expect(result).toContain('Development Release 123');
    expect(result).toContain('ABC-123: Fixed a bug');
    expect(result).toContain('TestFlight link not available');
    expect(result).not.toContain('Commit:');
  });

  it('should handle API errors', async () => {
    mockedGetLinearTickets.mockRejectedValue(new Error('API Error'));

    const config = {
      buildNumber: '123',
      branch: 'main',
      linearApiKey: 'test-key',
      lastTagPattern: 'release/*'
    };

    await expect(getReleaseNotes(config)).rejects.toThrow('API Error');
  });
}); 