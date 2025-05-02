## Part 1 - Current Approach to Observability
For this exercise you will work through troubleshooting scenarios using various Grafana Cloud Observabilitty Applications that we have discussed so that you can get a good understanding of how to use these tools.

### Instructions
Go to the URL in the slides where you will have access to the Grafana Cloud Stack with:
1. Frontend O11y
1. App O11y
1. K8s Monitoring

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together for the final 10 minutes.

Answers and guidance on how to get to the answer are in the [breakout_1_answers](./breakout_1_answers) folder, however we encourage you to try to work through the questions on your own first!

### Questions
Frontend O11y
1. How many page loads have there been in the last 1 hour?
1. What is the value of the largest contentful paint core web vital over the past 1 hour? 
1. In the last 1 hour which pages have errors?
1. [Optional] What are three example of some of the errors over the last 1 hour?

App O11y
1. What languages are used for this demo app? 
1. What error rate percentage has the productcatalog service reached over the last 1 hour?
1. What error message is the productcatalog service throwing when it errors?
1. Which endpoint or endpoints are erroring within the productcatalog service?
1. What services interact with the recommendation service?
1. [Optional] What's the pod name running the product catalog service?

K8s
1. How many restarts has the productcatalog service had? 
1. What image name and version is being used for the productcatalog service?
1. How much memory is assigned to the product catalog service?
1. Is the product catalog service over or under sized on memory?
1. What's the recommendation for memory of the product catalog service?
1. [Optional] How much memory and CPU are allocated in the k8s cluster? 
1. [Optional] What's the total energy usage of the k8s cluster?
1. [Optional] What's the cost of the k8s cluster per month?
