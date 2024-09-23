## Part 1 - Current Approach to Observability
For this exercise you will work through troubleshooting scenarios using various Grafana Cloud Observabilitty Applications that we have discussed so that you can get a good understanding of how to use these tools.

### Instructions
Go to the URL in the slides where you will have access to the Grafana Cloud with:
1. Frontend O11y
1. App O11y
1. K8s Monitoring

You will have 20 minutes to work through the questions, after which we will regroup to work through everything together for the final 10 minutes.

Answers and guidance on how to get to the answer are in the [breakout_1_answers](./breakout_1_answers) folder, however we encourage you to try to work through the questions on your own first!

### Questions
[Frontend O11y](https://cfdb56.grafana.net/a/grafana-kowalski-app/apps/479/overview?var-show_lab_data=false&from=now-1h&to=now)
1. How many page loads have there been in the last 1 hour?
1. What is the value of the first contentful pain core web vital over the past 1 hour? 
1. In the last 1 hour which pages have errors?
1. [Optional] What are an three example of some of the errors over the last 1 hour?

[App O11y](https://cfdb56.grafana.net/a/grafana-app-observability-app/services?var-prometheus=grafanacloud-prom&var-loki=grafanacloud-logs&var-tempo=grafanacloud-traces&var-environmentValue=$__all&var-filterBy=serviceNamespace%7C%3D%7Cditl-demo-prod&from=now-1h&to=now&instrumentedFilter=all&sortFilterId=serviceName)
1. What languages are used for this demo app? 
1. What error rate percentage has the productcatalog service reached over the last 1 hour?
1. What error message is the productcatalog service throwing when it errors?
1. Which endpoint or endpoints are erroring within the productcatalog service?
1. What services interact with the recommendation service?
1. [Optional] What's the pod name running the product catalog service?

[K8s](https://cfdb56.grafana.net/a/grafana-k8s-app/home?from=now-1h&to=now&refresh=1m&var-cluster=%24__all&var-datasource=grafanacloud-cfdb56-prom&var-loki=grafanacloud-cfdb56-logs&var-namespace=%24__all)
1. How many restarts has the productcatalog service had? 
1. What image name and version is being used for the productcatalog service?
1. How much memory is assigned to the product catalog service?
1. Is the product catalog service over or under sized on memory?
1. What's the recommendation for memory of the product catalog service?
1. [Optional] How much memory and CPU are allocated in the k8s cluster? 
1. [Optional] What's the total energy usage of the k8s cluster?
1. [Optional] What's the cost of the k8s cluster per month?
