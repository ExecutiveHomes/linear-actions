import * as core from '@actions/core';
import * as github from '@actions/github';
import { getLinearTickets } from './getLinearTickets';
import { pre } from './pre';
import { post } from './post';
import { LinearTicket, GitHubTag, GitHubCommit } from './types';

export async function getLinearCommits(
  linearApiKey: string,
  tagPattern: string,
  githubToken: string
): Promise<LinearTicket[]> {
  const octokit = github.getOctokit(githubToken);

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
    return [];
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
  return getLinearTickets(commitMessages, linearApiKey);
}

async function run(): Promise<void> {
  try {
    await pre();

    const action = core.getInput('action', { required: true });
    const linearApiKey = core.getInput('linear-api-key', { required: true });
    const githubToken = core.getInput('github-token', { required: true });

    switch (action) {
      case 'get-linear-commits': {
        const tagPattern = core.getInput('tag-pattern', { required: true });
        const tickets = await getLinearCommits(linearApiKey, tagPattern, githubToken);
        core.setOutput('tickets', JSON.stringify(tickets));
        break;
      }
      // Add more cases here for future actions
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await post();
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run(); 