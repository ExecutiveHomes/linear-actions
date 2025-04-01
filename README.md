# Linear Actions

A collection of GitHub Actions for Linear integration.

## Installation

Simply reference the action in your workflow:

```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0

- name: Get Linear Commits
  id: linear_commits
  uses: ExecutiveHomes/linear-actions@v1
  with:
    action: get-linear-commits
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    since: "v1.0.0"  # Can be a tag, commit SHA, or branch name
```

The `since` parameter can be:
- A git tag (e.g., `v1.0.0`)
- A commit SHA (e.g., `abc123def456`)
- A branch name (e.g., `main`)
- A relative reference (e.g., `HEAD~10` for last 10 commits)

Example with dynamic tag:
```yaml
- name: Get Latest Tag
  id: previous_tag
  run: |
    # Get the latest tag, sorted by version
    PREVIOUS_TAG=$(git tag --sort=-v:refname | head -n1 2>/dev/null || echo "v0.0.0")
    echo "previous_tag=${PREVIOUS_TAG}" >> $GITHUB_OUTPUT

- name: Get Linear Commits
  id: linear_commits
  uses: ExecutiveHomes/linear-actions@v1
  with:
    action: get-linear-commits
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    since: ${{ steps.previous_tag.outputs.previous_tag }}
```

**Note**: This action requires access to your git history to compare commits, which is why we set `fetch-depth: 0` in the checkout step.

## Available Actions

### Get Linear Commits

Fetches commits between a specified reference point and HEAD, linking them to Linear tickets when found.

#### Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `action` | The action to run (e.g., "get-linear-commits") | Yes | - |
| `linear-api-key` | Linear API Key | Yes | - |
| `since` | Git reference point to compare commits from (can be a tag, commit SHA, branch name, or relative reference) | Yes | - |

#### Outputs

| Name | Description |
|------|-------------|
| `commits` | Array of commits with their associated Linear tickets (if found) |

Example output:
```json
{
  "commits": [
    {
      "message": "feat: implement new feature [TICKET-123]",
      "sha": "abc123...",
      "ticket": {
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
    },
    {
      "message": "chore: update dependencies",
      "sha": "def456...",
      "ticket": null
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