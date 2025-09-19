## Part 3 - Observability with AI
#### How to find the same root cause with your friendly neighborhood Grafana Assistant
For this exercise you will work through troubleshooting scenarios from the previous sections, however this time using AI tools, specifically [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/), to find the solution.

### Instructions
You will use the __same environment as part 1__ for this exercise. Go to the URL in the slides that references to the part 1 environment where you will have access to the Grafana Cloud Stack with:
1. Frontend O11y
1. App O11y
1. K8s Monitoring

Navigate to the indicated app in each section, then click on the Grafana Assistant button in the upper right hand corner to get started. The same prompt window can and should be used for a section for context and question continuity.
![grafana-assistant](/images/breakout_3/0.1-grafana-assistant.png)

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together for the final 10 minutes. Please prioritize the core questions, and if time work through the extra credit.

Answers and guidance on how to get to the answer are in the [breakout_3_answers](./breakout_3_answers) folder, however we encourage you to try to work through the questions on your own first!

___NOTE___: Due to the variable nature of an LLM assistant, the results will not always look the same between users or match what we found in previous exercises. 

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
2. What image and version is being used for the productcatalog service?
3. Is the productcatalog service right sized? 
- ___Extra Credit___
   
    4. What namespace is my app deployed in?
    5. What resources does my k8s cluster have?
    6. What is the energy my k8s cluster uses?

**Query Span Metrics**
1. What languages are used for my app deployed in that namespace?
2. Are my services healthy?
3. What's going on with the productcatalog service?

- ___Extra Credit___ 

    4. What interacts with the productcatalog service? Any downstream issues?
    5. What version of postgres is deployed in my app?
