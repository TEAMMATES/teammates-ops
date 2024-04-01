# Platform Guide

This document details the operations where Google Cloud Platform (GCP) is involved.

* [Deploying to a staging server](#deploying-to-a-staging-server)
* [Setting up Authentication](#setting-up-authentication)
  * [Setting up OAuth 2.0 client](#setting-up-oauth-20-client)
  * [Setting up Firebase Authentication](#setting-up-firebase-authentication)
* [Setting up Google Cloud Storage](#setting-up-google-cloud-storage)
* [Setting up Google Cloud SQL](#setting-up-google-cloud-sql)
* [Setting up Google VPC](#setting-up-google-vpc)
* [Setting up Solr](#setting-up-solr)
* [Running client scripts](#running-client-scripts)
* [Setting up Gmail API credentials](#setting-up-gmail-api-credentials)
* [Datastore backup and recovery](#datastore-backup-and-recovery)

The instructions in all parts of this document work for Linux, OS X, and Windows, with the following pointers:
- Replace `./gradlew` to `gradlew.bat` if you are using Windows.
- All the commands are assumed to be run from the root main project (not the ops project) folder, unless otherwise specified.

## Deploying to a staging server

Note: This document does not have preference over either GAE standard or flexible environment. It is your duty to decide on the environment you will be using based on your needs.

1. The deployment uses [Google Cloud SDK](https://cloud.google.com/sdk/docs/install), which requires Python 3 (recommended) or Python 2.7. Install it if you have not done so.

1. Create your own project on GCP.<br>
   This instruction will use `teammates-john` as the project identifier.<br>
   The eventual URL of the app will be like this: `https://teammates-john.appspot.com`.

1. Enable the following APIs in your project:
   - [Cloud Tasks API](https://console.cloud.google.com/apis/library/cloudtasks.googleapis.com)
   - [Cloud Scheduler API](https://console.cloud.google.com/apis/library/cloudscheduler.googleapis.com)

1. Create the [SQL instance on GCP](#setting-up-google-cloud-sql), and enable `Private IP`.

1. [Authorize your Google account to be used by the Google Cloud SDK](https://cloud.google.com/sdk/docs/authorizing) if you have not done so.
   ```sh
   gcloud auth login
   ```
   Follow the steps until you see `You are now logged in as [...]` on the console.

1. Modify configuration files.
   1. `src/main/resources/build.properties`<br>
   Edit the file as instructed in its comments. In particular:
      * Modify the app ID field to match the ID of your own project 
      * Modify the Postgres Host (`Private IP`) and Password
      * Modify if necessary, [OAuth 2.0 client ID used for authentication](#setting-up-oauth-20-client).
   1. `src/main/appengine/app.yaml`<br>
      * Modify the `vpc_access_connector` field to specify your project's VPC connector.
      * Modify if necessary, e.g. to change App Engine instance type (standard env), to set static resources cache expiration time (standard env), to set required CPU/memory resources (flexible env), to configure liveness check (flexible env), or to set automatic scaling policies.
   1. `src/web/environments/config.ts`<br>
      * Modify if necessary, e.g. to change the version number displayed to user. Note that this modification needs to be done before building the front-end files.

1. Ensure that the front-end files have been built.
   * You can refer to the TEAMMATES [developer documentation](https://teammates.github.io/teammates/development.html#building-front-end-files) on building front-end files.

1. (Optional but recommended) If you are deploying the application only for testing purpose, it is highly recommended to not deploy the cron jobs as they will necessitate the application to have 100% uptime (thereby unnecessarily charging instance cost). You can achieve this in two different ways:
   * Use a deployment command that does not deploy the cron job. Details can be found in the next section.
   * Remove all cron job entries in `src/main/appengine/cron.yaml` before running the deployment command.

1. Deploy the application to your staging server.
   * Run the following command:

     ```sh
     # Creates the application on GCP
     gcloud app create

     # Deploy to standard env
     ./gradlew appengineDeployAll

     # Deploy to flex env
     ./gradlew appengineDeployAll -Pflex
     ```
   * Wait until you see all the following messages or similar on the console:
     * `Deployed service [default] to [https://8-0-0-dot-teammates-john.appspot.com]`
     * `Cron jobs have been updated.`
     * `Indexes are being rebuilt. This may take a moment.`
     * `Task queues have been updated.`
   * You can also deploy individual configurations independently as follows:
     * Application: `./gradlew appengineDeploy` (or `./gradlew appengineDeploy -Pflex`)
     * Cron job configuration: `./gradlew appengineDeployCron`
     * Datastore indexes: `./gradlew appengineDeployIndex`
     * Task queue configuration: `./gradlew appengineDeployQueue`

1. (Optional) Set the version you deployed as the "default":
   * Go to App Engine dashboard: `https://console.cloud.google.com/appengine?project=teammates-john`.
   * Click `Versions` on the left bar.
   * Tick the checkbox next to the deployed version and select `Migrate Traffic`. Wait for a few minutes.
   * If you do not wish to set the deployed version as the default, you can access the deployed app using
     `https://{version}-dot-teammates-john.appspot.com`, e.g `https://8-0-0-dot-teammates-john.appspot.com`.

## Setting up Authentication

Two forms of authentication are supported: Google OAuth 2.0 and Firebase. You are free to decide which one to use based on your needs.

### Setting up OAuth 2.0 Client

1. Go to [Google Cloud APIs & Services Credentials console](https://console.cloud.google.com/apis/credentials).
1. Click `Create credentials` and then select `OAuth client ID`.
1. Choose `Web Application` and give the client a name (the exact name does not matter).
1. Under `Authorised redirect URIs`, add the following URLs:
   * Your app URL + `/oauth2callback?ngsw-bypass=true`, e.g. `https://teammates-john.appspot.com/oauth2callback?ngsw-bypass=true`.
   * If you want to test this in your dev server, you also need to add `http://localhost:8080/oauth2callback?ngsw-bypass=true`.
   * Note that the redirect URIs are exact and only work for the URIs specified, without wildcards, version number specifier, etc. If you want to allow redirect for specific version (e.g. `https://8-0-0-dot-teammates-john.appspot.com`), you need to add the entry `https://8-0-0-dot-teammates-john.appspot.com/oauth2callback?ngsw-bypass=true` to the list of URIs.
1. Click `Create`. You will be shown the client ID and client secret; save both information for later.


### Setting up Firebase Authentication

1. Go to [Firebase console](https://console.firebase.google.com/).
1. Create a Firebase project:
   1. Click `Add project`.
   1. Enter a project name, e.g. `teammates-john`, and click `Continue`. You can also choose to use your TEAMMATES application's project name.
   1. Optionally, check `Enable Google Analytics for this project`, and click `Continue`.
   1. Click `Continue` upon successful project creation.
1. Set up Firebase Authentication:
   1. Click on the `Authentication` tile.
   1. Under the `Sign-in method` tab, enable the sign-in methods to be supported, e.g. `Google` and `Email/Password`.
      1. Click `Google`.
         1. Check `Enable`.
         1. Select a project support email.
         1. Click `Save`.
      1. Click `Add new provider`, and click `Email/Password`.
         1. Check `Enable` for `Email/Password`.
         1. Check `Enable` for `Email link (passwordless sign-in)`.
         1. Click `Save`.
   1. Under the `Settings` tab, add your application domain (e.g. `teammates-john.appspot.com`) in the list of `Authorised domains`.
1. Register your web app with Firebase:
   1. Go to `Project settings` (the gear icon at the sidebar next to `Project Overview`).
   1. Under the `General` tab, in the `Your apps` section, click on the `Web` icon (looks like `</>`).
   1. Enter an app nickname, e.g. `teammates-john`, and click `Register app`.
   1. Copy the `firebaseConfig` and paste it into `environment.ts`.
   1. Click `Continue to console`.
1. Set up Firebase Service Account:
   1. In `Project settings`, under the `Service accounts` tab, click `Generate new private key`.
   1. Copy the generated file to `src/main/resources/firebase-credentials.json` in TEAMMATES.

## Setting up Google Cloud SQL

Beginning with V9, Cloud SQL is the main database that is being used.

To create the SQL instance:

1. Go to <https://console.cloud.google.com/sql/instances> and enable the `Compute Engine API` if prompted.
1. Create an instance, and choose `PostgreSQL`, with the following configurations:
   1. Instance ID: any name of your choice
   1. Password: any password of your choice
   1. Cloud SQL Edition: `Enterprise`, as staging will not require `Enterprise Plus` features.
   1. (Optional but recommended) Preset for Edition: `Sandbox`, to save on hosting costs.
   1. Region: the region of your GAE application.
   1. (Optional but recommended): Click `Show Configuration Options` and configure the smallest machine to save on hosting costs.
1. Click `Save` to create the instance.

To connect the SQL instance with the staging or production environment, we will need to set-up private IP:

1. Select your instance, and click `Connections` on the left-side bar.
1. Click the `Networking` tab, and enable `Private IP`.
1. Select the `(default)` VPC Network, and click `Set Up Connection`:
   1. Enable the `Serverless VPC Access API`
   1. Under `Allocate an IP range`, click `Use an automatically allocated IP range`.
   1. Click `Continue` and `Create Connection`
1. Continue to connect the staging or production environment to the VPC in the [setting up Google VPC section](#setting-up-google-vpc)

(Optional) To connect your favorite database tool to query the staging environment's SQL database:

Do note that certain educational institute networks may block connections with GCP. If blocked, do try again with an alternate Wifi connection.

1. Select your instance, and click `Connections` on the left-side bar.
1. Click the `Networking` tab, and make sure `Public IP` is enabled. 
1. Add your own public IP under `Authorized networks` to whitelist your IP.
1. Click `Save` on the bottom of the page.
1. Create a connection on your database tool:
   1. `Host` being the SQL instance's `Public IP`.
   1. `Database` should be default `postgres`
   1. `Port` should be default `5432`
   1. `Username` should be default `postgres`
   1. `Password` should your password that you've set when creating the SQL instance.

(Optional, but highly recommended for production) Create a lower-privileged user to be used for the application.
The default 'postgres' user has [all privileges turned on](https://www.postgresql.org/docs/15/ddl-priv.html). We should create a 'production_user' with only CRUD abilities for production.

1. On your database tool, connect to your SQL instance.
2. Replace the password with your preferred password. In the following code, we will assume that the user created is called 'production_user'. Run the following script:
```sql
-- Creates the user
CREATE USER production_user WITH
	PASSWORD 'password'
	NOCREATEDB;

-- Grants CRUD for all existing tables 
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO production_user;

-- Grants CRUD for all future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO production_user;
```

3. To verify that the user has successfully been granted privileges, we can run the following too.
```sql
SELECT * from information_schema.role_table_grants where grantee='production_user';
```

## Setting up Google Cloud Storage

Some features that require blob/binary data storage (as opposed to structured data storage), such as profile pictures, use Google Cloud Storage.

By default, when you create a Google App Engine instance, you will get a bucket named `{your-app-id}.appspot.com`. If you do not wish to use this default bucket, you are free to [create other buckets](https://cloud.google.com/storage/docs/creating-buckets).

## Setting up Google VPC Connector

[Serverless VPC access](https://cloud.google.com/vpc/docs/serverless-vpc-access) allows our different services to communicate via internal private IP address, instead of public IP addressing. By default, you should already have a VPC network created called (default).

Serverless VPC access requires connectors to be created and configured:

1. Enable [Serverless VPC Access API](https://console.cloud.google.com/marketplace/product/google/vpcaccess.googleapis.com) for your project.
1. Go to <https://console.cloud.google.com/networking/connectors/list> and select `Create Connector`.
1. Create a connector with the following configuration:
   - Name: any name of your choice
   - Region: the region of your GAE application
   - Network: `default` (this should be the default created VPC created automatically)
   - Subnet: `Custom IP range`
   - IP range: `10.8.0.0`
   - All other settings can be modified as necessary.
1. In `app.yaml`, add the following lines:
   ```yml
   vpc_access_connector:
     name: projects/{projectId}/locations/{projectRegion}/connectors/{name}
   ```
1. If needed, re-deploy the application after the above change.

## Setting up Solr

We are using [Apache Solr](https://solr.apache.org/) to support full-text searches, such as looking up for students/instructors by name or by course.

To enable usage of Solr, we deploy a single Solr instance within [Google Compute Engine](https://cloud.google.com/compute) and build a [VPC connector](https://cloud.google.com/vpc/docs/serverless-vpc-access) to allow connection from the Google App Engine application.

The steps to create the Solr instance are as follows:
1. Go to [Google Compute Engine console](https://console.cloud.google.com/compute/instances) and click `Create Instance`.
1. Create a VM with the following configuration:
   - Name: any name of your choice
   - Region, zone: the region of your GAE application
   - Machine configuration: as necessary. To get the cheapest possible machine, select `General Purpose > N1 > g1-small`.
     - There are cheaper machine types such as `f1-micro`, however they do not have the amount of memory required for Solr to run. `g1-small` is the cheapest possible machine type that is able to comfortably run Solr.
   - Boot disk: as necessary. To get the cheapest possible disk, use 10 GB `Standard persistent disk`.
     - Note that the instruction will assume that the OS used is `Debian`.
   - Firewall: Disallow both HTTP and HTTPS traffic
   - All other settings can remain as per default.
1. Click `Create` and wait until the VM is booted. Note down the internal IP address.
1. SSH into the VM.
1. Run all the commands inside [the setup file](scripts/solr-setup.sh) followed by [the configuration file](https://github.com/TEAMMATES/teammates/blob/master/solr/solr.sh), in order.
   - While doing the above, note down your username inside the VM and the directory in which Solr is installed.
   - The next step will assume username of `john` and Solr installation directory of `/home/john/solr-8.11.1`.
1. Add the following custom metadata to the VM:
   - Key: `startup-script`
   - Value:
     ```sh
     #! /bin/bash
     sudo -u john /home/john/solr-8.11.1/bin/solr start
     ```
1. Stop and restart the VM.
1. In `build.properties`, set the value of `app.search.service.host` to the internal IP address plus the port number (should be `8983` unless you specifically use other port) plus `/solr`, e.g. `http://10.128.0.1:8983/solr`.

After the above operation, you will have a running VM with a Solr instance running in it, and have configured your application to connect to it via internal IP address. This is not sufficient as the VM instance is not accessible by public web. However, that is not the intended outcome either; you only want the VM to be accessible by your deployed application and nothing else.

Note: If you are deploying to GAE flexible environment, this step is not required and can be skipped.

To fix that, you need to build a VPC connector. The steps to create the VPC connector can be found at the [VPC section](#setting-up-google-vpc)

## Running client scripts

In order to run client scripts against a production environment, you need to authorize your account for [Application Default Credentials](https://developers.google.com/identity/protocols/application-default-credentials).

```sh
gcloud auth application-default login
```

Follow the steps until you see `Credentials saved to file: [...].` printed on the console.

## Setting up Gmail API Credentials

[Gmail API](https://developers.google.com/gmail/api/) can be used to access Gmail accounts.
You may need Gmail API credentials for testing against production server, particularly if you are testing that the emails are sent by the system.

1. Enable [Gmail API](https://console.cloud.google.com/marketplace/product/google/gmail.googleapis.com) for your project.
1. Create an OAuth 2.0 client to be used by the tests. The step is very similar to creating OAuth 2.0 client for user authentication in the production system, with the following differences:
   * The client application type will be `Desktop app`.
1. After creating the client, download the JSON file corresponding to the client setup. You will need this file for later.

## Datastore backup and recovery

Google Cloud Datastore provides [managed export/import](https://cloud.google.com/datastore/docs/export-import-entities) as a means of backup and recovery.

### Backup

The backup has been configured to run monthly in the system by setting `app.enable.datastore.backup=true` in `src/main/resources/build.properties`.
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
