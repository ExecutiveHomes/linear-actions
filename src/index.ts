import * as core from '@actions/core';
import * as github from '@actions/github';
import * as exec from '@actions/exec';
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

  // Get tags sorted by creation date using git command
  let tagsOutput = '';
  await exec.exec('git', ['for-each-ref', '--sort=-creatordate', 'refs/tags/', '--format=%(refname:short)'], {
    listeners: {
      stdout: (data: Buffer) => {
        tagsOutput += data.toString();
      }
    }
  });

  // Parse the tags output
  const tags = tagsOutput.trim().split('\n');
  
  core.info(`Found ${tags.length} total tags`);
  core.info('All tags (in chronological order, newest first):');
  tags.forEach(tag => {
    core.info(`- ${tag}`);
  });

  // Find the first tag that matches our pattern
  const pattern = new RegExp(tagPattern.replace('*', '.*'));
  const latestMatchingTag = tags.find(tag => {
    const matches = pattern.test(tag);
    core.info(`Tag ${tag} ${matches ? 'matches' : 'does not match'} pattern ${tagPattern}`);
    return matches;
  });

  if (!latestMatchingTag) {
    core.info('No matching tags found');
    return { commits: [] };
  }

  const base = latestMatchingTag;
  const head = 'HEAD';

  core.info(`Using most recent matching tag: ${base}`);
  core.info(`Comparing ${base}...${head}`);

  // Get commits between the base and head using git command
  let commitsOutput = '';
  await exec.exec('git', ['log', '--format=%H%n%s', `${base}..${head}`], {
    listeners: {
      stdout: (data: Buffer) => {
        commitsOutput += data.toString();
      }
    }
  });

  // Debug raw output
  core.info('Raw commits output:');
  core.info('---START---');
  core.info(commitsOutput);
  core.info('---END---');
  core.info(`Raw output length: ${commitsOutput.length}`);

  const commitsWithTickets: CommitWithTicket[] = [];
  
  // Process the commits output
  const commitLines = commitsOutput.trim().split('\n');
  core.info(`Number of lines after split: ${commitLines.length}`);
  core.info('Lines after split:');
  commitLines.forEach((line, i) => {
    core.info(`Line ${i}: "${line}"`);
  });

  for (let i = 0; i < commitLines.length; i += 2) {
    const sha = commitLines[i];
    const message = commitLines[i + 1];
    
    core.info(`Processing commit pair ${i/2 + 1}:`);
    core.info(`  SHA: ${sha}`);
    core.info(`  Message: ${message}`);
    
    const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
    
    let ticket = null;
    if (matches) {
      // Get the first ticket ID (in case there are multiple)
      const ticketId = matches[0].replace(/[\[\]]/g, '');
      core.debug(`Found ticket ID in commit ${sha}: ${ticketId}`);
      ticket = await fetchLinearTicket(linearApiKey, ticketId);
    }

    commitsWithTickets.push({
      message,
      sha,
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

  // Reverse the array to get commits in chronological order (oldest first)
  return { commits: commitsWithTickets.reverse() };
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