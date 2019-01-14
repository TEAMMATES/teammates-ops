const request = require('request');
const { githubUsername, githubPassword } = require('./config');

if (!githubUsername || !githubPassword) {
  console.log('User API could not proceed. Please specify your GitHub username & password for authentication.');
  process.exit();
}

function createRequestObject(uri) {
  return {
    uri,
    headers: {
      'User-Agent': githubUsername,
      Authorization: `Basic ${Buffer.from(`${githubUsername}:${githubPassword}`).toString('base64')}`,
    },
  };
}

function getDisplayNameOfUser(username, callback) {
  const uri = createRequestObject(`https://api.github.com/users/${username}`);
  request(uri, (error, response, body) => {
    if (response.statusCode !== 200) {
      console.log(`Error ${response.statusCode} when getting displayed name of user ${username}:`);
      console.log(response.statusMessage);
      return callback(undefined);
    }

    const userInfo = JSON.parse(body);
    return callback(userInfo.name);
  });
}

module.exports = {
  getDisplayNameOfUser,
};
