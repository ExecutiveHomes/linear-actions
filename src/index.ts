import * as core from '@actions/core';
import * as github from '@actions/github';
import { getLinearTickets } from './getLinearTickets';
import { pre } from './pre';
import { post } from './post';

interface GitHubTag {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
}

interface GitHubCommit {
  commit: {
    message: string;
  };
}

async function run(): Promise<void> {
  try {
    await pre();

    const linearApiKey = core.getInput('linear-api-key', { required: true });
    const tagPattern = core.getInput('tag-pattern', { required: true });

    const octokit = github.getOctokit(process.env.GITHUB_TOKEN || '');

    // List all tags
    const { data: tags } = await octokit.rest.repos.listTags({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
    });

    // Filter tags matching the pattern
    const matchingTags = (tags as GitHubTag[]).filter(tag => {
      const pattern = new RegExp(tagPattern);
      return pattern.test(tag.name);
    });

    // Sort tags by name (newest first)
    matchingTags.sort((a, b) => b.name.localeCompare(a.name));

    if (matchingTags.length < 2) {
      core.info('Not enough tags found to compare');
      return;
    }

    // Get commits between the two most recent tags
    const { data: commits } = await octokit.rest.repos.compareCommits({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      base: matchingTags[1].name,
      head: matchingTags[0].name,
    });

    // Extract commit messages
    const commitMessages = (commits.commits as GitHubCommit[]).map(commit => commit.commit.message);

    // Get Linear tickets from commit messages
    const tickets = await getLinearTickets(commitMessages, linearApiKey);

    // Output tickets as JSON
    core.setOutput('tickets', JSON.stringify(tickets));

    await post();
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run(); 