"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLatestTag = findLatestTag;
const child_process_1 = require("child_process");
const logger_1 = require("./logger");
async function findLatestTag(pattern) {
    try {
        // Use git's own pattern matching instead of grep
        const command = `git tag --sort=-v:refname --list "${pattern}" | head -n 1`;
        const output = (0, child_process_1.execSync)(command).toString().trim();
        logger_1.logger.info(`Command: ${command}`);
        if (!output) {
            logger_1.logger.error(`No tags found matching pattern: ${pattern}`);
            return null;
        }
        logger_1.logger.info(`Found latest tag: ${output}`);
        return output;
    }
    catch (error) {
        logger_1.logger.error('Error finding latest tag:', error);
        throw error;
    }
}
