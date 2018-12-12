const express = require('express');
const bodyParser = require('body-parser');
const GitHub = require('github-api');
const webhookMiddleware = require('x-hub-signature').middleware;
const keywordChecker = require('./keyword-checker');
const messageBuilder = require('./message-builder');
const utils = require('./utils');
const { logger } = require('./logger');

const app = express();
// basic auth
const gh = new GitHub({
  token: process.env.GITHUB_API_TOKEN,
});

const repo = gh.getRepo('TEAMMATES', 'teammates');

// support parsing of application/json type post data
app.use(bodyParser.json({
  verify: webhookMiddleware.extractRawBody,
}));

app.use(webhookMiddleware({
  algorithm: 'sha1',
  secret: process.env.GITHUB_WEBHOOK_PASSWORD,
  require: true,
}));

function isPullRequest(receivedJson) {
  return !!receivedJson.body.pull_request;
}

function extractRelevantDetails(receivedJson) {
  const { pull_request: pullRequest, action } = receivedJson.body;
  const { title, body } = pullRequest;
  const username = pullRequest.user.login;
  const id = pullRequest.number;
  logger.info(`Received PR #${id} "${title}" from: ${username}\nDescription: "${body}"`);
  return {
    id,
    title,
    body,
    username,
    action,
  };
}

function isPullRequestToCheck(prDetails) {
  return prDetails.action === 'opened' || prDetails.action === 'edited'
      || prDetails.action === 'reopened' || prDetails.action === 'review_requested';
}

function isValidPullRequestTitle(prTitle) {
  return utils.testRegexp(process.env.REGEX_PULL_REQ_TITLE, prTitle);
}

function isValidPullRequestBody(prBody) {
  return utils.testRegexp(process.env.REGEX_PULL_REQ_BODY, prBody);
}

function isValidPullRequest(prDetails) {
  return isValidPullRequestTitle(prDetails.title) && isValidPullRequestBody(prDetails.body);
}

function commentOnPullRequest(id, comment) {
  const issueObj = gh.getIssues('TEAMMATES', 'teammates');
  issueObj.createIssueComment(id, comment);
}

function getViolations(prDetails) {
  const violations = {};
  if (!isValidPullRequestTitle(prDetails.title)) {
    violations.title = { main: true };
    violations.title.details = keywordChecker.getDetailedTitleViolations(prDetails.title);
  }
  if (!isValidPullRequestBody(prDetails.body)) {
    violations.body = { main: true };
    violations.body.details = keywordChecker.getDetailedBodyViolations(prDetails.body);
  }
  return violations;
}

function receivePullRequest(request, response) {
  response.send();
  if (!isPullRequest(request)) {
    return;
  }
  const extractedPrDetails = extractRelevantDetails(request);
  if (isPullRequestToCheck(extractedPrDetails) && !isValidPullRequest(extractedPrDetails)) {
    const responseMessage = messageBuilder.getFeedbackMessage(
      extractedPrDetails.username,
      getViolations(extractedPrDetails),
      process.env.CONTRIBUTING_GUIDELINES,
    );
    commentOnPullRequest(extractedPrDetails.id, responseMessage);
    logger.info(`Message to user: \n"${responseMessage}"`);
  }
}

function receiveStatusResult(request, response) {
  response.send();
  const { state, sha } = request.body;
  if (state !== 'failure' || state !== 'error') {
    return;
  }

  repo.listPullRequests({ per_page: 100 }).then((resp) => {
    const prsWithMatchingSha = resp.data.filter(pr => pr.head.sha === sha);
    for (const pr of prsWithMatchingSha) {
      const feedback = `Hi @${pr.user.login}, your pull request has been marked as "${state}" due to the following reason:\n\n${request.body.description}`
          + `\n\nYou can visit [this url](${request.body.target_url}) to find out the cause of the ${state}.`;
      logger.info(`Going to comment on PR #${pr.number} because the status check fails, content:\n${feedback}`);
      // commentOnPullRequest(pr.number, feedback);
    }
  });
}

function triggerAutoMerge(request, response) {
  response.send();
  const { ref } = request.body;
  if (ref !== 'refs/heads/master') {
    // Not a push to master branch; do nothing
    return;
  }
  if (!process.env.BRANCHES_TO_UPDATE) {
    return;
  }

  const branchesToMergeTo = process.env.BRANCHES_TO_UPDATE.split(',');
  for (const branch of branchesToMergeTo) {
    logger.info(`Going to auto-merge branch master to ${branch}`);
    // request({
    //   method: 'POST',
    //   uri: 'https://api.github.com/repos/TEAMMATES/teammates/merges',
    //   json: {
    //     head: 'master',
    //     base: branch,
    //   },
    //   headers: {
    //     'User-Agent': 'teammates-bot',
    //     Authorization: `token ${process.env.GITHUB_TOKEN}`,
    //   },
    // }, (error) => {
    //   if (error) {
    //     logger.error(error);
    //   }
    // });
  }
}

app.post('/pull_req', receivePullRequest);
app.post('/status', receiveStatusResult);
app.post('/auto_merge', triggerAutoMerge);

const port = process.env.PORT || 5000;
app.set('port', port);

const svr = app.listen(port, () => {
  logger.info(`Node app is running on port ${port}`);
});

function closeApp() {
  svr.close();
}

// For unit testing purposes
module.exports = {
  getViolations,
  closeApp,
};
