const winston = require('winston');

const messages = {
  prTitle: 'PR Title',
  prBody: 'PR Description',
  spaceBetweenHashtagAndDigit: 'PR contains a space between the hashtag and digit.',
  noIssueReference: 'Issue Reference (`#<issue-number>`) missing.',
  missingGithubKeyword: 'Should contain GitHub keyword to auto-close issue it fixes: Refer [here](https://help.github.com/articles/closing-issues-via-commit-messages/#keywords-for-closing-issues) for a list of accepted keywords.',
};

function isKeywordCheckerEnabled() {
  return process.env.ENABLE_KEYWORD_CHECKER !== undefined &&
    process.env.ENABLE_KEYWORD_CHECKER.toLowerCase() === 'true';
}

/*
* Formats message as a GFMD level two unordered list item
*/
function getFormattedMessageLevelTwoUnordered(message) {
  return `   * ${message}\n`;
}

/*
* Formats message as a GFMD level two unordered list item
*/
function getFormattedMessageLevelOneOrdered(message) {
  return `1. ${message}\n`;
}

function buildTitleFeedback(violations) {
  winston.info(`Title Violations: ${JSON.stringify(violations)}`);
  let message = '';
  if (violations === undefined) winston.error('violations is undefined');
  if (Object.keys(violations).length === 0) {
    winston.info('No title violations');
    return message;
  }
  if (violations.main === true) {
    message += getFormattedMessageLevelOneOrdered(messages.prTitle);
    if (isKeywordCheckerEnabled()) {
      Object.keys(violations.details).forEach((key) => {
        message += getFormattedMessageLevelTwoUnordered(messages[key]);
      });
    }
  }
  return message;
}

function buildDescriptionFeedback(violations) {
  let message = '';
  if (violations === undefined) winston.error('violations is undefined');
  if (Object.keys(violations).length === 0) {
    winston.info('No description violations');
    return message;
  }
  if (violations.main === true) {
    message += getFormattedMessageLevelOneOrdered(messages.prBody);
    if (isKeywordCheckerEnabled()) {
      Object.keys(violations.details).forEach((key) => {
        message += getFormattedMessageLevelTwoUnordered(messages[key]);
      });
    }
  }
  return message;
}

module.exports = {
  getFormattedMessageLevelOneOrdered,
  getFormattedMessageLevelTwoUnordered,
  messages,
  /*
  * Returns a string containing the formatted feedback message
  */
  getFeedbackMessage(username, violations) {
    const feedback = `Hi @${username}, these parts of your pull request do not appear to follow our [contributing guidelines](${process.env.CONTRIBUTING_GUIDELINES}):\n\n`;

    return feedback +
      buildTitleFeedback(violations.title || {}) +
      buildDescriptionFeedback(violations.body || {});
  },
};
