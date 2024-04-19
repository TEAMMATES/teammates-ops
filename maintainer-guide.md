# Maintainer Guide

This document details the tasks that need to be done by core team (afterwards "team") members (project maintainers) in order to keep the project moving.

It is assumed that the team members are familiar with the [development workflow](https://teammates.github.io/teammates/process.html), [individual development process](https://teammates.github.io/teammates/development.html), and the terms used in the project as listed in those documents, [project glossary](https://teammates.github.io/teammates/glossary.html), [issue labels](https://teammates.github.io/teammates/issues.html), and beyond.

* Issue tracker management
  * [Triaging an issue](#triaging-an-issue)
  * [Closing an issue](#closing-an-issue)
* PR management
  * [Choosing a reviewer](#choosing-a-reviewer)
  * [Closing a PR](#closing-a-pr)
  * [Reverting a PR](#reverting-a-pr)
* Release management
  * [Making a release](#making-a-release)
  * [Making a hot patch](#making-a-hot-patch)
* Other tasks
  * [Security vulnerabilities](#security-vulnerabilities)
  * [Data migration](#data-migration)
  * [Dependencies update](#dependencies-update)
  * [Timezone database update](#timezone-database-update)
  * [Branch management](#branch-management)
    * [Using a long-lived feature branch](#using-a-long-lived-feature-branch)
  * [Community membership](#community-membership)
  * [Beginner-level issues](#beginner-level-issues)

## Issue tracker management

### Triaging an issue

A new issue needs to be triaged by a team member. Here is the process:

1. Is the issue a duplicate of an existing issue?
   * Yes: close the issue and add a reference to the original issue (which the new issue is a duplicate of). Alternatively, close the older issue and add a reference to the newly opened issue.
   * No: continue to the next step.
1. Does the issue provide enough information?
   * Yes: continue to the next step.
   * No: add the `s.NeedsInfo` label and request the issue reporter to provide more information. Additionally, if the issue does not follow the given templates (which is likely the case if the information is lacking), encourage the issue reporter to make use of an appropriate template. There is no need to comment any further until the issue reporter provides more details.
1. Is the issue valid? (e.g. if it is a bug report, is it reproducible? If it is a feature/enhancement request, is the requested feature/enhancement absent?)
   * Yes: continue to the next step.
   * No: add the `s.ToInvestigate` label and assign a team member (can be yourself) to the issue. This assignee will be tasked to confirm the issue's validity, not to resolve the issue. There is no need to comment any further until the assignee confirms the validity of the issue.
     * An issue should not be left as `s.ToInvestigate` for too long without valid reason. If the assignee does not show any activity for at least **3 days**, assign it to somebody else.
1. Is the issue suitable? Not all issues are equal; sometimes, a valid issue does not fit well into the project's best interest.
   * Yes: continue to the next step.
   * No: to be dealt on a case-by-case basis. Possible actions include closing the issue, applying `s.OnHold` label and revisiting the issue in the future, or simply accepting the issue with low priority. In any case, leave a comment to explain the rationale of such action.
1. Accept the issue by categorizing:
   * For messages directed to the team, add the label `c.Message`, and post a comment if you can respond or know someone who can. If the message is about help requests, add the label `a-DevHelp` as well.
   * For other types of issues, add the category labels as appropriate.
     * Issues marked as `c.Message` and `c.Release` are exempted from all other labels.
     * If an issue is at priority `p.High` or higher, labels `good first issue` and `help wanted` cannot be applied to it.

### Closing an issue

An issue can be closed without a resolution if:

* The issue is a message and either has been resolved with no loose ends left, or has no more activity for at least **7 days** after the last post in the issue thread and not pending any response from the team.
* The issue is a duplicate of an existing issue.
* The issue was opened in the past and is no longer relevant in the present.
* The team has decided that the issue is not suitable to be worked on, e.g. not in line with the project's interest.

In any case, leave a comment to explain why the issue is closed without resolution.

## PR management

### Choosing a reviewer

* When a new PR comes in, assign a reviewer for the PR based on the related issue's labels and team members' expertise. Try to load-balance when assigning reviewers.
* If a reviewer does not show any activity in **2 days**, post a reminder. If the reviewer still does not show any activity for the next **1 day**, assign another reviewer.

### Closing a PR

A PR can be closed without merging if:
* The PR addresses something that has been fixed.
* The PR addresses something that needs not be fixed.
* The PR addresses an issue labelled `good first issue` and is authored by a contributor who has committed code to the main repository before.
* The author does not address the review comments after **7 days**.
* The author is not acting in the project's best interest, e.g. resisting review comments, not following project guidelines.

In any case, leave a comment to explain why the PR is closed without merging.

### Reverting a PR

There may be situations where a merged PR needs to be reverted, e.g. when the PR has an unintended side effect that is difficult to fix or the PR was incomplete but accidentally merged.

For example, to revert the PR `#3944` (`Remove unnecessary System.out.printlns from Java files #3942`):
* No issue needs to be opened for this.
* There should only be one commit, which can be auto-generated with `git revert 1234567` (replace `1234567` with the appropriate commit SHA). A conflict resolution may be necessary.
* PR title: Duplicate the first line of the reversion commit message. (e.g. `Revert "[#3942] Remove unnecessary System.out.printlns from Java files (#3944)"`).
* PR description: `Reverts #...` (e.g. `Reverts #3944`).
* Merge with "Rebase and merge" option.
* Re-open the issue once the reversion is merged.
* The reverted PR and the reversion PR should not be included in any milestone if the reverted PR does not belong in any released version.

## Release management

**Roles: Release Lead (RL), Project Manager (PM)**

### Making a release

**Role: RL**

New releases are made every set period of time (typically every week), in which new set of features and bug fixes are deployed for the users.

* Before release day:
  * [Create an issue for the release](https://github.com/TEAMMATES/teammates/issues/new?template=release.md) to announce the scheduled release time.
  * Update the "about page" with the names of new contributors, if any.
  * Check if any schema change is needed for this release. If so, inform PM that this release requires maintainance mode and generate Liquibase changelog (refer to [Schema Migration](#schema-migration)).
* Release day:
  * Ensure all PRs included in the release are tagged with the correct milestone, correct assignee(s), and appropriate `c.*` label.
  * Ensure all schema change is captured in the Liquibase changelog.
  * Merge `release` branch with `master` branch and tag the release with format `V{major}.{minor}.0` (e.g. `V8.0.0`).
  * Close the current milestone and create a new milestone for the next + 1 release.
  * Announce the release via GitHub release feature as well as the release issue in the issue tracker. Be sure to credit all who contributed to the release in one way or another.
  * Assign PM to the "Release" issue.

> **When to increase the major version number?**
>
> Increase the major version number at your discretion; usually it is done when an underlying framework on the system changes.
> For example, version 5 was when Bootstrap was adopted as the UI framework, and version 6 was when Java 8 and Google Cloud SDK were adopted as the development tools.

**Role: PM**

1. Pull the latest `release` branch.
2. If schema change is needed, follow the steps for PM in [Schema Migration](#schema-migration)
3. Deploy to the live server.
4. Get live green, or otherwise all test failures need to be accounted for.
5. Make the version default.
6. Close the "Release" issue.

## Making a hot patch

Hot patches are releases containing fix for critical issues that severely affect the application's functionality.
It is released on a necessity basis, typically no more than a few days after latest release.

**Role: RL**

* Tag the release with format `V{major}.{minor}.{patch}` (e.g. `V8.0.1`).
* Close the milestone for the patch release and announce via GitHub release feature only. Be sure to credit all who contributed in one way or another.
* Inform PM the hot patch is ready for deployment.
* After the last hot patch of the proper release, merge the `release` branch back to the current `master` branch.

**Role: PM**

The PM's actions are the same as when [making a release](#making-a-release), minus the "Closing the release issue" part.

> Note: sometimes, a hot patch is added on top of the `master` branch (i.e. the `master` branch is still clean since the latest proper release).
> In that case, it is also appropriate to follow the standard release procedure for the hot patch.

## Other tasks

### Security vulnerabilities

Security vulnerabilities, once reported and confirmed, should be treated as a candidate for hot patch (i.e. fixed in the soonest possible time directly on the `release` branch).

Since the detail of such vulnerability cannot be disclosed until it is fixed, an issue can be created just before a PR for the fix is submitted, with minimal information (e.g. simply "Security vulnerability" as an issue with no further description).
The complete details can be filled in just before merging and/or after the fix is deployed.

### Schema migration
Schema migration is necessary when tables/ columns are amended/ added. Refer to TEAMMATES repo [docs/schema-migration.md](https://github.com/TEAMMATES/teammates/tree/master/docs/schema-migration.md)

**Role: RL**
Note on release number: Since Liquibase runs changelogs in alphanumeric order e.g `db.changelog-v9.0.0.beta.2.xml` will run after `db.changelog-v9.0.0.beta.11.xml`
* Follow dev guide to create new changelog with name `db.changelog-<release_number>.xml`. The previous release is the base and the new release is the target branch.
* Manually add a new changeset to the bottom of changelog file, to tag the database (Refer to [official liquibase documentation](https://docs.liquibase.com/change-types/tag-database.html)).
* Ensure new changelog is in `src/main/resources/db/changelog` and add it as the last entry in `src/main/resources/db/changelog/db.changelog-root.xml` (note changelogs are executed alphanumerically - careful if adding suffixes)
* Notify PM of schema change for them to run on production database.

**Role: PM**
* In `gradle.properties` amend the fields `liquibaseDbUrl`,  `liquibaseUsername` and `liquibasePassword` to match the IP and the username and password for the role (i.e. super user) used to run command on Cloud SQL
* Run `./gradlew liquibaseUpdateToTag -PliquibaseCommandValue="<release-num>"`

### Data migration

Data migration is necessary when changes that are incompatible with the prevailing data storage schema (afterwards "breaking changes") are introduced.

A data migration is initiated by the developer working on the breaking changes and will be handed over to the core team once both the breaking changes and the data migration script(s) are merged.

An issue for data migration should have been created after the breaking changes are merged. If not, [create the data migration issue](https://github.com/TEAMMATES/teammates/issues/new?template=data-migration.md).

**Role: RL**

* Release and deploy the new version containing the breaking changes following the normal release workflow. It may be a normal release or a hot patch release.
* Update the status of data migration in the issue accordingly and assign it to the PM.

**Role: PM**

* (Optional but recommended) Wait for some time to ascertain that the system is stable under the new data schema.
* Run the data migration script on the live site.
* Update the status of data migration in the issue accordingly and assign it to the RL.

**Role: RL**

* Remove the code that is specifically tailored for the old data schema or assign an active team member to do it.
  * While this may be a suitable beginner-level issue, in the interest of keeping as few legacy code in the code base as possible, it should be done by a team member with a minimum delay.
* Close the data migration issue.

### Dependencies update

The third-party dependencies/libraries should be updated periodically (e.g. once every 3-6 months) in order to benefit from fixes developed by the library developers.

To find which dependencies need update, you can use libraries like [`Gradle Versions Plugin`](https://plugins.gradle.org/plugin/com.github.ben-manes.versions) and [`npm-check-updates`](https://www.npmjs.com/package/npm-check-updates).

* Not all updates are important/relevant; it is up to the team's discretion on what needs to be updated and what not, and when to update.
* Only stable versions (i.e. non-beta and non-alpha) should be considered. `rc` versions can be considered at the team's discretion.
* Updates with little to no breaking changes should be included in the periodic mass update; otherwise, an issue to update a specific dependency should be created.

### Timezone database update

The timezone databases `moment-timezone-with-data.min.js` for the front-end and `tzdb.dat` for the back-end should be updated when [IANA releases a new timezone database version](https://www.iana.org/time-zones). 

`TimezoneSyncerTest.java` will ensure the above timezone databases are consistent and up-to-date.

To update the front-end timezone database:

1. We use the JSON file from the [moment-timezone](https://github.com/moment/moment-timezone) project. There are two possible scenarios here: either the desired timezone data has been generated or not.
   1. If it has been generated, the generated file can be used directly.
   1. If it has not been generated:
      1. Setup the project locally with the help of their [developer guide](https://github.com/moment/moment-timezone/blob/develop/contributing.md#contributing).
      1. Use `grunt data` to build the project with the latest IANA timezone data.
      1. The result file can be found in `data/packed/latest.json`.
1. Copy the relevant file and override `src/web/data/timezone.json` in TEAMMATES. You may need to modify the file slightly e.g. to fix coding style.

To update the back-end timezone database:

1. Follow the instructions on [`tzupdater`](https://www.oracle.com/java/technologies/javase/tzupdater-readme.html) to update the timezone database in the local JRE.
1. Copy the updated `$JAVA_HOME/jre/lib/tzdb.dat` and override the `tzdb.dat` in the project.

To check the updates are successful, run `TimezoneSyncerTest.java`.

### Branch management

Ideally, only two branches should exist in the main repository:

* `master` to contain the latest stable code.
* `release` to contain the copy of the code running on the live server.

The usage of any other branch should be accounted for, and the branches should be deleted as soon as they are no longer needed.

#### Using a long-lived feature branch

There may be times where a major feature development/refactoring necessitates a long-lived branch to be used to contain all the changes before merging everything to `master` branch in one go.

For the usage of such a branch, the following practices should be observed:

* There should be at least one team member in charge of the branch.
* The first commit of the branch should be allowing CI to run on that branch. This can be done by modifying the relevant GitHub Actions configurations in `.github/workflows`.
* Keep this long-lived branch in sync with `master` periodically. Syncing should be done strictly by rebasing in order to preserve all the individual commits and to keep the commit history linear.
  * The team member(s) in charge will be responsible for syncing with the `master` branch, including resolving conflicts.
* When the long-lived branch is ready to be merged to the `master` branch:
  * Rebase with the latest `master` branch and get rid of the commit which explicitly allows CI run.
  * Submit a PR and get it merged as per the usual procedure.
    * The PR title and issue number can be a dummy, but keep the PR title as informative as possible.
    * Reviews can be skipped if the individual commits/PRs are sufficiently reviewed.

### Community membership

To welcome a new committer:

* Add the GitHub user to the `Committers` team.

Subsequent promotions are done by moving the member's name to the appropriate section in the "about page".

To welcome a new project lead:

* Add the GitHub user to the `Team-leads` team.

When someone's tenure as committer or team member has passed:

* Do NOT revoke the team membership, unless voluntarily done by the past member him/herself.
  * For project leads, remove him/her from the `Team-leads` team to ensure that the elevated access is not present for longer than necessary.
* Move the past member's name to the appropriate section in the "about page".

### Beginner-level issues

Ensure that there is a healthy supply of `good first issue`-labelled issues and `help wanted`-labelled issues to last for at least **7 days** considering the activity level at that point of time.

Possible source for such issues:

* Documentation-only changes
* Fixing typo
* Removing unused methods or classes
* Minor refactoring
* Adding missing tests
* Adding minor new feature or enhancement
