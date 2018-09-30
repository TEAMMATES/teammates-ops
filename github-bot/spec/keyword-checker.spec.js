const keywordChecker = require('../keyword-checker');

describe('keywordChecker', () => {
  it('should feedback when title string contains space between # and digit', () => {
    const violations = keywordChecker.getDetailedTitleViolations('Fix # 27');
    const expectedViolations = { spaceBetweenHashtagAndDigit: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when title string is missing issue reference', () => {
    const violations = keywordChecker.getDetailedTitleViolations('Fixed something');
    const expectedViolations = { noIssueReference: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string contains space between # and digit', () => {
    const violations = keywordChecker.getDetailedBodyViolations('Fixed # 27');
    const expectedViolations = { spaceBetweenHashtagAndDigit: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string is missing issue reference', () => {
    const violations = keywordChecker.getDetailedBodyViolations('Fixed something');
    const expectedViolations = { noIssueReference: true, missingGithubKeyword: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string does not contain GitHub keyword', () => {
    const violations = keywordChecker.getDetailedBodyViolations('Repaired #123');
    const expectedViolations = { missingGithubKeyword: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback both issue and keyword issues in body string', () => {
    const violations = keywordChecker.getDetailedBodyViolations('Repaired # 1');
    const expectedViolations = {
      missingGithubKeyword: true,
      spaceBetweenHashtagAndDigit: true,
    };
    expect(violations).toEqual(expectedViolations);
  });
});
