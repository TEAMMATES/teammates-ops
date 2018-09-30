console.log('Welcome to TEAMMATES Release Helper!');
console.log('Make sure than you have a valid config.js file before running this script');
console.log('');

const fs = require('fs');
const shell = require('shelljs');
const moment = require('moment');
const { EOL: eol } = require('os');
const { githubUsername, teammatesDir } = require('./config');
const { getMilestoneInfo } = require('./milestone-api');

let version;
let prsInMilestone;

shell.config.silent = true;
shell.cd(teammatesDir);
console.log('Updating master branch...');
shell.exec('git reset --hard');
shell.exec('git checkout master');
shell.exec('git pull');
console.log('');

const developersJsonDir = './src/main/webapp/data/developers.json';
const allDevs = JSON.parse(fs.readFileSync(developersJsonDir, 'UTF-8'));
const usernameToNameMap = {};
const prNumberToMetadataMap = {};

allDevs.contributors.forEach((contributor) => {
    const { username } = contributor;
    if (!username) {
        return;
    }
    usernameToNameMap[username] = contributor.name || `@${username}`;
});

allDevs.committers.forEach((committer) => {
    usernameToNameMap[committer.username] = committer.name;
});

allDevs.teammembers.forEach((teammember) => {
    const { username } = teammember;
    if (!username) {
        return;
    }
    usernameToNameMap[username] = teammember.name;
});

const authors = [];
const reviewers = ['damithc'];
const releaseNotesContent = {
    Bug: [],
    Feature: [],
    DevOps: [],
    Task: [],
    Unlisted: [],
};
const allowedPrTypes = Object.keys(releaseNotesContent);

function addReleaseNoteEntries(type, displayType) {
    const entries = releaseNotesContent[type];
    if (entries && entries.length) {
        if (displayType) {
            console.log(`## ${displayType}`);
            console.log('');
        }
        entries.forEach(entry => console.log(`- ${entry}`));
        console.log('');
    }
}

function createReleaseNotes() {
    const timeToDisplay = moment(new Date()).format('MMMM Do, YYYY, hh.mma');
    console.log('');
    console.log('Release notes:');
    console.log('==================================================');
    console.log('# Release (fill this up)');
    console.log('');
    addReleaseNoteEntries('Bug', 'Bug Fixes');
    addReleaseNoteEntries('Feature', 'New Features and Enhancements');
    addReleaseNoteEntries('DevOps', 'DevOps/Build-related');
    addReleaseNoteEntries('Task', 'Other Tasks');
    console.log('==================================================');
    console.log('');
    console.log('Release announcement:');
    console.log('==================================================');
    console.log(`[${version}](https://github.com/TEAMMATES/teammates/releases/tag/${version}) has been released by @${githubUsername} at ${timeToDisplay} SGT.`);
    console.log('');
    console.log(`Code contributions from: ${authors.map(username => `@${username}`).sort().join(', ')}`);
    console.log(`Review contributions from: ${reviewers.map(username => `@${username}`).sort().join(', ')}`);
    console.log('');
    console.log('Ready for post-release check and deployment by PM (@damithc).');
    console.log('==================================================');
    console.log('');
    console.log('The following PRs are not listed in the release notes; make sure that this is a deliberate decision:');
    addReleaseNoteEntries('Unlisted');
}

function releaseAndTag() {
    console.log('Merging master to release...');
    shell.exec('git checkout release');
    shell.exec('git merge master');
    console.log(`Tagging release as ${version}...`);
    shell.exec(`git tag ${version}`);
    console.log('');
}

function listPrsAndAuthors() {
    prsInMilestone.forEach((pr) => {
        const author = pr.user.login;
        if (authors.indexOf(author) === -1) {
            authors.push(author);
        }
        pr.assignees.map(assignee => assignee.login).forEach((reviewer) => {
            if (reviewers.indexOf(reviewer) === -1) {
                reviewers.push(reviewer);
            }
        });
        let prType = 'Unlisted';
        const [cLabel] = pr.labels.filter(label => label.name.startsWith('c.'));
        if (cLabel) {
            const prTypeFromLabel = cLabel.name.replace(/^c\./, '');
            if (allowedPrTypes.indexOf(prTypeFromLabel) !== -1) {
                prType = prTypeFromLabel;
            }
        }
        prNumberToMetadataMap[pr.number] = {
            prType,
            authorName: usernameToNameMap[author] || author,
        };
    });

    const commitMsgRegex = /^[0-9a-f]{7,} \[#\d+] (.*) \(#(\d+)\)$/;
    shell.exec('git log --oneline release..HEAD').stdout.split(eol)
        .filter(commitMsg => commitMsg && commitMsg.match(commitMsgRegex))
        .forEach((commitMsg) => {
            const parts = commitMsgRegex.exec(commitMsg);
            const entry = parts[1];
            const prNumber = Number.parseInt(parts[2], 10);
            if (prNumberToMetadataMap[prNumber]) {
                const { prType, authorName } = prNumberToMetadataMap[prNumber];
                releaseNotesContent[prType].push(`[#${prNumber}] ${entry} (${authorName})`);
            }
        });
}

getMilestoneInfo((versionParam, prsInMilestoneParam) => {
    version = versionParam;
    prsInMilestone = prsInMilestoneParam;

    listPrsAndAuthors();
    releaseAndTag();
    createReleaseNotes();
});
