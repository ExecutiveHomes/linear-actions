# Get Linear Tickets GitHub Action

This GitHub Action fetches Linear tickets from commits between tags matching a specified pattern.

## Usage

```yaml
- name: Get Linear Tickets
  id: linear_tickets
  uses: executivehomes/get-linear-tickets@v1
  with:
    linear-api-key: ${{ secrets.LINEAR_API_KEY }}
    tag-pattern: "release/*"
```

## Inputs

| Name | Description | Required | Default |
|------|-------------|----------|---------|
| `linear-api-key` | Linear API Key | Yes | - |
| `tag-pattern` | Tag pattern to match commits (e.g., "release/*") | Yes | - |

## Outputs

| Name | Description |
|------|-------------|
| `tickets` | Array of objects containing commit messages and Linear ticket links |

Example output:
```json
[
  {
    "message": "feat: Add new feature (TICKET-123)",
    "ticket": "https://linear.app/org/issue/TICKET-123"
  }
]
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