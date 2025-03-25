import * as core from '@actions/core';
import * as github from '@actions/github';
import { fetchLinearTicket } from './fetchLinearTicket';
import { pre } from './pre';
import { post } from './post';
import { CommitWithTicket } from './types';

export async function getLinearCommits(
  linearApiKey: string,
  tagPattern: string
): Promise<{ commits: CommitWithTicket[] }> {
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    throw new Error('GITHUB_TOKEN environment variable is required when running in GitHub Actions');
  }

  const octokit = github.getOctokit(githubToken);

  // List all tags (GitHub returns them in reverse chronological order)
  const { data: tags } = await octokit.rest.repos.listTags({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  core.info(`Found ${tags.length} total tags`);
  core.info('All tags (in chronological order, newest first):');
  tags.forEach(tag => {
    core.info(`- ${tag.name}`);
  });

  // Find the first tag that matches our pattern
  const pattern = new RegExp(tagPattern.replace('*', '.*'));
  const latestMatchingTag = tags.find(tag => {
    const matches = pattern.test(tag.name);
    core.info(`Tag ${tag.name} ${matches ? 'matches' : 'does not match'} pattern ${tagPattern}`);
    return matches;
  });

  if (!latestMatchingTag) {
    core.info('No matching tags found');
    return { commits: [] };
  }

  const base = latestMatchingTag.name;
  const head = 'HEAD';

  core.info(`Using most recent matching tag: ${base}`);
  core.info(`Comparing ${base}...${head}`);

  // Get commits between the base and head
  const { data: comparison } = await octokit.rest.repos.compareCommits({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base,
    head,
  });

  const commitsWithTickets: CommitWithTicket[] = [];

  // Process each commit
  for (const commit of comparison.commits) {
    const message = commit.commit.message;
    const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
    
    let ticket = null;
    if (matches) {
      // Get the first ticket ID (in case there are multiple)
      const ticketId = matches[0].replace(/[\[\]]/g, '');
      core.debug(`Found ticket ID in commit ${commit.sha}: ${ticketId}`);
      ticket = await fetchLinearTicket(linearApiKey, ticketId);
    }

    commitsWithTickets.push({
      message,
      sha: commit.sha,
      ticket
    });
  }

  core.info(`Processed ${commitsWithTickets.length} commits`);
  commitsWithTickets.forEach(commit => {
    core.info(`- ${commit.sha.substring(0, 7)}: ${commit.message}`);
    if (commit.ticket) {
      core.info(`  Linked to ticket: ${commit.ticket.id} - ${commit.ticket.title}`);
    }
  });

  return { commits: commitsWithTickets };
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
        core.setOutput('commits', JSON.stringify(result.commits));
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