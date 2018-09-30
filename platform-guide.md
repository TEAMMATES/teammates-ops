# Platform Guide

This document details the operations where Google Cloud Platform is involved.

* [Deploying to a staging server](#deploying-to-a-staging-server)
* [Setting up Gmail API credentials](#setting-up-gmail-api-credentials)

The instructions in all parts of this document work for Linux, OS X, and Windows, with the following pointers:
- Replace `./gradlew` to `gradlew.bat` if you are using Windows.
- All the commands are assumed to be run from the root main project (not the ops project) folder, unless otherwise specified.

## Deploying to a staging server

1. Create your own app on GAE.<br>
   Suggested app identifier: `teammates-yourname` (e.g `teammates-john`).<br>
   The eventual URL of the app will be like this: `https://teammates-john.appspot.com`.<br>
   Subsequent instructions will assume that the app identifier is `teammates-john`.

1. [Authorize your Google account to be used by the Google Cloud SDK](https://cloud.google.com/sdk/docs/authorizing) if you have not done so.
   ```sh
   gcloud auth login
   ```
   Follow the steps until you see `You are now logged in as [...]` on the console.

1. Modify configuration files.
   * `src/main/resources/build.properties`<br>
     Edit the file as instructed in its comments.
   * `src/main/webapp/WEB-INF/appengine-web.xml`<br>
     Modify to match app name and app id of your own app, and the version number if you need to. Do not modify anything else.

1. Deploy the application to your staging server.
   * With command line
     * Run the following command:

       ```sh
       ./gradlew appengineDeployAll
       ```
     * Wait until you see all the following messages or similar on the console:
       * `Deployed service [default] to [https://6-0-0-dot-teammates-john.appspot.com]`
       * `Cron jobs have been updated.`
       * `Indexes are being rebuilt. This may take a moment.`
       * `Task queues have been updated.`
     * You can also deploy individual configurations independently as follows:
       * Application: `./gradlew appengineDeploy`
       * Cron job configuration: `./gradlew appengineDeployCron`
       * Datastore indexes: `./gradlew appengineDeployIndex`
       * Task queue configuration: `./gradlew appengineDeployQueue`
   * With Eclipse
     * Refer to [this guide](https://cloud.google.com/eclipse/docs/deploying) to deploy your application.
   * With IntelliJ
     * Refer to [this guide](https://cloud.google.com/tools/intellij/docs/deploy-std#deploying_to_the_standard_environment) to deploy your application.

1. (Optional) Set the version you deployed as the "default":
   * Go to App Engine dashboard: `https://console.cloud.google.com/appengine?project=teammates-john`.
   * Click `Versions` under `Main` menu on the left bar.
   * Tick the checkbox next to the deployed version and select `Migrate Traffic`. Wait for a few minutes.
   * If you do not wish to set the deployed version as the default, you can access the deployed app using
     `https://{version}-dot-teammates-john.appspot.com`, e.g `https://6-0-0-dot-teammates-john.appspot.com`.

## Setting up Gmail API Credentials

[Gmail API](https://developers.google.com/gmail/api/) can be used to access Gmail accounts.
You may need Gmail API credentials e.g. for testing against production server.

1. Go to [Google Cloud Console](https://console.cloud.google.com/), select your TEAMMATES project if it is not selected and click `API Manager`.\
   Click `ENABLE API`.\
   Click `Gmail API` under `G Suite APIs` and then click `ENABLE`.
1. Alternatively, you can use [Gmail API Wizard](https://console.cloud.google.com/start/api?id=gmail) to enable `Gmail API`.
1. Click `Credentials` in the menu of the `API Manager`.
1. Click `Create credentials` and then select `OAuth client ID`.
1. Choose `Other`, give it a name, e.g. `teammates` and click `Create`. You will then get shown your client ID details, click `OK`.
1. Click the `Download JSON` icon.
