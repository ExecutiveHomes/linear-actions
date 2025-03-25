import * as core from '@actions/core';
import * as github from '@actions/github';
import { getLinearTickets } from './getLinearTickets';
import { pre } from './pre';
import { post } from './post';
import { LinearTicket } from './types';

export async function getLinearCommits(
  linearApiKey: string,
  tagPattern: string
): Promise<{ tickets: LinearTicket[] }> {
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
  const matchingTags = tags.filter(tag => {
    const pattern = new RegExp(tagPattern.replace('*', '.*'));
    const matches = pattern.test(tag.name);
    core.info(`Tag ${tag.name} ${matches ? 'matches' : 'does not match'} pattern ${tagPattern}`);
    return matches;
  });

  core.info(`Found ${matchingTags.length} matching tags`);
  core.info('Matching tags:');
  matchingTags.forEach(tag => core.info(`- ${tag.name}`));

  if (matchingTags.length === 0) {
    core.info('No matching tags found');
    return { tickets: [] };
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
  const commitMessages = commits.commits.map(commit => commit.commit.message);
  
  core.info('Found commit messages:');
  commitMessages.forEach(msg => core.info(`- ${msg}`));

  // Get Linear tickets from commit messages
  const tickets = await getLinearTickets(commitMessages, linearApiKey);
  
  // Add commits to each ticket
  const ticketsWithCommits = tickets.map(ticket => {
    const ticketCommits = commits.commits.filter(commit => {
      const matches = commit.commit.message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
      if (!matches) return false;
      return matches.some(match => match.replace(/[\[\]]/g, '') === ticket.id);
    }).map(commit => ({
      message: commit.commit.message,
      sha: commit.sha
    }));

    return {
      ...ticket,
      commits: ticketCommits
    };
  });
  
  core.info(`Found ${ticketsWithCommits.length} Linear tickets`);
  if (ticketsWithCommits.length > 0) {
    core.info('Tickets found:');
    ticketsWithCommits.forEach(ticket => core.info(`- ${ticket.id}: ${ticket.title}`));
  }

  return { tickets: ticketsWithCommits };
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
        const result = await getLinearCommits(linearApiKey, tagPattern);
        core.setOutput('tickets', JSON.stringify(result.tickets));
        break;
      }
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    await post();
  } catch (error) {
    core.setFailed(`Action failed: ${(error as Error).message}`);
  }
}

run(); 