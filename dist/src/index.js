"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLinearCommits = getLinearCommits;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const fetchLinearTicket_1 = require("./fetchLinearTicket");
const pre_1 = require("./pre");
const post_1 = require("./post");
async function getLinearCommits(linearApiKey, tagPattern) {
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
        return { commits: [] };
    }
    // Always compare most recent tag against HEAD
    const base = matchingTags[0].name;
    const head = 'HEAD';
    core.info(`Comparing ${base}...${head}`);
    // Get commits between the base and head
    const { data: comparison } = await octokit.rest.repos.compareCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        base,
        head,
    });
    const commitsWithTickets = [];
    // Process each commit
    for (const commit of comparison.commits) {
        const message = commit.commit.message;
        const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
        let ticket = null;
        if (matches) {
            // Get the first ticket ID (in case there are multiple)
            const ticketId = matches[0].replace(/[\[\]]/g, '');
            core.debug(`Found ticket ID in commit ${commit.sha}: ${ticketId}`);
            ticket = await (0, fetchLinearTicket_1.fetchLinearTicket)(linearApiKey, ticketId);
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
async function run() {
    try {
        await (0, pre_1.pre)();
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
        await (0, post_1.post)();
    }
    catch (error) {
        core.setFailed(`Action failed: ${error.message}`);
    }
}
run();
