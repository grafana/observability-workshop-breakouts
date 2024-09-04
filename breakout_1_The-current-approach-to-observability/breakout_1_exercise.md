## Part 1 - Current Approach to Observability
For this exercise you will work through troubleshooting scenarios using various Grafana Cloud Observabilitty Applications that we have discussed.

### Instructions
Go to the following site where you will have access to the following Grafana Cloud Applications:
1. Frontend O11y
1. App O11y
1. K8s

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together. 
Answers are in the [breakout_1_answers](./breakout_1_answers) folder, however we encourage you to try to work through the questions on your own first!

### Questions
Frontend O11y
1. Which pages have errors?
1. What are the errors?

App O11y
1. What percentage does the productcatalog service error rate get up to?
1. What languages are used for this demo app? 
1. What error message is the product catalog service throwing when it errors?
1. Which endpoint is erroring within the product catalog service?
1. What services interact with the recommendation service?
1. What’s the pod name running the product catalog service?

K8s
1. How many restarts has the product catalog service had? 
1. What image name and version is being used for the product catalog service?
1. How much memory and CPU is assigned to the product catalog service?
1. Is the product catalog service over or under sized on memory and CPU?
1. What’s the recommendation for the CPU and memory of the product catalog service?
1. How much memory is allocated in the k8s cluster? 
1. How many cores does the k8s cluster have allocated? 
1. What’s the total energy usage of the k8s cluster?
1. What’s the cost of the k8s cluster?
