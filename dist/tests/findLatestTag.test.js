"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const findLatestTag_1 = require("../src/findLatestTag");
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
        child_process_1.execSync.mockReturnValue('release/ios/123\nrelease/ios/122\nrelease/ios/121');
        const result = (0, findLatestTag_1.findLatestTag)('release/ios/*');
        expect(result).toBe('release/ios/123');
        expect(child_process_1.execSync).toHaveBeenCalledWith('git tag --sort=-creatordate --list "release/ios/*"');
    });
    it('should throw an error when no tags match the pattern', () => {
        // Mock empty git tag command output
        child_process_1.execSync.mockReturnValue('');
        expect(() => (0, findLatestTag_1.findLatestTag)('nonexistent/*')).toThrow('No tags found matching pattern: nonexistent/*');
    });
    it('should throw an error when git command fails', () => {
        // Mock git command failure
        child_process_1.execSync.mockImplementation(() => {
            throw new Error('Git command failed');
        });
        expect(() => (0, findLatestTag_1.findLatestTag)('release/*')).toThrow('Git command failed');
    });
});
