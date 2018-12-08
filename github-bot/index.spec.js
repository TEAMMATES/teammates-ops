const index = require('./index');

describe('index', () => {
  describe('getViolations', () => {
    beforeEach(() => {
      process.env.REGEX_PULL_REQ_TITLE = '.*';
      process.env.REGEX_PULL_REQ_BODY = '.*';
      process.env.CONTRIBUTING_GUIDELINES = 'test';
    });

    it('should return empty violations object when regex passes', () => {
      process.env.REGEX_PULL_REQ_TITLE = '.*';
      process.env.REGEX_PULL_REQ_BODY = '.*';
      const pullRequest = {
        username: 'JohnDoe',
        title: 'A title',
        body: 'A body',
      };
      const violations = index.getViolations(pullRequest);
      const expectedViolations = {};
      expect(violations).toEqual(expectedViolations);
    });

    it('should return title violation when PR title does not match regex', () => {
      process.env.REGEX_PULL_REQ_TITLE = '#';
      const pullRequest = {
        username: 'JohnDoe',
        title: 'A title',
        body: 'A body',
      };
      const violations = index.getViolations(pullRequest);
      const expectedViolations = {
        title: {
          main: true,
          details: {
            noIssueReference: true,
          },
        },
      };
      expect(violations).toEqual(expectedViolations);
    });

    it('should return body violation when PR description does not match regex', () => {
      process.env.REGEX_PULL_REQ_BODY = '#';
      const pullRequest = {
        username: 'JohnDoe',
        title: 'A title',
        body: 'A body',
      };
      const violations = index.getViolations(pullRequest);
      const expectedViolations = {
        body: {
          main: true,
          details: {
            noIssueReference: true,
            missingGithubKeyword: true,
          },
        },
      };
      expect(violations).toEqual(expectedViolations);
    });

    it('should return all violations when PR title and description do not match regex', () => {
      process.env.REGEX_PULL_REQ_BODY = '#';
      process.env.REGEX_PULL_REQ_TITLE = '#';
      const pullRequest = {
        username: 'JohnDoe',
        title: 'A title',
        body: 'A body',
      };
      const violations = index.getViolations(pullRequest);
      const expectedViolations = {
        title: {
          main: true,
          details: {
            noIssueReference: true,
          },
        },
        body: {
          main: true,
          details: {
            noIssueReference: true,
            missingGithubKeyword: true,
          },
        },
      };
      expect(violations).toEqual(expectedViolations);
    });

    afterAll(() => {
      index.closeApp();
    });
  });
});
