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
const getLinearTickets_1 = require("./getLinearTickets");
const pre_1 = require("./pre");
const post_1 = require("./post");
async function getLinearCommits(linearApiKey, tagPattern) {
    const githubToken = process.env.GITHUB_TOKEN;
    if (!githubToken) {
        throw new Error('GITHUB_TOKEN environment variable is required');
    }
    const octokit = github.getOctokit(githubToken);
    // List all tags
    const { data: tags } = await octokit.rest.repos.listTags({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
    });
    // Filter tags matching the pattern
    const matchingTags = tags.filter(tag => {
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
    const commitMessages = commits.commits.map(commit => commit.commit.message);
    // Get Linear tickets from commit messages
    return (0, getLinearTickets_1.getLinearTickets)(commitMessages, linearApiKey);
}
async function run() {
    try {
        await (0, pre_1.pre)();
        const action = core.getInput('action', { required: true });
        const linearApiKey = core.getInput('linear-api-key', { required: true });
        switch (action) {
            case 'get-linear-commits': {
                const tagPattern = core.getInput('tag-pattern', { required: true });
                const tickets = await getLinearCommits(linearApiKey, tagPattern);
                core.setOutput('tickets', JSON.stringify(tickets));
                break;
            }
            // Add more cases here for future actions
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
