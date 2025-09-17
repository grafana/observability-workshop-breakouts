## Part 3 - Root Cause Analysis with AI
#### How to find the same root cause with your friendly neighbourhood Grafana Assistant
For this exercise you will work through troubleshooting scenarios from the previous sections, however this time using AI tools, specifically [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/), to find the solution.

### Instructions
Go to the URL in the slides where you will have access to the Grafana Cloud Stack with:
1. Frontend O11y
1. App O11y
1. K8s Monitoring

Navigate to the indicated app in each section, then click on the Grafana Assistant button in the upper right hand corner to get started.
![grafana-assistant](/images/breakout_3/0.1-grafana-assistant.png)

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together for the final 10 minutes.

Answers and guidance on how to get to the answer are in the [breakout_3_answers](./breakout_3_answers) folder, however we encourage you to try to work through the questions on your own first!

___NOTE___: Due to the stochastic nature of an LLM assistant, the results will not always look the same between users or match what we found in previous exercises. 

### Questions
**Query Frontend O11y Data**
- Navigate to the Frontend O11y App in Grafana
- Click into the `ditl-demo-frontend-client` frontend app
![frontend-app](/images/breakout_1/0.1-frontend-instructions.png)
1. How many page loads have there been in the last few hours in my web app?
1. What's the LCP over the past few hours? Any bad pages?
1. Any pages have any errors?
1. What's the most common error? 

**Query K8s Monitoring Data**
- Navigate to the Kubernetes Monitoring App in Grafana
![k8s-monitoring](/images/breakout_1/0.3-k8s-instructions.png)
1. What's the health of my containers?
1. What image and version is being used for the product catalog service?
1. How much memory is assigned to the product catalog service?
1. Is the product catalog service right sized? 
1. What resources does my k8s cluster have?
1. What is the energy my k8s cluster uses?
1. What's the cost of my k8s clusters?
1. What namespace is my app deployed in?

**Query Span Metrics**
1. What languages are used for my app deployed in that namespace?
1. Are my services healthy?
1. What's going on with the productcatalog service?

**General**
1. What interacts with the product catalog service? Any downstream issues?
1. My productcatalogservice is angry, what's going on? 
1. What version of postgres is deployed in my app?
