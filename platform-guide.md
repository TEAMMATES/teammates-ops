# Platform Guide

This document details the operations where Google Cloud Platform is involved.

* [Deploying to a staging server](#deploying-to-a-staging-server)
* [Setting up Google Cloud Storage](#setting-up-google-cloud-storage)
* [Running client scripts](#running-client-scripts)
* [Setting up Gmail API credentials](#setting-up-gmail-api-credentials)
* [Datastore backup and recovery](#datastore-backup-and-recovery)

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
     Edit the file as instructed in its comments. In particular, modify the app ID field to match the ID of your own app.
   * `src/main/webapp/WEB-INF/appengine-web.xml`<br>
     Modify if necessary, e.g. to change App Engine instance type and/or to set static resources cache expiration time.

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

## Setting up Google Cloud Storage

Some features that require blob/binary data storage (as opposed to structured data storage), such as profile pictures, use Google Cloud Storage.

Refer to [this guide](https://cloud.google.com/appengine/docs/standard/java/googlecloudstorageclient/setting-up-cloud-storage#activating_a_cloud_storage_bucket) in order to activate a bucket for your staging server.

## Running client scripts

In order to run client scripts against a production environment, you need to authorize your account for [Application Default Credentials](https://developers.google.com/identity/protocols/application-default-credentials).

```sh
gcloud auth application-default login
```

Follow the steps until you see `Credentials saved to file: [...].` printed on the console.

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

## Datastore backup and recovery

Google Cloud Datastore provides [managed export/import](https://cloud.google.com/datastore/docs/export-import-entities) as a means of backup and recovery.

### Backup

The backup has been configured to run weekly in the system by setting `app.enable.datastore.backup=true` in `src/main/resources/build.properties`.
However, a few prerequisites as described [here](https://cloud.google.com/datastore/docs/schedule-export#before_you_begin) need to be done first.

If you wish to do backup outside the scheduled period, you can simply trigger the backup cron job manually from the GCP console.

### Recovery

In order to import a snapshot into the Datastore:

1. Ensure that all the prerequisites described [here](https://cloud.google.com/datastore/docs/export-import-entities#before_you_begin) are done.
1. Authenticate and set your project ID (e.g. if your project ID is `teammates-john`):

   ```sh
   gcloud auth login
   gcloud config set project teammates-john
   ```

1. Locate the backup snapshot which you want to use.
   1. Go to your Cloud Storage backup folder: `https://console.cloud.google.com/storage/browser/teammates-john-backup/datastore-backups/?project=teammates-john`.
      * The above URL is constructed based on the preset values in `build.template.properties`. In your usage, replace the appropriate values accordingly.
   1. Note down the backup folder name (this is in the form of timestamp) which you want to use. The snapshot URL will be in the form of `gs://teammates-john-backup/datastore-backups/{folder}/{folder}.overall_export_metadata`.

1. Run the following command to import the snapshot:

   ```sh
   gcloud datastore import {snapshotUrl}
   ```

   e.g.:

   ```sh
   gcloud datastore import gs://teammates-john-backup/datastore-backups/2018-11-28T18:43:38.595Z/2018-11-28T18:43:38.595Z.overall_export_metadata
   ```
