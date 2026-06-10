---
sidebar_position: 2
---

# 3.2. Query Kubernetes Monitoring data

Open a **new conversation** with Assistant for this section.

---

## Question 1 - Container health

What's the health of my containers?

<details className="answer-reveal">
<summary>Show answer</summary>

Assistant highlights containers with repetitive restarts, bad k8s events, and errors - `productcatalogservice`, `recommendationservice`, and `checkoutservice` show concerning health.

![Container health response](/img/lab3/2.1-grafana-assistant-1.png)

</details>

---

## Question 2 - Image and version

What image and version is being used for the `productcatalogservice`?

<details className="answer-reveal">
<summary>Show answer</summary>

`productcatalogservice:v3.24.5`

![Prompt](/img/lab3/2.2-grafana-assistant-1.png)
![Answer](/img/lab3/2.2-grafana-assistant-2.png)

</details>

---

## Question 3 - Right-sized?

Is the `productcatalogservice` right-sized?

<details className="answer-reveal">
<summary>Show answer</summary>

![Right-sizing response](/img/lab3/2.3-grafana-assistant-1.png)

</details>

---

## Question 4 - Namespace - extra credit

What namespace is my app deployed in?

<details className="answer-reveal">
<summary>Show answer</summary>

Your main application is deployed in the **`ecommerce-prod`** namespace.

![Namespace response](/img/lab3/2.4-grafana-assistant-1.png)

</details>

---

## Question 5 - Cluster resources - extra credit

What resources does my k8s cluster have?

<details className="answer-reveal">
<summary>Show answer</summary>

```
Kubernetes cluster resource summary
Here's a comprehensive overview of your sedemoditl-cluster resources:

🏗️ Cluster architecture
Node configuration:

3 nodes with identical specifications
AWS EC2 instances (ARM-based architecture)
Distributed across 3 availability zones: us-east-1a, us-east-1b, us-east-1c
OS: Amazon Linux 2023.8.20250818
Kubernetes version: v1.33.3-eks-3abbec1

💾 Total cluster capacity
Compute resources:

Total CPU: 6 cores (2 cores per node)
Total Memory: 11.22 GB (~4 GB per node)
System overhead: 3.5% CPU reserved for Kubernetes system components

Storage & networking:

Ephemeral storage: ~21.4 GB per node
Container runtime: containerd 1.7.27
Network: Private IPs in 10.0.x.x range

📊 Pod capacity
Maximum pods: 330 total (110 per node)
Current allocatable: 330 pod slots available
```

![Prompt](/img/lab3/2.5-grafana-assistant-1.png)
![Findings 1](/img/lab3/2.5-grafana-assistant-2.png)
![Findings 2](/img/lab3/2.5-grafana-assistant-3.png)
![Answer](/img/lab3/2.5-grafana-assistant-4.png)

</details>

---

## Question 6 - Custom rule - extra credit

Try creating a rule (just for you) that indicates you're only interested in applications and infrastructure in the `ecommerce-prod` namespace. Then open a new conversation and ask "Tell me about what's deployed".

<details className="answer-reveal">
<summary>Show answer</summary>

If this works, asking the follow-up question and expanding any tool call should show the filter `namespace=ecommerce-prod`.

Opening the rules page:

![Rules page](/img/lab3/2.6-grafana-assistant-1.png)

Click **Create rule**:

![Create rule](/img/lab3/2.6-grafana-assistant-2.png)

Adding the custom rule:

![Adding custom rule](/img/lab3/2.6-grafana-assistant-3.png)

The rule in action:

![Rule in action](/img/lab3/2.6-grafana-assistant-4.png)

</details>
