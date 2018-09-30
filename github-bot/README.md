# About

oss-bot-js is a bot for managing PR reviews on OSS GitHub repositories. 

Are you maintaining an OSS project and want contributors to follow certain conventions for pull requests? oss-bot saves you valuable time by automating convention checks, reminding contributors when they (unwittingly) violate your project's conventions.

oss-bot-js is the Node.js version of [oss-bot](https://github.com/samsontmr/oss-bot).

# Features
oss-bot can currently:

1. Check PR titles
1. Check PR descriptions
1. Comment on non-conforming PRs

# Setting up

* You will need a Heroku account for this.

### Set up your own bot server & account

> Cheat: If your project follows [these conventions](https://github.com/oss-generic/process/blob/master/docs/FormatsAndConventions.md), skip to the next section and simply set your GitHub webhook to `https://oss-bot-js.herokuapp.com/pull_req`. This bot also enforces the convention that the PR description contains `<GitHub-keyword> #<issue-number>`.

1. Fork/clone this repository.
1. Create a new GitHub user account for your bot, e.g. `teammates-bot`.
1. Create an API access token in this new GitHub account under `Settings -> Personal access tokens`.
1. Create a new Heroku app.
1. In the Heroku app settings, click `Reveal Config Vars`. Add the following keys: 
```
    GITHUB_API_TOKEN : Your bot's GitHub API access token
    CONTRIBUTING_GUIDELINES : Your project's contributing guidelines
    REGEX_PULL_REQ_TITLE : Javascript regex to validate the PR title
    REGEX_PULL_REQ_BODY : Javascript regex to validate the PR description
    ENABLE_KEYWORD_CHECKER (optional variable) : Set value to `TRUE` to enable GitHub keyword checking 
```
1. Deploy the bot to Heroku.

### Set up a GitHub Webhook

1. Go the `Settings -> Webhooks` in your GitHub repo.
1. Add webhook.
1. Set your `payload URL` to `https://<appname>.herokuapp.com/pull_req`.
1. Set `content type` to `application/json`.
1. Choose `Let me select individual events -> Pull request`.
1. Add Webhook.

# Contributing
oss-bot-js welcomes contributors! If you have a feature to suggest or would like to contribute code/tests, please create a new issue in the issue tracker!
