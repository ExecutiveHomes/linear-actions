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
const exec = __importStar(require("@actions/exec"));
const fetchLinearTicket_1 = require("./fetchLinearTicket");
const pre_1 = require("./pre");
const post_1 = require("./post");
async function getLinearCommits(linearApiKey, tagPattern) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        throw new Error('GITHUB_TOKEN environment variable is required when running in GitHub Actions');
    }
    const octokit = github.getOctokit(githubToken);
    // Get tags sorted by creation date using git command
    let tagsOutput = '';
    await exec.exec('git', ['for-each-ref', '--sort=-creatordate', 'refs/tags/', '--format=%(refname:short)'], {
        listeners: {
            stdout: (data) => {
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
            stdout: (data) => {
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
    const commitsWithTickets = [];
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
        core.info(`Processing commit pair ${i / 2 + 1}:`);
        core.info(`  SHA: ${sha}`);
        core.info(`  Message: ${message}`);
        const matches = message.match(/(?:\[)?([A-Z]+-\d+)(?:\])?/g);
        let ticket = null;
        if (matches) {
            // Get the first ticket ID (in case there are multiple)
            const ticketId = matches[0].replace(/[\[\]]/g, '');
            core.debug(`Found ticket ID in commit ${sha}: ${ticketId}`);
            ticket = await (0, fetchLinearTicket_1.fetchLinearTicket)(linearApiKey, ticketId);
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
