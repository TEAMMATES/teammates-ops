# TEAMMATES Maintenance and Operations Guide

[![GitHub Actions Build Status Tests](https://github.com/TEAMMATES/teammates-ops/workflows/Tests/badge.svg)](https://github.com/TEAMMATES/teammates-ops/actions)

This is the maintenance web site for TEAMMATES. It consists of documentations and several sub-projects necessary for keeping TEAMMATES running.

## Documentations

* The [**developer community structure**](community.md).
* [**Maintainer Guide**](maintainer-guide.md): regular tasks for core team members to keep the project moving.
* [**Platform Guide**](platform-guide.md): Google Cloud Platform-specific instructions, e.g. deployment.

## Tool Stack

Here are the tools used for TEAMMATES development/operations:

* [Google App Engine Java, Standard Environment](https://cloud.google.com/appengine/docs/standard/java/) as the underlying framework and platform. Additionally, we use the following GCP services:
  * [Google Cloud Datastore](https://cloud.google.com/datastore/) as the database
  * [Google Cloud Storage](https://cloud.google.com/storage) as the binary file storage
  * [Google Cloud Tasks](https://cloud.google.com/tasks/) as the background task scheduler
  * [Google Cloud Scheduler](https://cloud.google.com/scheduler/) as the cron job scheduler
  * [Google Cloud Logging](https://cloud.google.com/logging/) for application logs
  * [Google Cloud Trace](https://cloud.google.com/trace/) for performance and latency monitoring
* [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2) for user authentication
* [SendGrid](https://sendgrid.com/) as the primary email sending service.
* [Apache Solr](https://solr.apache.org/) running in [Google Compute Engine](https://cloud.google.com/compute) as the full-text search service
* GitHub for hosting [code](https://github.com/TEAMMATES/teammates), [issue tracker](https://github.com/TEAMMATES/teammates/issues), [code patches](https://github.com/TEAMMATES/teammates/pulls), as well as [project management](https://github.com/TEAMMATES/teammates/projects)
* [![GitHub Actions Build Status Component Tests](https://github.com/TEAMMATES/teammates/workflows/Component%20Tests/badge.svg)](https://github.com/TEAMMATES/teammates/actions) [![GitHub Actions Build Status E2E Tests](https://github.com/TEAMMATES/teammates/workflows/E2E%20Tests/badge.svg)](https://github.com/TEAMMATES/teammates/actions) GitHub Actions for building/testing
* [![Codecov Coverage Status](https://codecov.io/gh/TEAMMATES/teammates/branch/master/graph/badge.svg)](https://codecov.io/gh/TEAMMATES/teammates) Codecov for hosting code coverage reports

## Sub-projects

- [Release script](release-script): automates many tasks related to releasing a new version
- [GitHub Bot](github-bot): automates some GitHub interactions
