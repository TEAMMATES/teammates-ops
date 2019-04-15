# Continuous Profiling in TEAMMATES

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

This report gives a brief overview of the profiling operations performed on TEAMMATES. It gives an outline of the
problem and describes the reasons behind our proposed solution.

## Problem

TEAMMATES is one of the biggest student projects in the open source community. Currently, TEAMMATES boasts of a community comprising over 450 developers and a codebase 
of nearly 130LoC. Maintaining such a project demands high quality standards to ensure long term survival. This means, 
continuously monitoring code health and product performance. As the number of developers and user base continue to grow,
we need to ensure optimal performance at all times. In this report, we propose a viable solution to perform regression 
tests that will help developers keep a track of the potential bottlenecks and areas of optimizations. This will help
boost the performance as the product evolves over time.

## Overview of Solution

The idea behind L&P tests is to simplify the process of understanding production performance and enable the developers to address bottlenecks before they become genuine production issues.
Implementing these tests involves a few key points:-

* A tool/software to help perform these tests
* A database to store the data of the profiler
* A way of generating reports to help developers understand the metrics

After carefully considering various tools, we decided to use [Apache JMeter](https://jmeter.apache.org/) to help run the performance tests.
In this report we will discuss the reasons behind why we chose JMeter and a more detailed description of our implementation.


## Tools considered for Performance Testing

## Reasons for using JMeter



## Current implementation of the solution

JMeter offers us a couple of ways to perform the tests. We had the choice of performing these tests with automating tools like [jmeter-gradle plugin](https://github.com/jmeter-gradle-plugin/jmeter-gradle-plugin)
and the [JMeter Java API](https://jmeter.apache.org/api/index.html). We explored both possibilities but ended up using the JMeter Java API.

The JMeter-gradle-plugin along with the JMX files had a few issues. Firstly, it is not well maintained and does not have easy-to-find documentation. The existing resources are outdated and are not in sync with 
the latest version of JMeter. On the other hand, we found the JMeter Java API to fit well with TEAMMATES' backend testing framework.
It is also easier to integrate into the CI pipeline with a TestNG gradle task. The entire process is more coherent while allowing the same level of configuration.

A brief description of the process:-

* Create a test json and csv file for the test.
    * Since the data files are large (at least 5 times the size of `*UiTest.json` files with at least 100s of entities), they are deleted and not committed to the repo. This way, we can easily change the scale of the test without having to rewrite the code for generating the data.

* Create the JMeter test and run.
    * Each test configures the test plan, similar to how it is done in the GUI. We also considered using a Builder pattern, but it didn’t make complete sense to do so (since we can’t say for sure what the components of the class are, and what order they should be in). Instead, we have created abstractions and default configurations which make it easier to create new tests.

* We then display summarised results for that endpoint and also determine the failure threshold criteria.

A more detailed overview of the tasks performed can be seen in the [Continuous Profiling Project page](https://github.com/teammates/teammates/projects/7).

## Findings and Recommendations

## Future Work

We need to fine-tune the L&P test parameters and set suitable thresholds for failure. These should align with the goals of the application.
