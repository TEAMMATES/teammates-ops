# TEAMMATES Maintenance and Operations Guide

[![Build Status](https://travis-ci.com/TEAMMATES/teammates-ops.svg?branch=master)](https://travis-ci.com/TEAMMATES/teammates-ops)

This is the maintenance web site for TEAMMATES. It consists of documentations and several sub-projects necessary for keeping TEAMMATES running.

## Documentations

* The [**developer community structure**](community.md).
* [**Maintainer Guide**](maintainer-guide.md): regular tasks for core team members to keep the project moving.
* [**Platform Guide**](platform-guide.md): Google Cloud Platform-specific instructions, e.g. deployment.

## Tool Stack

Here are the tools used for TEAMMATES development/operations:

* [Google App Engine Java, Standard Environment](https://cloud.google.com/appengine/docs/standard/java/) as the underlying framework and platform. Additionally, we use the following GCP services (either through GAE internal APIs or our own setup):
  * [Google Cloud Datastore](https://cloud.google.com/datastore/) as the database
  * [Google Cloud Storage](https://cloud.google.com/storage) as the binary file storage
  * [Google Cloud Tasks](https://cloud.google.com/tasks/) as the background task scheduler
  * [Google Cloud Scheduler](https://cloud.google.com/scheduler/) as the cron job scheduler
  * [Google Cloud Logging](https://cloud.google.com/logging/) for application logs
  * [Google Cloud Trace](https://cloud.google.com/trace/) for performance and latency monitoring
* [SendGrid](https://sendgrid.com/) as the primary email sending service.
* GitHub for hosting [code](https://github.com/TEAMMATES/teammates), [issue tracker](https://github.com/TEAMMATES/teammates/issues), [code patches](https://github.com/TEAMMATES/teammates/pulls), as well as [project management](https://github.com/TEAMMATES/teammates/projects)
* [![Travis Build Status](https://travis-ci.org/TEAMMATES/teammates.svg?branch=master)](https://travis-ci.org/TEAMMATES/teammates) Travis CI for building/testing in Linux environment
* [![AppVeyor Build Status](https://ci.appveyor.com/api/projects/status/dvr6t33lqg6hsmxw/branch/master?svg=true)](https://ci.appveyor.com/project/damithc/teammates/branch/master) AppVeyor CI for building/testing in Windows environment
* [![Codecov Coverage Status](https://codecov.io/gh/TEAMMATES/teammates/branch/master/graph/badge.svg)](https://codecov.io/gh/TEAMMATES/teammates) Codecov for hosting code coverage reports

## Sub-projects

- [Release script](release-script): automates many tasks related to releasing a new version
- [GitHub Bot](github-bot): automates some GitHub interactions
