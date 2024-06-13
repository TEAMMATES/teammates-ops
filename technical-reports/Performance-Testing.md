# Performance Testing in TEAMMATES

Authors: [Ronak Lakhotia](https://github.com/RonakLakhotia), [Amrut Prabhu](https://github.com/amrut-prabhu) and [Jacob Li PengCheng](https://github.com/jacoblipech)

* [Introduction](#Introduction)
* [Why do we need Performance Testing?](#Why-do-we-need-Performance-Testing)
* [Overview of Proposed Solution](#Overview-of-Proposed-Solution)
* [Tools considered for Performance Testing](#Tools-considered-for-Performance-Testing)
* [Reasons for using JMeter](#Reasons-for-using-JMeter)
* [Current implementation of the solution](#current-implementation-of-the-solution)
* [Findings and Recommendations](#findings-and-recommendations)
* [Future Work](#Future-work)

## Introduction

This report gives a brief overview of the profiling operations performed on TEAMMATES.  In particular, it includes a detailed discussion of the Load and Performance (L&P) testing framework and the process we followed.

## Why do we need Performance Testing?

TEAMMATES is one of the biggest student projects in the open source community. As of April 2019, TEAMMATES boasts a codebase with ~130 KLoC. More importantly, it has over 350,000 users.
Maintaining such a project demands high quality standards to ensure long term survival. 
There are many factors that can cause degrading performance of the production software like increased number of database records, increased number of simultaneous requests to the server, and a larger number of users accessing the system at any given point.
It is important to continuously monitor code health and product performance in order to ensure optimal performance of the software at all times. To do so, we need to be able to identify performance issue-prone operations with a quantitative measure so that they can be rectified.

## Overview of Proposed Solution

The idea behind L&P tests is to simplify the process of understanding production performance and enable the developers to address bottlenecks before they become genuine production issues.
Implementing these tests involves a few key points:

* A tool/software to help performing these tests.
* A method to simulate a large number of users and send requests to a target server.
* A way of generating reports to help developers understand the metrics.

After carefully considering various tools, we decided to use [Apache JMeter](https://jmeter.apache.org/) to help running the performance tests.
In this report we will discuss the reasons behind why we chose JMeter and a more detailed description of our implementation.

## Tools considered for Performance Testing

Some of the tools that we considered before deciding on JMeter were:

* [Gatling](https://gatling.io/) - It has higher barrier to entry for potential contributors.
* [LoadRunner](https://www.guru99.com/introduction-to-hp-loadrunner-and-its-archtecture.html) - This is a licensed tool and cost of using it is high. LoadRunner has a lot of protocols, such as HTTP, Oracle and SAP.WEB., but we do not need those.
* [BlazeMeter](https://www.blazemeter.com/) - The reports generated by BlazeMeter are basic as compared to JMeter. Also, the free version of the tool has limited functionalities.
 
## Reasons for using JMeter

One of the main reasons we use JMeter over the other tools was the **extensive documentation** we found online. There are a number of resources to help one to get started, some of which are:

* [JMeter Tutorial for beginners](https://www.guru99.com/jmeter-tutorials.html)
* [How to use JMeter](https://www.blazemeter.com/blog/how-use-jmeter-assertions-three-easy-steps)
* [The official website](https://jmeter.apache.org/usermanual/build-web-test-plan.html)

Some other reasons why we found JMeter to be useful:

**Open Source** -  JMeter is an open source software. This means that it can be downloaded free of cost. The developers can use its source code, can modify and customize it as per their requirement.

**Ease of Integration** - It is easier to integrate JMeter into the project because of the [JMeter Java API](https://jmeter.apache.org/api/index.html).

**Robust Reporting** - JMeter can generate effective reporting. The test results can be visualized by using Graph, Chart, and Tree View. JMeter supports different formats for reporting like text, XML, HTML and JSON.

## Current implementation of the solution

JMeter offers us a couple of ways to perform the performance tests. We had the choice of performing these tests with automating tools like [jmeter-gradle plugin](https://github.com/jmeter-gradle-plugin/jmeter-gradle-plugin) and the JMeter Java API. 
We explored both possibilities but ended up using the JMeter Java API. Some key observations we made:

* The jmeter-gradle-plugin is not well maintained and does not have easy-to-find documentation. The existing resources are outdated and are not in sync with the latest version of JMeter. 
* The JMeter Java API, on the other hand, fits well with TEAMMATES' backend testing framework. It is also easier to integrate it into the CI pipeline with a TestNG gradle task.
* With the JMeter Java API, the entire process is more coherent while allowing the same level of configuration.

A brief description of the process:

* Determine the failure threshold criteria for the test according to which endpoint is being tested.

* Create the test files for the endpoint.
    * The purpose of the test files is to store data that is needed to test the endpoints. With the data stored in these files we can parameterize HTTP requests and simulate multiple users accessing the endpoint being tested. 
    * Since the data files are large (at least 5 times the size of test data used for E2E tests), they are not committed to the repo. This way, we can easily change the scale of the test without having to rewrite the code for generating the data.

* Create the JMeter test and run.
    * Each test file configures the test plan, similar to how it is done in the GUI. We also considered using Builder pattern, but it did not make complete sense to do so (since we cannot say for sure what the components of the class are, and what order they should be in). Instead, we have created abstractions and default configurations which make it easier to create new tests.

* Display the summarised results for that endpoint.

* Delete the entities and data files created.

A more detailed overview of the tasks performed can be seen in the [Continuous Profiling Project page](https://github.com/teammates/teammates/projects/7).

## Findings and Recommendations

Currently, the performance issue-prone operations in TEAMMATES are as follows:

* Instructor page: Enrolling students

* Instructor page: Viewing feedback session results by instructor

* Student page: Submitting a feedback session when the number of questions is large

Our aim is to test the performance of these endpoints extensively and get metrics such as latency, throughput and other relevant results.
This is still a work-in-progress as we are yet to consolidate the results but our goal is to generate reports that will help the developers understand the performance of each endpoint. 

## Future Work

We need to fine-tune the L&P test parameters and set suitable thresholds for failure. These should align with the goals of the application.
Currently, logging in takes a lot of time (compared to student profile, at least). So, we can explore the idea of using a delay after logging in, and testing the endpoint after that.

We can also explore elements like Timers and JSON Extractors. By synchronizing, Timer JMeter **Spike Testing** can be achieved.