# Performance Testing in TEAMMATES

Authors: [Ronak Lakhotia](https://github.com/RonakLakhotia), [Amrut Prabhu](https://github.com/amrut-prabhu) and [Jacob Li PengCheng](https://github.com/jacoblipech)

* [Introduction](#Introduction)
* [Problem](#Problem)
* [Overview of the Proposed Solution](#Overview-of-Solution)
* [Tools considered for Performance Testing](#Tools-considered-for-Performance-Testing)
* [Reasons for using JMeter](#Reasons-for-using-JMeter)
* [Current implementation of the solution](#current-implementation-of-the-solution)
* [Findings and Recommendations](#findings-and-recommendations)
* [Future Work](#Future-work)

## Introduction

This report gives a brief overview of the profiling operations performed on TEAMMATES.  In particular, it includes a detailed discussion of the Load and Performance (L&P) testing framework and justification for our solution.

## Problem

TEAMMATES is one of the biggest student projects in the open source community. As of April 2019, TEAMMATES boasts a developer community of over 450 contributors and a codebase with ~130 KLoC. 
Maintaining such a project demands high quality standards to ensure long term survival. 
This means, continuously monitoring code health and product performance. As the number of developers and user base continue to grow, we need to ensure optimal performance at all times.
To do so, we need to be able to identify performance issue-prone operations with a quantitative measure so that they can be rectified.

## Overview of Solution

The idea behind L&P tests is to simplify the process of understanding production performance. The idea behind L&P tests is to simplify the process of understanding production performance and enable the developers to address bottlenecks before they become genuine production issues.
Implementing these tests involves a few key points:

* A tool/software to help performing these tests.
* A method to simulate a large number of users and send requests to a target server.
* A way of generating reports to help developers understand the metrics.

After carefully considering various tools, we decided to use [Apache JMeter](https://jmeter.apache.org/) to help running the performance tests.
In this report we will discuss the reasons behind why we chose JMeter and a more detailed description of our implementation.

## Tools considered for Performance Testing

Some of the tools that we considered before deciding on JMeter were:

* [Gatling](https://gatling.io/)
* [LoadRunner](https://www.guru99.com/introduction-to-hp-loadrunner-and-its-archtecture.html)
* [BlazeMeter](https://www.blazemeter.com/)
 
## Reasons for using JMeter

One of the main reasons we use JMeter over the other tools was the **extensive documentation** we found online. There are a number of resources to help you get started. Some of which we have listed below:

* [JMeter Tutorial for beginners](https://www.guru99.com/jmeter-tutorials.html)
* [How to use JMeter](https://www.blazemeter.com/blog/how-use-jmeter-assertions-three-easy-steps)
* [The official website](https://jmeter.apache.org/usermanual/build-web-test-plan.html) also offers a good documentation on how to get started.

Some other reasons why we found JMeter to be useful:

**Open Source** -  JMeter is an open source software. This means that it can be downloaded free of cost. The developer can use its source code, can modify and customize it as per their requirement.

**Ease of Integration** - It is easier to integrate JMeter into the project because of the [JMeter Java API](https://jmeter.apache.org/api/index.html). There is also a [jmeter-gradle plugin](https://github.com/jmeter-gradle-plugin/jmeter-gradle-plugin) if you want to make it a part of your build process.

**Roust Reporting** - JMeter can generate the effective reporting. The test result can be visualized by using Graph, Chart, and Tree View. JMeter supports different formats for reporting like text, XML, HTML and JSON.

## Current implementation of the solution

JMeter offers us a couple of ways to perform the tests. We had the choice of performing these tests with automating tools like jmeter-gradle plugin and the JMeter Java API. 
We explored both possibilities but ended up using the JMeter Java API. Some key observations we made:

* The jmeter-gradle-plugin is not well maintained and does not have easy-to-find documentation. 
* The existing resources are outdated and are not in sync with the latest version of JMeter.
* The JMeter Java API, on the other hand, fits well with TEAMMATES' backend testing framework.
* It is also easier to integrate it into the CI pipeline with a TestNG gradle task. 
* The entire process is more coherent while allowing the same level of configuration.

A brief description of the process:

* Create a test json and csv file for the test.
    * Since the data files are large (at least 5 times the size of test data used for E2E tests), they are not committed to the repo. This way, we can easily change the scale of the test without having to rewrite the code for generating the data.

* Create the JMeter test and run.
    * Each test configures the test plan, similar to how it is done in the GUI. We also considered using a Builder pattern, but it didn’t make complete sense to do so (since we can’t say for sure what the components of the class are, and what order they should be in). Instead, we have created abstractions and default configurations which make it easier to create new tests.

* Determine the failure threshold criteria and display the summarised results for that endpoint.

* Delete the entities and data files created.

A more detailed overview of the tasks performed can be seen in the [Continuous Profiling Project page](https://github.com/teammates/teammates/projects/7).

## Findings and Recommendations

## Future Work

We need to fine-tune the L&P test parameters and set suitable thresholds for failure. These should align with the goals of the application.
Currently login takes a lot of time (compared to student profile, at least). So, we can explore the idea of using a delay after login, and testing the endpoint after that.
