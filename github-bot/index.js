const express = require('express');
const bodyParser = require('body-parser');
const GitHub = require('github-api');
const keywordChecker = require('./keyword_checker');
const messageBuilder = require('./messageBuilder');
const utils = require('./utils');
const winston = require('winston');

const app = express();
// basic auth
const gh = new GitHub({
  token: process.env.GITHUB_API_TOKEN,
});

// support parsing of application/json type post data
app.use(bodyParser.json());

function isPullRequest(receivedJson) {
  winston.info(`Pull Request field: {${receivedJson.body.pull_request}}`);
  return !!receivedJson.body.pull_request;
}

function extractRelevantDetails(receivedJson) {
  const { pull_request: pullRequest, action } = receivedJson.body;
  const title = pullRequest.title;
  const body = pullRequest.body;
  const repo = pullRequest.base.repo.full_name;
  const username = pullRequest.user.login;
  const id = pullRequest.number;
  winston.info(`Received PR ${id} "${title}" from: ${username}\nDescription: "${body}"`);
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
  return prDetails.action === 'opened' || prDetails.action === 'edited' ||
    prDetails.action === 'reopened' || prDetails.action === 'review_requested';
}

function isValidPullRequestTitle(prTitle) {
  winston.info(`Title being validated: ${prTitle}`);
  winston.info(`Regex for title: ${process.env.REGEX_PULL_REQ_TITLE}`);
  return utils.testRegexp(process.env.REGEX_PULL_REQ_TITLE, prTitle);
}

function isValidPullRequestBody(prBody) {
  winston.info(`Regex for body: ${process.env.REGEX_PULL_REQ_BODY}`);
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
    if (process.env.ENABLE_KEYWORD_CHECKER !== undefined &&
      process.env.ENABLE_KEYWORD_CHECKER.toLowerCase() === 'true') {
      violations.title.details = keywordChecker.getDetailedTitleViolations(prDetails.title);
    }
  }
  if (!isValidPullRequestBody(prDetails.body)) {
    violations.body = { main: true };
    if (process.env.ENABLE_KEYWORD_CHECKER !== undefined &&
      process.env.ENABLE_KEYWORD_CHECKER.toLowerCase() === 'true') {
      violations.body.details = keywordChecker.getDetailedBodyViolations(prDetails.body);
    }
  }
  return violations;
}

function receivePullRequest(request, response) {
  winston.info(`Received pull request: \n${request.body}`);
  response.send();
  if (!isPullRequest(request)) return;
  const extractedPrDetails = extractRelevantDetails(request);
  if (isPullRequestToCheck(extractedPrDetails) && !isValidPullRequest(extractedPrDetails)) {
    winston.info('Check Failed!');
    const responseMessage = messageBuilder.getFeedbackMessage(
      extractedPrDetails.username,
      getViolations(extractedPrDetails));
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
