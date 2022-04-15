# TEAMMATES GitHub Bot

TEAMMATES GitHub Bot is used to automate some interactions in GitHub (currently limited to PRs). Current features include:
1. Check PR titles
1. Check PR descriptions
1. Comment on non-conforming PRs

The bot runs under the [@teammates-bot](https://github.com/teammates-bot) account.

## Deployment

This bot is deployed on Heroku.

Deployment config:
- `GITHUB_API_TOKEN` : The bot's GitHub API access token; known only to maintainers
- `CONTRIBUTING_GUIDELINES`: [TEAMMATES contributing guidelines](https://teammates.github.io/teammates/contributing-doc.html)
- `REGEX_PULL_REQ_TITLE`: Regex to validate the PR title
- `REGEX_PULL_REQ_BODY`: Regex to validate the PR description

## Credits

This project is adapted from [the `oss-bot-js` project](https://github.com/samsontmr/oss-bot-js).
