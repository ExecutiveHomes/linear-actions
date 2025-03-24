"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommits = getCommits;
const child_process_1 = require("child_process");
const findLatestTag_1 = require("./findLatestTag");
const logger_1 = require("./logger");
function getCommits(lastTagPattern) {
    try {
        const lastTag = (0, findLatestTag_1.findLatestTag)(lastTagPattern);
        const command = `git log ${lastTag}..HEAD --pretty=format:%s`;
        const output = (0, child_process_1.execSync)(command).toString();
        return output.split('\n').filter(Boolean);
    }
    catch (error) {
        logger_1.logger.error('Error getting commits:', error);
        throw new Error('Git command failed');
    }
}
