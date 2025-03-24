"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const globals_1 = require("@jest/globals");
const findLatestTag_1 = require("../src/findLatestTag");
const getCommits_1 = require("../src/getCommits");
// Mock execSync and findLatestTag
globals_1.jest.mock('child_process', () => ({
    execSync: globals_1.jest.fn()
}));
globals_1.jest.mock('../src/findLatestTag', () => ({
    findLatestTag: globals_1.jest.fn()
}));
(0, globals_1.describe)('getCommits', () => {
    (0, globals_1.beforeEach)(() => {
        globals_1.jest.clearAllMocks();
    });
    (0, globals_1.it)('should get commits since last tag', () => {
        // Mock findLatestTag to return a tag
        findLatestTag_1.findLatestTag.mockReturnValue('v1.0.0');
        // Mock git log command output
        child_process_1.execSync.mockReturnValue('commit1\ncommit2\ncommit3');
        const result = (0, getCommits_1.getCommits)('release/*');
        (0, globals_1.expect)(result).toEqual(['commit1', 'commit2', 'commit3']);
        (0, globals_1.expect)(findLatestTag_1.findLatestTag).toHaveBeenCalledWith('release/*');
        (0, globals_1.expect)(child_process_1.execSync).toHaveBeenCalledWith('git log v1.0.0..HEAD --pretty=format:%s');
    });
    (0, globals_1.it)('should handle git command failures', () => {
        // Mock findLatestTag to return a tag
        findLatestTag_1.findLatestTag.mockReturnValue('v1.0.0');
        // Mock git command failure
        child_process_1.execSync.mockImplementation(() => {
            throw new Error('Git command failed');
        });
        (0, globals_1.expect)(() => (0, getCommits_1.getCommits)('release/*')).toThrow('Git command failed');
    });
});
