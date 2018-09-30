# TEAMMATES Release Helper

Features:
- Updates `developers.json`
- Checks that the PRs in the milestone are in sync with the list of commits obtained with `git log`
- Checks that the relevant metadata are present in the PRs of the milestone
- Generates release notes and release announcement for the milestone
- Updates `release` branch and adds the relevant tag; ready for immediate push

First time users setup:
- `npm install`
- Create `config.js` by copy-and-pasting `config.template.js` from the same directory

Usage:
- Pre-requisites:
  - Your `master` branch tracks main repo's `master` branch
- Steps:
  1. Modify `config.js` with relevant values
  1. `node pre-release`
  1. Create and merge the Release PR
  1. `node release`

Development:
- Make sure `eslint *.js` does not give any violation
