## Part Two - The Future of Observability
For this exercise you will work through troubleshooting scenarios using Grafana Cloud Asserts! The idea here is to show you some things you can't do with the other tools you looked at in the first hands on lab, but also to show you how you can do some of those activities even easier with Asserts.

### Instructions
Go to the URL in the slides where you will have access to the Grafana Cloud Stack with Asserts.

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together.
 
Answers are in the [breakout_2_answers](./breakout_2_answers) folder, however we encourage you to try to work through the questions on your own first!

### Questions

Section 1:
1. Which service looks to be in the worst state? Why?
1. How many application services are connected to the productcatalog service?
1. How many pods does the cart service have?
1. Which namespace is everything deployed in?
1. What looks to be the first event that caused the issue? 
1. Which service started having errors first? 
1. Which version of Redis is deployed?

Great! 

Section 2:
To really understand why Asserts is awesome, try and solve these same questions without using it as you did with the apps in breakout 1. Let us know how you do :) 

Some interesting ones to try:
1. How much memory is assigned to the product catalog service workload?
1. What error rate percentage has the productcatalog service reached over the last 24 hours?
1. What error message is the productcatalog service throwing when it errors in the last 24 hours?
1. Which endpoint or endpoints are erroring within the productcatalog service over the last 24 hours?
