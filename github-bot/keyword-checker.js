const utils = require('./utils');

/**
 * Returns true if argument contains an issue reference, false otherwise
 */
function containsIssueReference(string) {
  return utils.testRegexp('#\\d', string);
}

/**
 * Returns true if argument contains a space between a # and a digit, false otherwise
 */
function containsSpaceBetweenHashtagAndDigit(string) {
  return utils.testRegexp('# \\d', string);
}

/**
 * Returns true if argument contains one of GitHub keywords:
 * Fix, Fixes, Fixed, Close, Closes, Closed, Resolve, Resolves, Resolved,
 * and their lowercase equivalents, false otherwise
 */
function containsGithubKeyword(string) {
  const fixRegexPattern = '([F|f]ix(e[d|s])?)';
  const closeRegexPattern = '([C|c]lose[d|s]?)';
  const resolveRegexPattern = '([R|r]esolve[d|s]?)';
  return utils.testRegexp(`(${fixRegexPattern}|${closeRegexPattern}|${resolveRegexPattern}) +#`,
    string);
}

module.exports = {
  /**
   * Scans input string for convention violations and returns violations detected.
   */
  getDetailedTitleViolations(string) {
    const violations = {};

    if (containsSpaceBetweenHashtagAndDigit(string)) {
      violations.spaceBetweenHashtagAndDigit = true;
    } else if (!containsIssueReference(string)) {
      violations.noIssueReference = true;
    }

    return violations;
  },
  /**
   * Scans input string for convention violations and returns violations detected.
   */
  getDetailedBodyViolations(string) {
    const violations = {};

    if (containsSpaceBetweenHashtagAndDigit(string)) {
      violations.spaceBetweenHashtagAndDigit = true;
    } else if (!containsIssueReference(string)) {
      violations.noIssueReference = true;
    }

    if (!containsGithubKeyword(string)) {
      violations.missingGithubKeyword = true;
    }

    return violations;
  },
};
