import { getReleaseNotes } from './getReleaseNotes';
import { logger } from './logger';

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

    const releaseNotes = await getReleaseNotes({
      linearApiKey,
      buildNumber,
      lastTagPattern,
      testflightAppId,
      branch,
      commit
    });

    logger.info(releaseNotes);
  } catch (error) {
    logger.error('Error:', error);
    process.exit(1);
  }
}

main(); 