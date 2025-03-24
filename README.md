# Get Release Notes

A TypeScript utility for generating release notes from Linear tickets and git commits.

## Features

- Extracts Linear ticket IDs from git commit messages
- Fetches ticket details from Linear API
- Generates formatted release notes with ticket information
- Includes TestFlight link and build details
- Fully typed with TypeScript
- Comprehensive test coverage

## Installation

```bash
npm install get-release-notes
```

## Usage

```typescript
import { getReleaseNotes } from 'get-release-notes';

const config = {
  linearApiKey: 'your-linear-api-key',
  buildNumber: '1.0.0',
  lastTag: 'v0.9.0', // optional
  githubSha: 'abc123', // optional
  testflightAppId: 'testflight-id' // optional
};

const releaseNotes = await getReleaseNotes(config);
console.log(releaseNotes);
```

## CLI Usage

The package can also be used as a CLI tool:

```bash
LINEAR_API_KEY=your-key BUILD_NUMBER=1.0.0 node dist/index.js
```

Required environment variables:
- `LINEAR_API_KEY`: Your Linear API key
- `BUILD_NUMBER`: The build number for the release

Optional environment variables:
- `LAST_TAG`: The last release tag to compare against
- `GITHUB_SHA`: The commit SHA of the current build
- `TESTFLIGHT_APP_ID`: Your TestFlight app ID

## Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build
```