"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCommits = getCommits;
const child_process_1 = require("child_process");
const findLatestTag_1 = require("./findLatestTag");
const logger_1 = require("./logger");
async function getCommits(lastTagPattern) {
    try {
        const lastTag = await (0, findLatestTag_1.findLatestTag)(lastTagPattern);
        if (!lastTag) {
            throw new Error('No tags found matching pattern: ' + lastTagPattern);
        }
        // Convert the lastTag to string to ensure proper string interpolation
        const gitLogCommand = `git log ${lastTag.toString()}..HEAD --pretty=format:%s`;
        const output = (0, child_process_1.execSync)(gitLogCommand).toString();
        if (!output) {
            return [];
        }
        return output.split('\n');
    }
    catch (error) {
        logger_1.logger.error('Error getting commits:', error);
        throw error;
    }
}
