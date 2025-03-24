import { execSync } from 'child_process';

import { jest, describe, it, expect, beforeEach } from '@jest/globals';

import { findLatestTag } from '../src/findLatestTag';
import { getCommits } from '../src/getCommits';


// Mock execSync and findLatestTag
jest.mock('child_process', () => ({
  execSync: jest.fn()
}));

jest.mock('../src/findLatestTag', () => ({
  findLatestTag: jest.fn()
}));

describe('getCommits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get commits since last tag', () => {
    // Mock findLatestTag to return a tag
    (findLatestTag as jest.Mock).mockReturnValue('v1.0.0');
    
    // Mock git log command output
    (execSync as jest.Mock).mockReturnValue('commit1\ncommit2\ncommit3');

    const result = getCommits('release/*');
    expect(result).toEqual(['commit1', 'commit2', 'commit3']);
    expect(findLatestTag).toHaveBeenCalledWith('release/*');
    expect(execSync).toHaveBeenCalledWith('git log v1.0.0..HEAD --pretty=format:%s');
  });

  it('should handle git command failures', () => {
    // Mock findLatestTag to return a tag
    (findLatestTag as jest.Mock).mockReturnValue('v1.0.0');
    
    // Mock git command failure
    (execSync as jest.Mock).mockImplementation(() => {
      throw new Error('Git command failed');
    });

    expect(() => getCommits('release/*')).toThrow('Git command failed');
  });
}); 