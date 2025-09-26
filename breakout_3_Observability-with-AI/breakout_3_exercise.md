## Part 3 - Observability with AI
#### How to find the same root cause with your friendly neighborhood Grafana Assistant
For this exercise you will work through troubleshooting scenarios from the previous sections, however this time using AI tools, specifically [Grafana Assistant](https://grafana.com/docs/grafana-cloud/machine-learning/assistant/), to find the solution.

### Instructions
You will use the __same environment as part 1__ for this exercise. Go to the URL in the slides that references to the part 1 environment where you will have access to the Grafana Cloud Stack with:
1. Frontend O11y
1. App O11y
1. K8s Monitoring

Click on the Grafana Assistant button in the upper right hand corner to get started. Use the same prompt window for each section below for context and question continuity. We recommend starting a new prompt window when you change between each section though so you can see how Assistant proceses your requests. In the real world, you'd keep the same prompt for a line of questioning / investigation though.
![grafana-assistant](/images/breakout_3/0.1-grafana-assistant.png)

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together for the final 10 minutes. Please prioritize the core questions, and if time work through the extra credit.

Answers and guidance on how to get to the answer are in the [breakout_3_answers](./breakout_3_answers) folder, however we encourage you to try to work through the questions on your own first!

___NOTE___: Due to the variable nature of an LLM assistant, the results will not always look the same between users or match what we found in previous exercises. If Assistant doesn't do want you want it to do, prompt it some more to nudge it in the right direction.

### Things to look out for

When you see: **Tool usage in Assistant**

* LLMs can hallucinate, so we show all the working  
* Click to expand \- you can see what Assistant is thinking so you can trust its conclusions

When you see: **An error in the Assistant**

* Assistant makes mistakes like humans. We give that error back to the LLM so it can reconsider and iterate.  
* If Grafana Assistant truly can’t come to a conclusion, it’ll usually tell you that (but only after trying for a long time).

When you see: **A graph or logs visualisation**

* Assistant uses Grafana’s visualisation library to \_show\_ you things, rather than just telling you.  
* This builds trust and breaks up the wall-of-text that LLMs are famous for

When you see: **Suggested next step buttons**

* Most of the time, Assistant will suggest follow-up questions or actions, or you can just prompt again.

## Questions
**Query Frontend O11y Data**

Please note that engineering is currently working on a specialist tool for frontend o11y integrating with Grafana Assistant, so results may vary! 
1. Looking at my frontend app ditl-demo-frontend-client, how many page loads have there been in the last few hours?
1. Do any of those pages have errors?
- ___Extra Credit___
    1. What's the LCP over the past few hours? Any bad pages?
    1. What's the most common error? 

**Query K8s Monitoring Data**

Open a new conversation with Assistant
1. What's the health of my containers?
2. What image and version is being used for the productcatalog service?
3. Is the productcatalog service right sized? 
- ___Extra Credit___
   
    4. What namespace is my app deployed in?
    5. What resources does my k8s cluster have?
    6. What is the energy my k8s cluster uses?

**Query Span Metrics**

Open a new conversation with Assistant
1. Are my services healthy?
2. What interacts with the productcatalog service? Any downstream issues?
- ___Extra Credit___ 

    3. What version of postgres is deployed in my app?
    4. What's going on with the productcatalog service?
