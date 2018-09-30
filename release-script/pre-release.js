console.log('Welcome to TEAMMATES Release Helper!');
console.log('Make sure than you have a valid config.js file before running this script');
console.log('');

const fs = require('fs');
const shell = require('shelljs');
const rl = require('readline-sync');
const { EOL: eol } = require('os');
const { teammatesDir } = require('./config');
const { getMilestoneInfo } = require('./milestone-api');

const developersJsonDir = './src/main/webapp/data/developers.json';

let prsInMilestone;
let needUpdate = false;

shell.config.silent = true;
shell.cd(teammatesDir);
console.log('Updating master branch...');
shell.exec('git reset --hard');
shell.exec('git checkout master');
shell.exec('git pull');
console.log('');

let allDevs = JSON.parse(fs.readFileSync(developersJsonDir, 'UTF-8'));
const usernames = [];
const singleContributors = {};
const newContributors = [];

allDevs.contributors.forEach((contributor) => {
    const { username, multiple } = contributor;
    if (!username) {
        return;
    }
    if (!multiple) {
        singleContributors[username] = true;
    }
    usernames.push(username);
});

allDevs.committers.forEach((committer) => {
    usernames.push(committer.username);
});

allDevs.teammembers.forEach((teammember) => {
    const { username } = teammember;
    if (!username) {
        return;
    }
    usernames.push(username);
});

function checkUsername(username) {
    if (usernames.indexOf(username) === -1) {
        newContributors.push(username);
        usernames.push(username);
        singleContributors[username] = true;
    } else if (singleContributors[username]) {
        needUpdate = true;
        singleContributors[username] = false;
    }
}

function updateDevelopersJson() {
    Object.keys(singleContributors)
        .filter(username => !singleContributors[username])
        .forEach(username => allDevs.contributors
            .filter(obj => obj.username === username)
            .forEach((obj) => {
                const { name: n, username: un } = obj;
                delete obj.name;
                delete obj.username;
                obj.multiple = true;
                obj.name = n;
                obj.username = un;
            }));

    fs.writeFile(developersJsonDir, JSON.stringify(allDevs, null, 2) + eol, 'UTF-8', () => {});
    console.log('developers.json has been updated.');
}

function matchPrs() {
    const commitMsgRegex = /^[0-9a-f]{7,} \[#\d+] (.*) \(#(\d+)\)$/;
    const gitCommits = shell.exec('git log --oneline release..HEAD').stdout.split(eol)
        .filter((commitMsg) => {
            if (!commitMsg) {
                return false;
            }
            if (!commitMsg.match(commitMsgRegex)) {
                console.log(`Commit message "${commitMsg}" is not in expected format.`);
                return false;
            }
            return true;
        });
    const prNumbersInMilestone = prsInMilestone.map(pr => pr.number);
    const prNumbersInGitCommits = gitCommits.map(commitMsg => parseInt(commitMsgRegex.exec(commitMsg)[2], 10));

    console.log('');
    prNumbersInMilestone.forEach((pr) => {
        if (prNumbersInGitCommits.indexOf(pr) === -1) {
            console.log(`PR #${pr} is not included in the list of git commits. You likely have included this PR in the milestone by mistake.`);
        }
    });
    prNumbersInGitCommits.forEach((pr) => {
        if (prNumbersInMilestone.indexOf(pr) === -1) {
            console.log(`PR #${pr} is not included in the milestone. You likely have not yet included this PR in the milestone.`);
        }
    });
    console.log('');
}

function checkPrMetadata() {
    prsInMilestone.forEach((pr) => {
        const prNumber = pr.number;

        // Check for labels: one c.* label, s.ToMerge, and nothing else
        const labels = pr.labels.map(label => label.name);
        if (!labels.indexOf('s.ToMerge' === -1)) {
            console.log(`PR #${prNumber} is not labelled with s.ToMerge.`);
        }
        let hasCLabel = false;
        labels.forEach((label) => {
            if (label.startsWith('c.')) {
                if (hasCLabel) {
                    console.log(`PR #${prNumber} has multiple c.* labels.`);
                }
                hasCLabel = true;
            } else if (label !== 's.ToMerge' && !label.startsWith('e.')) {
                console.log(`PR #${prNumber} is labelled with ${label} which is not expected.`);
            }
        });
        if (!hasCLabel) {
            console.log(`PR #${prNumber} is not labelled with a c.* label.`);
        }

        if (!pr.assignees.length) {
            console.log(`PR #${prNumber} is not tagged with assignee(s).`);
        }
    });
}

function checkAndUpdateDevelopersJson() {
    prsInMilestone.forEach(pr => checkUsername(pr.user.login));
    if (newContributors.length) {
        Object.keys(newContributors).forEach(i => allDevs.contributors.push({ name: '', username: newContributors[i] }));
        fs.writeFile(developersJsonDir, JSON.stringify(allDevs, null, 2) + eol, 'UTF-8', () => {
            function capitalize(str) {
                return str.charAt(0).toUpperCase() + str.slice(1);
            }

            console.log('The execution is now paused and the username of new contributors have been temporarily added.');
            console.log('Enter the real names of the new contributors manually, then press enter on the console to continue.');
            rl.question();

            allDevs = JSON.parse(fs.readFileSync(developersJsonDir, 'UTF-8'));
            allDevs.contributors.sort((a, b) => {
                const aName = a.name || capitalize(a.username);
                const bName = b.name || capitalize(b.username);
                return aName > bName ? 1 : -1;
            });

            updateDevelopersJson();
        });
    } else if (needUpdate) {
        updateDevelopersJson();
    } else {
        console.log('developers.json is up-to-date.');
    }
}

getMilestoneInfo((version, prsInMilestoneParam) => {
    prsInMilestone = prsInMilestoneParam;

    matchPrs();
    checkPrMetadata();
    checkAndUpdateDevelopersJson();
});
