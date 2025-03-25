import * as core from '@actions/core';
import * as github from '@actions/github';
import { getLinearTickets } from './getLinearTickets';
import { pre } from './pre';
import { post } from './post';
import { LinearTicket, GitHubTag, GitHubCommit } from './types';

export async function getLinearCommits(
  linearApiKey: string,
  tagPattern: string
): Promise<LinearTicket[]> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required when running in GitHub Actions');
  }

  const octokit = github.getOctokit(githubToken);

  // List all tags
  const { data: tags } = await octokit.rest.repos.listTags({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  core.info(`Found ${tags.length} total tags`);
  core.info('All tags:');
  tags.forEach(tag => core.info(`- ${tag.name}`));

  // Filter tags matching the pattern
  const matchingTags = (tags as GitHubTag[]).filter(tag => {
    const pattern = new RegExp(tagPattern.replace('*', '.*'));
    const matches = pattern.test(tag.name);
    core.info(`Tag ${tag.name} ${matches ? 'matches' : 'does not match'} pattern ${tagPattern}`);
    return matches;
  });

  core.info(`Found ${matchingTags.length} matching tags`);
  core.info('Matching tags:');
  matchingTags.forEach(tag => core.info(`- ${tag.name}`));

  // Sort tags by name (newest first)
  matchingTags.sort((a, b) => b.name.localeCompare(a.name));

  if (matchingTags.length === 0) {
    core.info('No matching tags found');
    return [];
  }

  // Always compare most recent tag against HEAD
  const base = matchingTags[0].name;
  const head = 'HEAD';

  core.info(`Comparing ${base}...${head}`);

  // Get commits between the base and head
  const { data: commits } = await octokit.rest.repos.compareCommits({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base,
    head,
  });

  // Extract commit messages
  const commitMessages = (commits.commits as GitHubCommit[]).map(commit => commit.commit.message);
  
  core.info('Found commit messages:');
  commitMessages.forEach(msg => core.info(`- ${msg}`));

  // Get Linear tickets from commit messages
  const tickets = await getLinearTickets(commitMessages, linearApiKey);
  
  core.info(`Found ${tickets.length} Linear tickets`);
  if (tickets.length > 0) {
    core.info('Tickets found:');
    tickets.forEach(ticket => core.info(`- ${ticket.id}: ${ticket.title}`));
  }

  return tickets;
}

async function run(): Promise<void> {
  try {
    await pre();

    const action = core.getInput('action', { required: true });
    const linearApiKey = core.getInput('linear-api-key', { required: true });

    switch (action) {
      case 'get-linear-commits': {
        const tagPattern = core.getInput('tag-pattern', { required: true });
        core.info(`Using tag pattern: ${tagPattern}`);
        const tickets = await getLinearCommits(linearApiKey, tagPattern);
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