import { execSync } from 'child_process';

import { findLatestTag } from '../src/findLatestTag';

// Mock execSync
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

describe('findLatestTag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return the most recent tag matching the pattern', () => {
    // Mock git tag command output
    (execSync as jest.Mock).mockReturnValue('release/ios/123\nrelease/ios/122\nrelease/ios/121');

    const result = findLatestTag('release/ios/*');
    expect(result).toBe('release/ios/123');
    expect(execSync).toHaveBeenCalledWith('git tag --sort=-creatordate --list "release/ios/*"');
  });

  it('should throw an error when no tags match the pattern', () => {
    // Mock empty git tag command output
    (execSync as jest.Mock).mockReturnValue('');

    expect(() => findLatestTag('nonexistent/*')).toThrow('No tags found matching pattern: nonexistent/*');
  });

  it('should throw an error when git command fails', () => {
    // Mock git command failure
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error('Git command failed');
    });

    expect(() => findLatestTag('release/*')).toThrow('Git command failed');
  });
}); 