const messageBuilder = require('../messageBuilder.js');

const username = 'tester';

describe('messageBuilder', () => {
  beforeEach(() => {
    process.env.CONTRIBUTING_GUIDELINES = 'test';
    process.env.ENABLE_KEYWORD_CHECKER = 'true';
  });
  it('should contain feedback for all possible violations', () => {
    const violations = {
      title: {
        main: true,
        details: {
          spaceBetweenHashtagAndDigit: true,
          noIssueReference: true,
        },
      },
      body: {
        main: true,
        details: {
          spaceBetweenHashtagAndDigit: true,
          noIssueReference: true,
          missingGithubKeyword: true,
        },
      },
    };
    const feedback = messageBuilder.getFeedbackMessage(username, violations);
    const expectedMessage = `Hi @${username}, these parts of your pull request do not appear to follow our [contributing guidelines](${process.env.CONTRIBUTING_GUIDELINES}):\n\n${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prTitle)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.spaceBetweenHashtagAndDigit)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.noIssueReference)}${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prBody)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.spaceBetweenHashtagAndDigit)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.noIssueReference)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.missingGithubKeyword)}`;
    expect(feedback).toEqual(expectedMessage);
  });
  it('should contain feedback for only main violations', () => {
    process.env.ENABLE_KEYWORD_CHECKER = 'false';
    const violations = {
      title: {
        main: true,
        details: {
          spaceBetweenHashtagAndDigit: true,
          noIssueReference: true,
        },
      },
      body: {
        main: true,
      },
    };
    const feedback = messageBuilder.getFeedbackMessage(username, violations);
    const expectedMessage = `Hi @${username}, these parts of your pull request do not appear to follow our [contributing guidelines](${process.env.CONTRIBUTING_GUIDELINES}):\n\n${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prTitle)}${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prBody)}`;
    expect(feedback).toEqual(expectedMessage);
  });
  it('should contain feedback for only title violations', () => {
    const violations = {
      title: {
        main: true,
        details: {
          spaceBetweenHashtagAndDigit: true,
          noIssueReference: true,
        },
      },
    };
    const feedback = messageBuilder.getFeedbackMessage(username, violations);
    const expectedMessage = `Hi @${username}, these parts of your pull request do not appear to follow our [contributing guidelines](${process.env.CONTRIBUTING_GUIDELINES}):\n\n${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prTitle)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.spaceBetweenHashtagAndDigit)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.noIssueReference)}`;
    expect(feedback).toEqual(expectedMessage);
  });
  it('should contain feedback for only description violations', () => {
    const violations = {
      body: {
        main: true,
        details: {
          spaceBetweenHashtagAndDigit: true,
          noIssueReference: true,
          missingGithubKeyword: true,
        },
      },
    };
    const feedback = messageBuilder.getFeedbackMessage(username, violations);
    const expectedMessage = `Hi @${username}, these parts of your pull request do not appear to follow our [contributing guidelines](${process.env.CONTRIBUTING_GUIDELINES}):\n\n${messageBuilder.getFormattedMessageLevelOneOrdered(messageBuilder.messages.prBody)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.spaceBetweenHashtagAndDigit)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.noIssueReference)}${messageBuilder.getFormattedMessageLevelTwoUnordered(messageBuilder.messages.missingGithubKeyword)}`;
    expect(feedback).toEqual(expectedMessage);
  });
});
