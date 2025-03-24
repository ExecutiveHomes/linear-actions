import { jest, describe, it, expect, beforeEach } from '@jest/globals';

import { getLinearTickets } from '../src/getLinearTickets';
import { getReleaseNotes } from '../src/getReleaseNotes';
import type { ReleaseNotesConfig } from '../src/types';

jest.mock('../src/getLinearTickets');

describe('getReleaseNotes', () => {
  const mockConfig: ReleaseNotesConfig = {
    linearApiKey: 'test-api-key',
    buildNumber: '1.0.0',
    lastTagPattern: 'release/*',
    testflightAppId: 'testflight-id'
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should generate release notes with all information', async () => {
    const mockTickets = [
      '- [ABC-123](https://linear.app/abc-123): Add new feature',
      '- [XYZ-789](https://linear.app/xyz-789): Fix bug'
    ];

    (getLinearTickets as jest.MockedFunction<typeof getLinearTickets>).mockResolvedValue(mockTickets);

    const result = await getReleaseNotes(mockConfig);

    expect(getLinearTickets).toHaveBeenCalledWith(mockConfig.linearApiKey, mockConfig.lastTagPattern);
    expect(result).toContain('## Development Release 1.0.0');
    expect(result).toContain(mockTickets[0]);
    expect(result).toContain(mockTickets[1]);
    expect(result).toContain('Build Number: 1.0.0');
    expect(result).toContain('View in TestFlight');
  });

  it('should handle missing optional fields', async () => {
    const minimalConfig: ReleaseNotesConfig = {
      linearApiKey: 'test-api-key',
      buildNumber: '1.0.0',
      lastTagPattern: 'release/*'
    };

    (getLinearTickets as jest.MockedFunction<typeof getLinearTickets>).mockResolvedValue([]);

    const result = await getReleaseNotes(minimalConfig);

    expect(result).toContain('## Development Release 1.0.0');
    expect(result).toContain('No Linear tickets found');
    expect(result).toContain('TestFlight link not available');
  });

  it('should throw error when required fields are missing', async () => {
    const invalidConfig: Partial<ReleaseNotesConfig> = {
      linearApiKey: 'test-api-key'
    };

    await expect(getReleaseNotes(invalidConfig as ReleaseNotesConfig)).rejects.toThrow('buildNumber is required');

    const invalidConfig2: Partial<ReleaseNotesConfig> = {
      buildNumber: '1.0.0'
    };

    await expect(getReleaseNotes(invalidConfig2 as ReleaseNotesConfig)).rejects.toThrow('linearApiKey is required');
  });

  it('should handle errors from getLinearTickets', async () => {
    (getLinearTickets as jest.MockedFunction<typeof getLinearTickets>).mockRejectedValue(new Error('API Error'));

    await expect(getReleaseNotes(mockConfig)).rejects.toThrow('API Error');
  });
});

describe('getReleaseNotes CLI', () => {
  const mockedGetLinearTickets = jest.mocked(getLinearTickets);
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env = {
      ...originalEnv,
      LINEAR_API_KEY: 'test-key',
      BUILD_NUMBER: '123',
      LAST_TAG_PATTERN: 'release/*',
      TESTFLIGHT_APP_ID: 'test-id',
      BRANCH: 'main',
      COMMIT: 'abc123'
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('should generate release notes with all environment variables', async () => {
    const mockTickets = [
      'ABC-123: Fixed a bug',
      'XYZ-456: Added a feature'
    ];
    mockedGetLinearTickets.mockResolvedValue(mockTickets);

    const config: ReleaseNotesConfig = {
      linearApiKey: process.env.LINEAR_API_KEY!,
      buildNumber: process.env.BUILD_NUMBER!,
      lastTagPattern: process.env.LAST_TAG_PATTERN!,
      testflightAppId: process.env.TESTFLIGHT_APP_ID,
      branch: process.env.BRANCH,
      commit: process.env.COMMIT
    };

    const result = await getReleaseNotes(config);
    expect(result).toContain('Development Release 123');
    expect(result).toContain('ABC-123: Fixed a bug');
    expect(result).toContain('XYZ-456: Added a feature');
    expect(mockedGetLinearTickets).toHaveBeenCalledWith(config.linearApiKey, config.lastTagPattern);
  });

  it('should throw error for missing required environment variables', async () => {
    delete process.env.LINEAR_API_KEY;
    delete process.env.BUILD_NUMBER;
    delete process.env.LAST_TAG_PATTERN;

    const config: ReleaseNotesConfig = {
      linearApiKey: process.env.LINEAR_API_KEY!,
      buildNumber: process.env.BUILD_NUMBER!,
      lastTagPattern: process.env.LAST_TAG_PATTERN!
    };

    await expect(getReleaseNotes(config)).rejects.toThrow('linearApiKey is required');
  });
}); 