"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getReleaseNotes_1 = require("./getReleaseNotes");
const logger_1 = require("./logger");
async function main() {
    try {
        const linearApiKey = process.env.LINEAR_API_KEY;
        const buildNumber = process.env.BUILD_NUMBER;
        const lastTagPattern = process.env.LAST_TAG_PATTERN;
        const testflightAppId = process.env.TESTFLIGHT_APP_ID;
        const branch = process.env.BRANCH;
        const commit = process.env.COMMIT;
        if (!linearApiKey || !buildNumber || !lastTagPattern) {
            throw new Error('LINEAR_API_KEY, BUILD_NUMBER, and LAST_TAG_PATTERN environment variables are required');
        }
        const releaseNotes = await (0, getReleaseNotes_1.getReleaseNotes)({
            linearApiKey,
            buildNumber,
            lastTagPattern,
            testflightAppId,
            branch,
            commit
        });
        logger_1.logger.info(releaseNotes);
    }
    catch (error) {
        logger_1.logger.error('Error:', error);
        process.exit(1);
    }
}
main();
