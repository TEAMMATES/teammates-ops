const request = require('request');
const { githubUsername, milestone } = require('./config');

if (!githubUsername || !milestone) {
  console.log('Milestone API could not proceed. Please specify a milestone and your GitHub username for authentication.');
  process.exit();
}

const prsInMilestone = [];

function createRequestObject(uri) {
  return {
    uri,
    headers: {
      'User-Agent': githubUsername,
    },
  };
}

function getMilestoneContents(version, pageNum, callback) {
  console.log('Fetching milestone contents...');

  const uri = createRequestObject('https://api.github.com/repos/TEAMMATES/teammates/issues'
      + `?milestone=${milestone}`
      + '&state=closed'
      + '&per_page=100' // default is 30, 100 is the upper limit
      + `&page=${pageNum}`);
  request(uri, (error, response, body) => {
    if (response.statusCode !== 200) {
      console.log(`Error ${response.statusCode} when connecting to GitHub API:`);
      console.log(response.statusMessage);
      process.exit();
    }

    const issuesAndPrs = JSON.parse(body);

    if (issuesAndPrs.length === 0) {
      console.log('');
      callback(version, prsInMilestone);
    } else {
      issuesAndPrs.filter(issueOrPr => issueOrPr.pull_request).forEach(pr => prsInMilestone.push(pr));
      getMilestoneContents(version, pageNum + 1, callback);
    }
  });
}

function getMilestoneInfo(callback) {
  const uri = createRequestObject(`https://api.github.com/repos/TEAMMATES/teammates/milestones/${milestone}`);
  request(uri, (error, response, body) => {
    if (response.statusCode !== 200) {
      console.log(`Error ${response.statusCode} when connecting to GitHub API:`);
      console.log(response.statusMessage);
      process.exit();
    }

    const milestoneInfo = JSON.parse(body);
    const version = milestoneInfo.title;
    console.log(`Milestone: ${version}`);
    getMilestoneContents(version, 1, callback);
  });
}

module.exports = {
  getMilestoneInfo,
};
