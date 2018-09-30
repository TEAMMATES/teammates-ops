const express = require('express');
const bodyParser = require('body-parser');
const GitHub = require('github-api');
const winston = require('winston');
const keywordChecker = require('./keyword-checker');
const messageBuilder = require('./message-builder');
const utils = require('./utils');

const app = express();
// basic auth
const gh = new GitHub({
  token: process.env.GITHUB_API_TOKEN,
});

// support parsing of application/json type post data
app.use(bodyParser.json());

function isPullRequest(receivedJson) {
  return !!receivedJson.body.pull_request;
}

function extractRelevantDetails(receivedJson) {
  const { pull_request: pullRequest, action } = receivedJson.body;
  const { title, body } = pullRequest;
  const repo = pullRequest.base.repo.full_name;
  const username = pullRequest.user.login;
  const id = pullRequest.number;
  winston.info(`Received PR #${id} "${title}" from: ${username}\nDescription: "${body}"`);
  return {
    repo,
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

function commentOnPullRequest(repo, id, comment) {
  const repoNameSplit = repo.split('/');
  const issueObj = gh.getIssues(repoNameSplit[0], repoNameSplit[1]);
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
    commentOnPullRequest(extractedPrDetails.repo, extractedPrDetails.id, responseMessage);
    winston.info(`Message to user: \n"${responseMessage}"`);
  }
}

app.post('/pull_req', receivePullRequest);

const port = process.env.PORT || 5000;
app.set('port', port);
app.listen(port, () => {
  winston.info(`Node app is running on port ${port}`);
});

// For unit testing purposes
module.exports = {
  getViolations,
};
