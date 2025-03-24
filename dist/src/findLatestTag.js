"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLatestTag = findLatestTag;
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
function findLatestTag(pattern) {
    try {
        // Get all tags and sort them by date
        const command = `git tag --sort=-creatordate --list "${pattern}"`;
        const output = (0, child_process_1.execSync)(command).toString();
        const tags = output.split('\n').filter(Boolean);
        if (tags.length === 0) {
            throw new Error(`No tags found matching pattern: ${pattern}`);
        }
        return tags[0]; // Return the most recent tag
    }
    catch (error) {
        logger_1.logger.error('Error finding latest tag:', error);
        throw error; // Re-throw the original error to preserve the message
    }
}
