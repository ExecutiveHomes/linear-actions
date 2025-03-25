# Linear Actions

A collection of GitHub Actions for Linear integration.

## Installation

This package is published to GitHub Packages. To install it, you'll need to:

1. Create a Personal Access Token (PAT) with `read:packages` scope
2. Configure npm or yarn to use GitHub Packages for the `@executivehomes` scope

```bash
# Configure npm
echo "@executivehomes:registry=https://npm.pkg.github.com" >> .npmrc
echo "//npm.pkg.github.com/:_authToken=YOUR_PAT" >> .npmrc

# Or configure yarn
echo "npmScopes:
  executivehomes:
    npmRegistryServer: https://npm.pkg.github.com
    npmAuthToken: YOUR_PAT" >> .yarnrc.yml
```

Then install the package:

```bash
# Using npm
npm install @executivehomes/linear-actions

# Using yarn
yarn add @executivehomes/linear-actions
```

## Available Actions

### Get Linear Commits

Fetches Linear tickets from commits between tags matching a specified pattern.

**Important**: This action requires access to your git history to compare tags. Make sure to set `fetch-depth: 0` in your checkout step:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Get Linear Commits
  id: linear_commits
  uses: executivehomes/linear-actions@v1
  with:
    action: get-linear-commits
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    tag-pattern: "release/*"
```

#### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `action` | The action to run (e.g., "get-linear-commits") | Yes | - |
| `linear-api-key` | Linear API Key | Yes | - |
| `tag-pattern` | Tag pattern to match commits (e.g., "release/*") | Yes | - |

#### Outputs

| Name | Description |
|------|-------------|
| `tickets` | Array of Linear ticket objects with details |
| `relationships` | Array of commit-ticket relationships showing which tickets are linked to each commit |

Example output:
```json
{
  "tickets": [
    {
      "id": "TICKET-123",
      "title": "Add new feature",
      "description": "Feature description",
      "state": {
        "name": "Done"
      },
      "assignee": {
        "name": "John Doe"
      },
      "labels": {
        "nodes": [
          {
            "name": "feature"
          }
        ]
      },
      "url": "https://linear.app/org/issue/TICKET-123"
    }
  ],
  "relationships": [
    {
      "commit": {
        "message": "feat: implement new feature [TICKET-123]",
        "sha": "abc123..."
      },
      "tickets": [
        {
          "id": "TICKET-123",
          "url": "https://linear.app/org/issue/TICKET-123"
        }
      ]
    }
  ]
}
```

## Development

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Build:
   ```bash
   yarn build
   ```

3. Test:
   ```bash
   yarn test
   ```

## Contributing

This package is designed to be modular and expandable. Each action is implemented as a separate function in `src/index.ts` and can be used independently or as part of a GitHub Action workflow.

To add a new action:
1. Create a new function in `src/index.ts`
2. Export the function
3. Add a new case in the `run()` function to handle the new action
4. Update the README with documentation for the new action
5. Add tests for the new functionality