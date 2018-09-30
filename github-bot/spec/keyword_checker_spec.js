// eslint-disable-next-line camelcase
const keyword_checker = require('../keyword_checker.js');

describe('keyword_checker', () => {
  it('should feedback when title string contains space between # and digit', () => {
    const violations = keyword_checker.getDetailedTitleViolations('Fix # 27');
    const expectedViolations = { spaceBetweenHashtagAndDigit: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when title string is missing issue reference', () => {
    const violations = keyword_checker.getDetailedTitleViolations('Fixed something');
    const expectedViolations = { noIssueReference: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string contains space between # and digit', () => {
    const violations = keyword_checker.getDetailedBodyViolations('Fixed # 27');
    const expectedViolations = { spaceBetweenHashtagAndDigit: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string is missing issue reference', () => {
    const violations = keyword_checker.getDetailedBodyViolations('Fixed something');
    const expectedViolations = { noIssueReference: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback when body string does not contain GitHub keyword', () => {
    const violations = keyword_checker.getDetailedBodyViolations('Repaired #123');
    const expectedViolations = { missingGithubKeyword: true };
    expect(violations).toEqual(expectedViolations);
  });

  it('should feedback both issue and keyword issues in body string', () => {
    const violations = keyword_checker.getDetailedBodyViolations('Repaired # 1');
    const expectedViolations = {
      missingGithubKeyword: true,
      spaceBetweenHashtagAndDigit: true,
    };
    expect(violations).toEqual(expectedViolations);
  });
});
